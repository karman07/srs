from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class ContactMessage(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    subject: str
    message: str
    user_id: Optional[str] = None
    status: str = "pending"  # pending, replied, closed
    created_at: datetime = datetime.utcnow()

class ContactResponse(BaseModel):
    message: str
    contact_id: str