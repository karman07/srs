from app.db.mongo import get_database
from app.chat.models import Chat, Message, MessageType, ChatResponse, MessageResponse, ChatWithMessages
from app.rag.custom_rag import CustomAstrologyRAG
from bson import ObjectId
from datetime import datetime
from typing import List, Optional, Tuple

class ChatService:
    def __init__(self):
        self.db = None
        self.chats_collection = None
        self.messages_collection = None
        self.rag_system = CustomAstrologyRAG()
    
    def _ensure_db(self):
        """Lazy initialization of database connection"""
        if self.db is None:
            self.db = get_database()
            self.chats_collection = self.db.chats
            self.messages_collection = self.db.messages
    
    async def create_chat(self, user_id: str, title: str) -> Chat:
        """Create a new chat conversation"""
        self._ensure_db()
        
        chat_data = {
            "user_id": user_id,
            "title": title,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await self.chats_collection.insert_one(chat_data)
        chat_data["id"] = str(result.inserted_id)
        
        return Chat(**chat_data)
    
    async def get_user_chats(self, user_id: str) -> List[ChatResponse]:
        """Get all chats for a user"""
        self._ensure_db()
        
        cursor = self.chats_collection.find({"user_id": user_id}).sort("updated_at", -1)
        
        chats = []
        async for doc in cursor:
            # Count messages for each chat
            message_count = await self.messages_collection.count_documents({"chat_id": str(doc["_id"])})
            
            chat_response = ChatResponse(
                id=str(doc["_id"]),
                title=doc["title"],
                created_at=doc["created_at"],
                updated_at=doc["updated_at"],
                message_count=message_count
            )
            chats.append(chat_response)
        
        return chats
    
    async def get_chat_with_messages(self, user_id: str, chat_id: str) -> Optional[ChatWithMessages]:
        """Get a specific chat with all its messages"""
        self._ensure_db()
        
        # Get chat
        chat_doc = await self.chats_collection.find_one({
            "_id": ObjectId(chat_id),
            "user_id": user_id
        })
        
        if not chat_doc:
            return None
        
        # Get messages
        cursor = self.messages_collection.find({"chat_id": chat_id}).sort("timestamp", 1)
        messages = []
        
        async for msg_doc in cursor:
            message = MessageResponse(
                id=str(msg_doc["_id"]),
                content=msg_doc["content"],
                message_type=msg_doc["message_type"],
                timestamp=msg_doc["timestamp"]
            )
            messages.append(message)
        
        return ChatWithMessages(
            id=str(chat_doc["_id"]),
            title=chat_doc["title"],
            created_at=chat_doc["created_at"],
            updated_at=chat_doc["updated_at"],
            messages=messages
        )
    
    async def send_message(self, user_id: str, chat_id: str, content: str) -> Tuple[MessageResponse, MessageResponse]:
        """Send a message and get AI response"""
        self._ensure_db()
        
        # Verify chat ownership
        chat_doc = await self.chats_collection.find_one({
            "_id": ObjectId(chat_id),
            "user_id": user_id
        })
        
        if not chat_doc:
            raise ValueError("Chat not found")
        
        # Create user message
        user_message_data = {
            "chat_id": chat_id,
            "content": content,
            "message_type": MessageType.USER,
            "timestamp": datetime.utcnow()
        }
        
        user_result = await self.messages_collection.insert_one(user_message_data)
        user_message = MessageResponse(
            id=str(user_result.inserted_id),
            content=content,
            message_type=MessageType.USER,
            timestamp=user_message_data["timestamp"]
        )
        
        # Get AI response
        rag_result = await self.rag_system.query(user_id, content)
        ai_response = rag_result["answer"]
        
        # Create AI message
        ai_message_data = {
            "chat_id": chat_id,
            "content": ai_response,
            "message_type": MessageType.AI,
            "timestamp": datetime.utcnow()
        }
        
        ai_result = await self.messages_collection.insert_one(ai_message_data)
        ai_message = MessageResponse(
            id=str(ai_result.inserted_id),
            content=ai_response,
            message_type=MessageType.AI,
            timestamp=ai_message_data["timestamp"]
        )
        
        # Update chat timestamp
        await self.chats_collection.update_one(
            {"_id": ObjectId(chat_id)},
            {"$set": {"updated_at": datetime.utcnow()}}
        )
        
        return user_message, ai_message
    
    async def delete_chat(self, user_id: str, chat_id: str) -> bool:
        """Delete a chat and all its messages"""
        self._ensure_db()
        
        # Verify ownership
        chat_doc = await self.chats_collection.find_one({
            "_id": ObjectId(chat_id),
            "user_id": user_id
        })
        
        if not chat_doc:
            return False
        
        # Delete messages
        await self.messages_collection.delete_many({"chat_id": chat_id})
        
        # Delete chat
        result = await self.chats_collection.delete_one({"_id": ObjectId(chat_id)})
        return result.deleted_count > 0
    
    async def update_chat_title(self, user_id: str, chat_id: str, title: str) -> bool:
        """Update chat title"""
        self._ensure_db()
        
        result = await self.chats_collection.update_one(
            {"_id": ObjectId(chat_id), "user_id": user_id},
            {"$set": {"title": title, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0
    
    async def delete_message(self, user_id: str, chat_id: str, message_id: str) -> bool:
        """Delete a specific message"""
        self._ensure_db()
        
        # Verify chat ownership
        chat_doc = await self.chats_collection.find_one({
            "_id": ObjectId(chat_id),
            "user_id": user_id
        })
        
        if not chat_doc:
            return False
        
        result = await self.messages_collection.delete_one({
            "_id": ObjectId(message_id),
            "chat_id": chat_id
        })
        return result.deleted_count > 0