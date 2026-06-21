from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PricingPlan(BaseModel):
    id: Optional[str] = None
    name: str
    price: float
    currency: str = "USD"
    features: List[str]
    query_limit: Optional[int] = None  # None for unlimited
    is_active: bool = True
    created_at: datetime = datetime.utcnow()

class PricingPlanCreate(BaseModel):
    name: str
    price: float
    currency: str = "USD"
    features: List[str]
    query_limit: Optional[int] = None

class PricingPlanUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    features: Optional[List[str]] = None
    query_limit: Optional[int] = None
    is_active: Optional[bool] = None

class AdminChatView(BaseModel):
    user_email: str
    user_name: str
    message: str
    response: str
    timestamp: datetime

class AdminStats(BaseModel):
    total_users: int
    premium_users: int
    free_users: int
    active_users: int
    inactive_users: int
    total_chats: int
    daily_queries: int

class AdminUserView(BaseModel):
    id: str
    email: str
    name: str
    role: str
    plan_type: str
    prompt_count: int
    is_active: bool = True
    created_at: datetime

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    plan_type: Optional[str] = None
    is_active: Optional[bool] = None

class UserListResponse(BaseModel):
    users: List[AdminUserView]
    total_count: int
    premium_count: int
    free_count: int