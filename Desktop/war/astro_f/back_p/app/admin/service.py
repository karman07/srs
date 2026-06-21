from app.db.mongo import get_database
from app.admin.models import PricingPlan, AdminChatView, AdminStats
from app.chat.service import ChatService
from app.users.service import UserService
from bson import ObjectId
from typing import List, Optional
from datetime import datetime, timedelta

class AdminService:
    def __init__(self):
        self.db = get_database()
        self.pricing_collection = self.db.pricing_plans
        self.chat_service = ChatService()
        self.user_service = UserService()
    
    async def create_pricing_plan(self, plan_data: dict) -> PricingPlan:
        """Create a new pricing plan"""
        plan_dict = plan_data.copy()
        plan_dict["created_at"] = datetime.utcnow()
        
        result = await self.pricing_collection.insert_one(plan_dict)
        plan_dict["id"] = str(result.inserted_id)
        
        return PricingPlan(**plan_dict)
    
    async def get_pricing_plans(self) -> List[PricingPlan]:
        """Get all pricing plans"""
        cursor = self.pricing_collection.find({"is_active": True})
        plans = []
        
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            plans.append(PricingPlan(**doc))
        
        return plans
    
    async def get_pricing_plan_by_id(self, plan_id: str) -> Optional[PricingPlan]:
        """Get pricing plan by ID"""
        doc = await self.pricing_collection.find_one({"_id": ObjectId(plan_id)})
        if doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            return PricingPlan(**doc)
        return None
    
    async def update_pricing_plan(self, plan_id: str, updates: dict) -> bool:
        """Update a pricing plan"""
        # Remove None values
        updates = {k: v for k, v in updates.items() if v is not None}
        if not updates:
            return False
            
        result = await self.pricing_collection.update_one(
            {"_id": ObjectId(plan_id)},
            {"$set": updates}
        )
        return result.modified_count > 0
    
    async def delete_pricing_plan(self, plan_id: str) -> bool:
        """Delete a pricing plan"""
        result = await self.pricing_collection.delete_one({"_id": ObjectId(plan_id)})
        return result.deleted_count > 0
    
    async def toggle_pricing_plan_status(self, plan_id: str, is_active: bool) -> bool:
        """Activate or deactivate a pricing plan"""
        result = await self.pricing_collection.update_one(
            {"_id": ObjectId(plan_id)},
            {"$set": {"is_active": is_active}}
        )
        return result.modified_count > 0
    
    async def get_all_chats_with_users(self) -> List[AdminChatView]:
        """Get all chats with user information for admin view"""
        # Get all chat messages
        chat_messages = await self.chat_service.get_all_chats(limit=200)
        
        admin_chats = []
        for message in chat_messages:
            # Get user info
            user = await self.user_service.get_user_by_id(message.user_id)
            if user:
                admin_chat = AdminChatView(
                    user_email=user.email,
                    user_name=user.name,
                    message=message.message,
                    response=message.response,
                    timestamp=message.timestamp
                )
                admin_chats.append(admin_chat)
        
        return admin_chats
    
    async def get_admin_stats(self) -> AdminStats:
        """Get admin dashboard statistics"""
        # Get user stats
        total_users = await self.db.users.count_documents({})
        premium_users = await self.db.users.count_documents({"plan_type": "premium"})
        free_users = total_users - premium_users
        active_users = await self.db.users.count_documents({"is_active": True})
        inactive_users = total_users - active_users
        
        # Get chat stats
        total_chats = await self.db.chat_messages.count_documents({})
        
        # Get daily queries (last 24 hours)
        yesterday = datetime.utcnow() - timedelta(days=1)
        daily_queries = await self.db.chat_messages.count_documents({
            "timestamp": {"$gte": yesterday}
        })
        
        return AdminStats(
            total_users=total_users,
            premium_users=premium_users,
            free_users=free_users,
            active_users=active_users,
            inactive_users=inactive_users,
            total_chats=total_chats,
            daily_queries=daily_queries
        )