from app.db.mongo import get_database
from app.users.models import User, UserCreate
from app.utils.security import get_password_hash, verify_password
from bson import ObjectId
from typing import Optional
from datetime import datetime

class UserService:
    def __init__(self):
        pass
    
    def get_db(self):
        db = get_database()
        if db is None:
            raise Exception("Database not connected")
        return db
    
    async def create_user(self, user_data: UserCreate) -> User:
        """Create a new user"""
        hashed_password = get_password_hash(user_data.password)
        
        user_dict = {
            "email": user_data.email,
            "password": hashed_password,
            "name": user_data.name,
            "role": "user",
            "plan_type": "free",
            "prompt_count": 0,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        
        db = self.get_db()
        result = await db.users.insert_one(user_dict)
        user_dict["id"] = str(result.inserted_id)
        return User(**user_dict)
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        db = self.get_db()
        user_doc = await db.users.find_one({"email": email})
        if user_doc:
            user_doc["id"] = str(user_doc["_id"])
            return User(**user_doc)
        return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        db = self.get_db()
        user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
        if user_doc:
            user_doc["id"] = str(user_doc["_id"])
            return User(**user_doc)
        return None
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user credentials"""
        user = await self.get_user_by_email(email)
        if user and verify_password(password, user.password):
            return user
        return None
    
    async def increment_prompt_count(self, user_id: str) -> bool:
        """Increment user's prompt count"""
        db = self.get_db()
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"prompt_count": 1}}
        )
        return result.modified_count > 0
    
    async def upgrade_to_premium(self, user_id: str) -> bool:
        """Upgrade user to premium plan"""
        db = self.get_db()
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"plan_type": "premium"}}
        )
        return result.modified_count > 0
    
    async def downgrade_to_free(self, user_id: str) -> bool:
        """Downgrade user to free plan"""
        db = self.get_db()
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"plan_type": "free"}}
        )
        return result.modified_count > 0
    
    async def create_admin_user(self, user_data: dict) -> User:
        """Create admin user"""
        from app.utils.security import get_password_hash
        
        hashed_password = get_password_hash(user_data["password"])
        
        user_dict = {
            "email": user_data["email"],
            "password": hashed_password,
            "name": user_data["name"],
            "role": user_data.get("role", "admin"),
            "plan_type": "premium",
            "prompt_count": 0,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        
        db = self.get_db()
        result = await db.users.insert_one(user_dict)
        user_dict["id"] = str(result.inserted_id)
        return User(**user_dict)
    
    async def update_user_role(self, user_id: str, role: str) -> bool:
        """Update user role"""
        db = self.get_db()
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"role": role}}
        )
        return result.modified_count > 0
    
    async def get_all_users(self, skip: int = 0, limit: int = 100) -> list:
        """Get all users for admin"""
        db = self.get_db()
        cursor = db.users.find().skip(skip).limit(limit).sort("created_at", -1)
        users = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            del doc["password"]  # Don't return password
            users.append(doc)
        return users
    
    async def update_user(self, user_id: str, updates: dict) -> bool:
        """Update user details"""
        db = self.get_db()
        # Remove None values
        updates = {k: v for k, v in updates.items() if v is not None}
        if not updates:
            return False
        
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": updates}
        )
        return result.modified_count > 0
    
    async def toggle_user_access(self, user_id: str, is_active: bool) -> bool:
        """Grant or revoke user access"""
        db = self.get_db()
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_active": is_active}}
        )
        return result.modified_count > 0