from app.db.mongo import get_database
from app.razorpay.models import RazorpayPlan, PlanType
from datetime import datetime
import asyncio
import logging

logger = logging.getLogger(__name__)

DEFAULT_PLANS = [
    {
        "name": "Free Plan",
        "price_inr": 0.0,
        "duration_days": 30,
        "features": [
            "5 queries per day",
            "Basic astrology insights",
            "Birth chart analysis"
        ],
        "query_limit": 5,
        "plan_type": PlanType.FREE,
        "is_active": True
    },
    {
        "name": "Premium Monthly",
        "price_inr": 999.0,
        "duration_days": 30,
        "features": [
            "Unlimited queries",
            "Advanced astrology insights",
            "Detailed birth chart analysis",
            "Priority support",
            "Export reports"
        ],
        "query_limit": None,
        "plan_type": PlanType.PREMIUM,
        "is_active": True
    },
    {
        "name": "Premium Quarterly",
        "price_inr": 2499.0,
        "duration_days": 90,
        "features": [
            "Unlimited queries",
            "Advanced astrology insights",
            "Detailed birth chart analysis",
            "Priority support",
            "Export reports",
            "17% savings vs monthly"
        ],
        "query_limit": None,
        "plan_type": PlanType.PREMIUM,
        "is_active": True
    },
    {
        "name": "Premium Yearly",
        "price_inr": 7999.0,
        "duration_days": 365,
        "features": [
            "Unlimited queries",
            "Advanced astrology insights",
            "Detailed birth chart analysis",
            "Priority support",
            "Export reports",
            "33% savings vs monthly",
            "Exclusive yearly features"
        ],
        "query_limit": None,
        "plan_type": PlanType.PREMIUM,
        "is_active": True
    }
]

async def initialize_default_plans():
    """Initialize default subscription plans in INR"""
    try:
        db = get_database()
        plans_collection = db.razorpay_plans
        
        # Check if plans already exist
        existing_count = await plans_collection.count_documents({})
        if existing_count > 0:
            logger.info(f"Plans already exist ({existing_count} plans found)")
            return
        
        # Insert default plans
        for plan_data in DEFAULT_PLANS:
            plan_data["created_at"] = datetime.utcnow()
            await plans_collection.insert_one(plan_data)
            logger.info(f"Created plan: {plan_data['name']} - ₹{plan_data['price_inr']}")
        
        logger.info("Default plans initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing plans: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(initialize_default_plans())