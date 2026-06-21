from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum

class MessageType(str, Enum):
    USER = "user"
    AI = "ai"

class Chat(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

class Message(BaseModel):
    id: Optional[str] = None
    chat_id: str
    content: str
    message_type: MessageType
    timestamp: datetime = datetime.utcnow()

class ChatCreate(BaseModel):
    title: str

class MessageCreate(BaseModel):
    content: str

class ChatResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

class MessageResponse(BaseModel):
    id: str
    content: str
    message_type: MessageType
    timestamp: datetime

class ChatWithMessages(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse]

class WebSocketMessage(BaseModel):
    type: str  # "message", "typing", "error"
    chat_id: Optional[str] = None
    content: Optional[str] = None
    message_id: Optional[str] = None
    timestamp: Optional[datetime] = None