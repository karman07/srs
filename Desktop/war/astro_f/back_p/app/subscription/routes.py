from fastapi import APIRouter, HTTPException, status, Depends
from app.subscription.models import SubscriptionCreate, PaymentVerification, SubscriptionResponse, SubscriptionPlan, UserSubscription, PaymentRecord
from app.subscription.service import SubscriptionService
from app.auth.guards import require_user_or_admin, require_admin
from app.users.models import User
from app.users.service import UserService
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/subscription", tags=["subscription"])

@router.get("/plans", response_model=List[SubscriptionPlan])
async def get_subscription_plans():
    """Get all available subscription plans (no auth required)"""
    try:
        subscription_service = SubscriptionService()
        plans = await subscription_service.get_all_plans()
        return plans
        
    except Exception as e:
        logger.error(f"Get subscription plans error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve subscription plans"
        )

@router.post("/create-order")
async def create_subscription_order(
    subscription_data: SubscriptionCreate,
    current_user: User = Depends(require_user_or_admin)
):
    """Create Razorpay order for subscription"""
    try:
        subscription_service = SubscriptionService()
        
        # Check if user already has active subscription
        existing_subscription = await subscription_service.get_user_subscription(current_user.id)
        if existing_subscription:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has an active subscription"
            )
        
        order_data = await subscription_service.create_subscription_order(
            current_user.id, 
            subscription_data.plan_id
        )
        
        return order_data
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create subscription order error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create subscription order"
        )

@router.post("/verify-payment")
async def verify_payment(
    payment_data: PaymentVerification,
    current_user: User = Depends(require_user_or_admin)
):
    """Verify Razorpay payment and activate subscription"""
    try:
        subscription_service = SubscriptionService()
        
        success = await subscription_service.verify_payment(payment_data.dict())
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment verification failed"
            )
        
        # Update user to premium
        user_service = UserService()
        await user_service.upgrade_to_premium(current_user.id)
        
        return {
            "message": "Payment verified successfully",
            "subscription_activated": True,
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
    """Get current user's subscription details"""
    try:
        subscription_service = SubscriptionService()
        
        subscription = await subscription_service.get_user_subscription(current_user.id)
        
        if not subscription:
            return {
                "has_subscription": False,
                "plan_type": "free",
                "message": "No active subscription found"
            }
        
        # Get plan details
        plan = await subscription_service.get_plan_by_id(subscription.plan_id)
        
        return {
            "has_subscription": True,
            "subscription_id": subscription.id,
            "plan_name": plan.name if plan else "Unknown",
            "status": subscription.status,
            "start_date": subscription.start_date,
            "end_date": subscription.end_date,
            "auto_renew": subscription.auto_renew,
            "plan_type": "premium"
        }
        
    except Exception as e:
        logger.error(f"Get my subscription error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve subscription details"
        )

@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(require_user_or_admin)
):
    """Cancel current user's subscription"""
    try:
        subscription_service = SubscriptionService()
        
        # Get user's active subscription
        subscription = await subscription_service.get_user_subscription(current_user.id)
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active subscription found"
            )
        
        success = await subscription_service.cancel_subscription(current_user.id, subscription.id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to cancel subscription"
            )
        
        return {
            "message": "Subscription cancelled successfully",
            "subscription_id": subscription.id,
            "cancelled_at": subscription.end_date
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cancel subscription error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel subscription"
        )

@router.get("/payment-history", response_model=List[PaymentRecord])
async def get_payment_history(
    current_user: User = Depends(require_user_or_admin)
):
    """Get current user's payment history"""
    try:
        subscription_service = SubscriptionService()
        payments = await subscription_service.get_payment_history(current_user.id)
        return payments
        
    except Exception as e:
        logger.error(f"Get payment history error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve payment history"
        )

# Admin endpoints
@router.get("/admin/all-subscriptions")
async def get_all_subscriptions(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(require_admin)
):
    """Get all subscriptions (Admin only)"""
    try:
        subscription_service = SubscriptionService()
        subscriptions = await subscription_service.get_all_subscriptions(skip, limit)
        return subscriptions
        
    except Exception as e:
        logger.error(f"Get all subscriptions error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve subscriptions"
        )

@router.post("/admin/create-plan", response_model=SubscriptionPlan)
async def create_subscription_plan(
    plan_data: dict,
    admin_user: User = Depends(require_admin)
):
    """Create new subscription plan (Admin only)"""
    try:
        subscription_service = SubscriptionService()
        subscription_service._ensure_db()
        
        plan_dict = plan_data.copy()
        plan_dict["created_at"] = datetime.utcnow()
        
        result = await subscription_service.plans_collection.insert_one(plan_dict)
        plan_dict["id"] = str(result.inserted_id)
        
        return SubscriptionPlan(**plan_dict)
        
    except Exception as e:
        logger.error(f"Create subscription plan error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create subscription plan"
        )