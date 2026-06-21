#!/usr/bin/env python3
"""
Initialize Razorpay plans in the database
Run this script once after setting up the database
"""

import asyncio
from app.db.mongo import connect_to_mongo, get_database
from app.razorpay.models import RazorpayPlan, PlanType
from datetime import datetime

async def init_plans():
    """Initialize default subscription plans"""
    try:
        await connect_to_mongo()
        db = get_database()
        plans_collection = db.razorpay_plans
        
        # Check if plans already exist
        existing_plans = await plans_collection.count_documents({})
        if existing_plans > 0:
            print(f"Plans already exist ({existing_plans} plans found). Skipping initialization.")
            return
        
        # Create default plans
        plans = [
            {
                "name": "Free Plan",
                "price_inr": 0.0,
                "duration_days": 30,
                "features": [
                    "5 queries per day",
                    "Basic astrology insights",
                    "Standard support"
                ],
                "query_limit": 5,
                "plan_type": PlanType.FREE.value,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "name": "Premium Plan",
                "price_inr": 999.0,
                "duration_days": 30,
                "features": [
                    "Unlimited queries",
                    "Advanced astrology insights",
                    "Priority support",
                    "Detailed birth chart analysis",
                    "Personalized predictions"
                ],
                "query_limit": None,
                "plan_type": PlanType.PREMIUM.value,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        # Insert plans
        result = await plans_collection.insert_many(plans)
        print(f"Successfully created {len(result.inserted_ids)} subscription plans:")
        
        for i, plan in enumerate(plans):
            print(f"  - {plan['name']}: ₹{plan['price_inr']}/month")
        
        print("\nPlans initialization completed!")
        
    except Exception as e:
        print(f"Error initializing plans: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(init_plans())