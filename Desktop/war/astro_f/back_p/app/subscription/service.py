from app.db.mongo import get_database
from app.subscription.models import SubscriptionPlan, UserSubscription, PaymentRecord, SubscriptionStatus, PaymentStatus
from bson import ObjectId
from datetime import datetime, timedelta
from typing import Optional, List
import hashlib
import hmac
import os
import logging

# Optional Razorpay import
try:
    import razorpay
    RAZORPAY_AVAILABLE = True
except ImportError:
    razorpay = None
    RAZORPAY_AVAILABLE = False

logger = logging.getLogger(__name__)

class SubscriptionService:
    def __init__(self):
        self.db = None
        self.plans_collection = None
        self.subscriptions_collection = None
        self.payments_collection = None
        self.razorpay_client = None
        
    def _ensure_db(self):
        if self.db is None:
            self.db = get_database()
            self.plans_collection = self.db.subscription_plans
            self.subscriptions_collection = self.db.user_subscriptions
            self.payments_collection = self.db.payment_records
            
            # Initialize Razorpay client
            key_id = os.getenv("RAZORPAY_KEY_ID")
            key_secret = os.getenv("RAZORPAY_KEY_SECRET")
            
            if key_id and key_secret and RAZORPAY_AVAILABLE:
                self.razorpay_client = razorpay.Client(auth=(key_id, key_secret))
            else:
                self.razorpay_client = None
                if not RAZORPAY_AVAILABLE:
                    logger.warning("Razorpay module not available. Install with: pip install razorpay")
    
    async def get_all_plans(self) -> List[SubscriptionPlan]:
        """Get all active subscription plans"""
        self._ensure_db()
        
        cursor = self.plans_collection.find({"is_active": True}).sort("price_inr", 1)
        plans = []
        
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            plans.append(SubscriptionPlan(**doc))
        
        return plans
    
    async def get_plan_by_id(self, plan_id: str) -> Optional[SubscriptionPlan]:
        """Get subscription plan by ID"""
        self._ensure_db()
        
        doc = await self.plans_collection.find_one({"_id": ObjectId(plan_id)})
        if doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            return SubscriptionPlan(**doc)
        return None
    
    async def create_subscription_order(self, user_id: str, plan_id: str) -> dict:
        """Create Razorpay order for subscription"""
        self._ensure_db()
        
        # Get plan details
        plan = await self.get_plan_by_id(plan_id)
        if not plan:
            raise ValueError("Plan not found")
        
        # Create Razorpay order
        order_data = {
            "amount": int(plan.price_inr * 100),  # Amount in paise
            "currency": "INR",
            "receipt": f"sub_{user_id}_{plan_id}_{int(datetime.utcnow().timestamp())}",
            "notes": {
                "user_id": user_id,
                "plan_id": plan_id,
                "plan_name": plan.name
            }
        }
        
        if self.razorpay_client and RAZORPAY_AVAILABLE:
            try:
                razorpay_order = self.razorpay_client.order.create(order_data)
            except Exception as e:
                logger.error(f"Razorpay order creation failed: {str(e)}")
                # Fallback to test mode
                razorpay_order = {
                    "id": f"order_test_{int(datetime.utcnow().timestamp())}",
                    "amount": order_data["amount"],
                    "currency": "INR",
                    "status": "created"
                }
        else:
            # Fallback for testing without Razorpay
            logger.info("Using test mode for Razorpay (module not available or not configured)")
            razorpay_order = {
                "id": f"order_test_{int(datetime.utcnow().timestamp())}",
                "amount": order_data["amount"],
                "currency": "INR",
                "status": "created"
            }
        
        # Create subscription record
        subscription_data = {
            "user_id": user_id,
            "plan_id": plan_id,
            "status": SubscriptionStatus.PENDING,
            "start_date": datetime.utcnow(),
            "end_date": datetime.utcnow() + timedelta(days=plan.duration_days),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await self.subscriptions_collection.insert_one(subscription_data)
        subscription_id = str(result.inserted_id)
        
        # Create payment record
        payment_data = {
            "user_id": user_id,
            "subscription_id": subscription_id,
            "razorpay_order_id": razorpay_order["id"],
            "amount_inr": plan.price_inr,
            "status": PaymentStatus.PENDING,
            "payment_date": datetime.utcnow()
        }
        
        await self.payments_collection.insert_one(payment_data)
        
        return {
            "subscription_id": subscription_id,
            "razorpay_order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": "INR",
            "plan_name": plan.name,
            "key_id": os.getenv("RAZORPAY_KEY_ID", "rzp_test_fallback"),
            "test_mode": not RAZORPAY_AVAILABLE or not self.razorpay_client
        }
    
    async def verify_payment(self, payment_data: dict) -> bool:
        """Verify Razorpay payment signature"""
        self._ensure_db()
        
        try:
            # Verify signature
            key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
            
            if key_secret:
                generated_signature = hmac.new(
                    key_secret.encode(),
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
            
            # Update subscription status
            await self.subscriptions_collection.update_one(
                {"_id": ObjectId(payment_data["subscription_id"])},
                {
                    "$set": {
                        "status": SubscriptionStatus.ACTIVE,
                        "razorpay_subscription_id": payment_data["razorpay_payment_id"],
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Payment verification error: {str(e)}")
            return False
    
    async def get_user_subscription(self, user_id: str) -> Optional[UserSubscription]:
        """Get user's active subscription"""
        self._ensure_db()
        
        doc = await self.subscriptions_collection.find_one({
            "user_id": user_id,
            "status": SubscriptionStatus.ACTIVE,
            "end_date": {"$gt": datetime.utcnow()}
        })
        
        if doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            return UserSubscription(**doc)
        return None
    
    async def cancel_subscription(self, user_id: str, subscription_id: str) -> bool:
        """Cancel user subscription"""
        self._ensure_db()
        
        result = await self.subscriptions_collection.update_one(
            {
                "_id": ObjectId(subscription_id),
                "user_id": user_id
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
    
    async def get_all_subscriptions(self, skip: int = 0, limit: int = 100) -> List[dict]:
        """Get all subscriptions for admin"""
        self._ensure_db()
        
        pipeline = [
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "_id",
                    "as": "user"
                }
            },
            {
                "$lookup": {
                    "from": "subscription_plans",
                    "localField": "plan_id",
                    "foreignField": "_id",
                    "as": "plan"
                }
            },
            {"$skip": skip},
            {"$limit": limit},
            {"$sort": {"created_at": -1}}
        ]
        
        subscriptions = []
        async for doc in self.subscriptions_collection.aggregate(pipeline):
            user = doc["user"][0] if doc["user"] else {}
            plan = doc["plan"][0] if doc["plan"] else {}
            
            subscription = {
                "id": str(doc["_id"]),
                "user_email": user.get("email", "Unknown"),
                "user_name": user.get("name", "Unknown"),
                "plan_name": plan.get("name", "Unknown"),
                "price_inr": plan.get("price_inr", 0),
                "status": doc["status"],
                "start_date": doc["start_date"],
                "end_date": doc["end_date"],
                "auto_renew": doc.get("auto_renew", False)
            }
            subscriptions.append(subscription)
        
        return subscriptions
    
    async def get_payment_history(self, user_id: str) -> List[PaymentRecord]:
        """Get user's payment history"""
        self._ensure_db()
        
        cursor = self.payments_collection.find({"user_id": user_id}).sort("payment_date", -1)
        payments = []
        
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            payments.append(PaymentRecord(**doc))
        
        return payments