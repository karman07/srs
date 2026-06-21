import asyncio
from app.db.mongo import connect_to_mongo, get_database
from datetime import datetime

async def initialize_subscription_plans():
    """Initialize default subscription plans in INR"""
    await connect_to_mongo()
    db = get_database()
    plans_collection = db.subscription_plans
    
    # Check if plans already exist
    existing_plans = await plans_collection.count_documents({})
    if existing_plans > 0:
        print("Subscription plans already exist")
        return
    
    # Default subscription plans in INR
    plans = [
        {
            "name": "Basic Premium",
            "price_inr": 299.0,
            "duration_days": 30,
            "features": [
                "Unlimited chat queries",
                "Priority support",
                "Advanced astrology insights",
                "Voice chat support"
            ],
            "query_limit": None,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Premium Plus",
            "price_inr": 799.0,
            "duration_days": 90,
            "features": [
                "Unlimited chat queries",
                "Priority support",
                "Advanced astrology insights",
                "Voice chat support",
                "Detailed birth chart analysis",
                "Compatibility reports"
            ],
            "query_limit": None,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Premium Annual",
            "price_inr": 2999.0,
            "duration_days": 365,
            "features": [
                "Unlimited chat queries",
                "Priority support",
                "Advanced astrology insights",
                "Voice chat support",
                "Detailed birth chart analysis",
                "Compatibility reports",
                "Monthly predictions",
                "Personal astrologer consultation"
            ],
            "query_limit": None,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Student Plan",
            "price_inr": 199.0,
            "duration_days": 30,
            "features": [
                "50 chat queries per day",
                "Basic astrology insights",
                "Voice chat support"
            ],
            "query_limit": 50,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    # Insert plans
    result = await plans_collection.insert_many(plans)
    print(f"Created {len(result.inserted_ids)} subscription plans:")
    
    for i, plan in enumerate(plans):
        print(f"- {plan['name']}: ₹{plan['price_inr']} for {plan['duration_days']} days")

if __name__ == "__main__":
    asyncio.run(initialize_subscription_plans())