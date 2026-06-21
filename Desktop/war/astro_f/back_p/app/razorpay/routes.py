from fastapi import APIRouter, HTTPException, status, Depends, Request
from app.razorpay.models import CreateOrderRequest, PaymentVerificationRequest, RazorpayPlan, WebhookEvent
from app.razorpay.service import RazorpayService
from app.auth.guards import require_user_or_admin, require_admin
from app.users.models import User
from app.users.service import UserService
from typing import List
import logging
import json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/razorpay", tags=["razorpay"])

@router.get("/plans", response_model=List[RazorpayPlan])
async def get_plans():
    """Get all available subscription plans (public endpoint)"""
    try:
        razorpay_service = RazorpayService()
        plans = await razorpay_service.get_all_plans()
        return plans
    except Exception as e:
        logger.error(f"Get plans error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve plans"
        )

@router.post("/create-order")
async def create_order(
    order_request: CreateOrderRequest,
    current_user: User = Depends(require_user_or_admin)
):
    """Create Razorpay order for subscription"""
    try:
        razorpay_service = RazorpayService()
        
        # Check if user already has active subscription
        existing_subscription = await razorpay_service.get_user_subscription(current_user.id)
        if existing_subscription:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has an active subscription"
            )
        
        order_data = await razorpay_service.create_order(current_user.id, order_request.plan_id)
        return order_data
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create order error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order"
        )

@router.post("/verify-payment")
async def verify_payment(
    payment_data: PaymentVerificationRequest,
    current_user: User = Depends(require_user_or_admin)
):
    """Verify Razorpay payment and activate subscription"""
    try:
        razorpay_service = RazorpayService()
        
        success = await razorpay_service.verify_payment(payment_data.dict(), current_user.id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment verification failed"
            )
        
        # Update user to premium
        user_service = UserService()
        await user_service.upgrade_to_premium(current_user.id)
        
        return {
            "message": "Payment verified and subscription activated",
            "status": "success",
            "plan_type": "premium"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verify payment error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify payment"
        )

@router.get("/my-subscription")
async def get_my_subscription(
    current_user: User = Depends(require_user_or_admin)
):
    """Get current user's subscription details with fallback"""
    try:
        razorpay_service = RazorpayService()
        
        subscription = await razorpay_service.get_user_subscription(current_user.id)
        
        if not subscription:
            # Fallback to free plan
            return {
                "has_subscription": False,
                "plan_type": "free",
                "plan_name": "Free Plan",
                "query_limit": 5,
                "queries_remaining": max(0, 5 - getattr(current_user, 'daily_queries_used', 0)),
                "price_inr": 0.0,
                "message": "Using free plan - upgrade to premium for unlimited queries"
            }
        
        # Get plan details
        plan = await razorpay_service.get_plan_by_id(subscription.plan_id)
        
        return {
            "has_subscription": True,
            "subscription_id": subscription.id,
            "plan_name": plan.name if plan else "Premium Plan",
            "plan_type": "premium",
            "status": subscription.status,
            "start_date": subscription.start_date,
            "end_date": subscription.end_date,
            "auto_renew": subscription.auto_renew,
            "price_inr": plan.price_inr if plan else 999.0,
            "query_limit": None,
            "queries_remaining": "unlimited"
        }
        
    except Exception as e:
        logger.error(f"Get subscription error: {str(e)}")
        # Return fallback response on error
        return {
            "has_subscription": False,
            "plan_type": "free",
            "plan_name": "Free Plan",
            "query_limit": 5,
            "price_inr": 0.0,
            "message": "Error retrieving subscription, using free plan"
        }

@router.post("/cancel-subscription")
async def cancel_subscription(
    current_user: User = Depends(require_user_or_admin)
):
    """Cancel current user's subscription"""
    try:
        razorpay_service = RazorpayService()
        
        subscription = await razorpay_service.get_user_subscription(current_user.id)
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active subscription found"
            )
        
        success = await razorpay_service.cancel_subscription(current_user.id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to cancel subscription"
            )
        
        # Downgrade user to free
        user_service = UserService()
        await user_service.downgrade_to_free(current_user.id)
        
        return {
            "message": "Subscription cancelled successfully",
            "plan_type": "free",
            "effective_date": subscription.end_date
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cancel subscription error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel subscription"
        )

@router.post("/webhook")
async def razorpay_webhook(request: Request):
    """Handle Razorpay webhooks"""
    try:
        body = await request.body()
        signature = request.headers.get("X-Razorpay-Signature", "")
        
        # Verify webhook signature if configured
        from app.config import settings
        if settings.razorpay_webhook_secret:
            import hmac
            import hashlib
            
            expected_signature = hmac.new(
                settings.razorpay_webhook_secret.encode(),
                body,
                hashlib.sha256
            ).hexdigest()
            
            if signature != expected_signature:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid webhook signature"
                )
        
        # Process webhook event
        event_data = json.loads(body.decode())
        event_type = event_data.get("event")
        
        logger.info(f"Received webhook event: {event_type}")
        
        # Handle different event types
        if event_type == "payment.captured":
            # Payment successful
            logger.info("Payment captured successfully")
        elif event_type == "subscription.cancelled":
            # Subscription cancelled
            logger.info("Subscription cancelled via webhook")
        
        return {"status": "ok"}
        
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook processing failed"
        )

# Admin endpoints
@router.get("/admin/subscriptions")
async def get_all_subscriptions(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(require_admin)
):
    """Get all subscriptions (Admin only)"""
    try:
        razorpay_service = RazorpayService()
        razorpay_service._ensure_db()
        
        pipeline = [
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "_id",
                    "as": "user"
                }
            },
            {"$skip": skip},
            {"$limit": limit},
            {"$sort": {"created_at": -1}}
        ]
        
        subscriptions = []
        async for doc in razorpay_service.subscriptions_collection.aggregate(pipeline):
            user = doc["user"][0] if doc["user"] else {}
            
            subscription = {
                "id": str(doc["_id"]),
                "user_email": user.get("email", "Unknown"),
                "user_name": user.get("name", "Unknown"),
                "plan_id": doc["plan_id"],
                "status": doc["status"],
                "start_date": doc["start_date"],
                "end_date": doc["end_date"],
                "auto_renew": doc.get("auto_renew", False)
            }
            subscriptions.append(subscription)
        
        return subscriptions
        
    except Exception as e:
        logger.error(f"Get all subscriptions error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve subscriptions"
        )