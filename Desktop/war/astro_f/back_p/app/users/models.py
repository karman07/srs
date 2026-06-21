from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from bson import ObjectId
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class User(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    password: str
    name: str
    role: UserRole = UserRole.USER
    plan_type: str = "free"  # "free" or "premium"
    prompt_count: int = 0
    is_active: bool = True
    created_at: datetime = datetime.utcnow()
    
    class Config:
        json_encoders = {
            ObjectId: str
        }

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    plan_type: str
    prompt_count: int

class AdminCreateUser(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole = UserRole.USER