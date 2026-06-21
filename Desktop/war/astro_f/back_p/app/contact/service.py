from app.db.mongo import get_database
from app.contact.models import ContactMessage
from bson import ObjectId
from datetime import datetime
from typing import List, Optional

class ContactService:
    def __init__(self):
        self.db = get_database()
        self.collection = self.db.contact_messages
    
    async def create_contact_message(self, contact_data: dict, user_id: Optional[str] = None) -> ContactMessage:
        """Create a new contact message"""
        message_dict = contact_data.copy()
        message_dict["user_id"] = user_id
        message_dict["status"] = "pending"
        message_dict["created_at"] = datetime.utcnow()
        
        result = await self.collection.insert_one(message_dict)
        message_dict["id"] = str(result.inserted_id)
        
        return ContactMessage(**message_dict)
    
    async def get_all_contacts(self, skip: int = 0, limit: int = 100) -> List[ContactMessage]:
        """Get all contact messages for admin"""
        cursor = self.collection.find().skip(skip).limit(limit).sort("created_at", -1)
        
        messages = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            messages.append(ContactMessage(**doc))
        
        return messages
    
    async def update_contact_status(self, contact_id: str, status: str) -> bool:
        """Update contact message status"""
        result = await self.collection.update_one(
            {"_id": ObjectId(contact_id)},
            {"$set": {"status": status}}
        )
        return result.modified_count > 0