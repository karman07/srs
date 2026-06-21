from app.db.mongo import get_database
from app.razorpay.models import RazorpayPlan, RazorpaySubscription, PaymentRecord, SubscriptionStatus, PaymentStatus, PlanType
from app.config import settings
from bson import ObjectId
from datetime import datetime, timedelta
from typing import Optional, List
import hashlib
import hmac
import logging

try:
    import razorpay
    RAZORPAY_AVAILABLE = True
except ImportError:
    razorpay = None
    RAZORPAY_AVAILABLE = False

logger = logging.getLogger(__name__)

class RazorpayService:
    def __init__(self):
        self.db = None
        self.plans_collection = None
        self.subscriptions_collection = None
        self.payments_collection = None
        self.razorpay_client = None
        
    def _ensure_db(self):
        if self.db is None:
            self.db = get_database()
            self.plans_collection = self.db.razorpay_plans
            self.subscriptions_collection = self.db.razorpay_subscriptions
            self.payments_collection = self.db.razorpay_payments
            
            if settings.razorpay_key_id and settings.razorpay_key_secret and RAZORPAY_AVAILABLE:
                self.razorpay_client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))
            else:
                self.razorpay_client = None
                if not RAZORPAY_AVAILABLE:
                    logger.warning("Razorpay module not available")
    
    async def get_fallback_plans(self) -> List[RazorpayPlan]:
        """Get fallback plans when no subscription data exists"""
        return [
            RazorpayPlan(
                id="free_plan",
                name="Free Plan",
                price_inr=0.0,
                duration_days=30,
                features=["5 queries per day", "Basic astrology insights"],
                query_limit=5,
                plan_type=PlanType.FREE
            ),
            RazorpayPlan(
                id="premium_plan",
                name="Premium Plan",
                price_inr=settings.premium_plan_price_inr,
                duration_days=30,
                features=["Unlimited queries", "Advanced insights", "Priority support"],
                query_limit=None,
                plan_type=PlanType.PREMIUM
            )
        ]
    
    async def get_all_plans(self) -> List[RazorpayPlan]:
        """Get all active plans with fallback"""
        self._ensure_db()
        
        try:
            cursor = self.plans_collection.find({"is_active": True}).sort("price_inr", 1)
            plans = []
            
            async for doc in cursor:
                doc["id"] = str(doc["_id"])
                del doc["_id"]
                plans.append(RazorpayPlan(**doc))
            
            if not plans:
                logger.info("No plans found in database, using fallback plans")
                return await self.get_fallback_plans()
            
            return plans
        except Exception as e:
            logger.error(f"Error fetching plans: {str(e)}")
            return await self.get_fallback_plans()
    
    async def create_order(self, user_id: str, plan_id: str) -> dict:
        """Create Razorpay order"""
        self._ensure_db()
        
        # Get plan
        plan = await self.get_plan_by_id(plan_id)
        if not plan:
            raise ValueError("Plan not found")
        
        if plan.price_inr == 0:
            raise ValueError("Cannot create order for free plan")
        
        order_data = {
            "amount": int(plan.price_inr * 100),  # Convert to paise
            "currency": "INR",
            "receipt": f"order_{user_id}_{int(datetime.utcnow().timestamp())}",
            "notes": {
                "user_id": user_id,
                "plan_id": plan_id,
                "plan_name": plan.name
            }
        }
        
        if self.razorpay_client:
            try:
                razorpay_order = self.razorpay_client.order.create(order_data)
            except Exception as e:
                logger.error(f"Razorpay order creation failed: {str(e)}")
                razorpay_order = {
                    "id": f"order_test_{int(datetime.utcnow().timestamp())}",
                    "amount": order_data["amount"],
                    "currency": "INR",
                    "status": "created"
                }
        else:
            razorpay_order = {
                "id": f"order_test_{int(datetime.utcnow().timestamp())}",
                "amount": order_data["amount"],
                "currency": "INR",
                "status": "created"
            }
        
        # Create payment record
        payment_data = {
            "user_id": user_id,
            "razorpay_order_id": razorpay_order["id"],
            "amount_inr": plan.price_inr,
            "status": PaymentStatus.PENDING,
            "payment_date": datetime.utcnow()
        }
        
        await self.payments_collection.insert_one(payment_data)
        
        return {
            "order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": "INR",
            "key_id": settings.razorpay_key_id or "rzp_test_fallback",
            "plan_name": plan.name,
            "test_mode": not self.razorpay_client
        }
    
    async def verify_payment(self, payment_data: dict, user_id: str) -> bool:
        """Verify payment and create subscription"""
        self._ensure_db()
        
        try:
            # Verify signature if not in test mode
            if settings.razorpay_key_secret:
                generated_signature = hmac.new(
                    settings.razorpay_key_secret.encode(),
                    f"{payment_data['razorpay_order_id']}|{payment_data['razorpay_payment_id']}".encode(),
                    hashlib.sha256
                ).hexdigest()
                
                if generated_signature != payment_data["razorpay_signature"]:
                    return False
            
            # Update payment record
            await self.payments_collection.update_one(
                {"razorpay_order_id": payment_data["razorpay_order_id"]},
                {
                    "$set": {
                        "razorpay_payment_id": payment_data["razorpay_payment_id"],
                        "status": PaymentStatus.SUCCESS,
                        "payment_date": datetime.utcnow()
                    }
                }
            )
            
            # Get payment record to find plan
            payment_record = await self.payments_collection.find_one(
                {"razorpay_order_id": payment_data["razorpay_order_id"]}
            )
            
            if payment_record:
                # Create subscription
                plan_id = payment_record.get("plan_id") or "premium_plan"
                plan = await self.get_plan_by_id(plan_id)
                
                subscription_data = {
                    "user_id": user_id,
                    "plan_id": plan_id,
                    "razorpay_subscription_id": payment_data["razorpay_payment_id"],
                    "status": SubscriptionStatus.ACTIVE,
                    "start_date": datetime.utcnow(),
                    "end_date": datetime.utcnow() + timedelta(days=plan.duration_days if plan else 30),
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                
                await self.subscriptions_collection.insert_one(subscription_data)
            
            return True
            
        except Exception as e:
            logger.error(f"Payment verification error: {str(e)}")
            return False
    
    async def get_plan_by_id(self, plan_id: str) -> Optional[RazorpayPlan]:
        """Get plan by ID with fallback"""
        self._ensure_db()
        
        try:
            if plan_id in ["free_plan", "premium_plan"]:
                fallback_plans = await self.get_fallback_plans()
                for plan in fallback_plans:
                    if plan.id == plan_id:
                        return plan
            
            doc = await self.plans_collection.find_one({"_id": ObjectId(plan_id)})
            if doc:
                doc["id"] = str(doc["_id"])
                del doc["_id"]
                return RazorpayPlan(**doc)
        except Exception as e:
            logger.error(f"Error getting plan: {str(e)}")
        
        return None
    
    async def get_user_subscription(self, user_id: str) -> Optional[RazorpaySubscription]:
        """Get user's active subscription"""
        self._ensure_db()
        
        try:
            doc = await self.subscriptions_collection.find_one({
                "user_id": user_id,
                "status": SubscriptionStatus.ACTIVE,
                "end_date": {"$gt": datetime.utcnow()}
            })
            
            if doc:
                doc["id"] = str(doc["_id"])
                del doc["_id"]
                return RazorpaySubscription(**doc)
        except Exception as e:
            logger.error(f"Error getting user subscription: {str(e)}")
        
        return None
    
    async def cancel_subscription(self, user_id: str) -> bool:
        """Cancel user's subscription"""
        self._ensure_db()
        
        try:
            result = await self.subscriptions_collection.update_one(
                {
                    "user_id": user_id,
                    "status": SubscriptionStatus.ACTIVE
                },
                {
                    "$set": {
                        "status": SubscriptionStatus.CANCELLED,
                        "auto_renew": False,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error cancelling subscription: {str(e)}")
            return False