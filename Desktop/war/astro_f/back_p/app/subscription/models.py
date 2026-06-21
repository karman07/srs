from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PENDING = "pending"

class PaymentStatus(str, Enum):
    SUCCESS = "success"
    FAILED = "failed"
    PENDING = "pending"

class SubscriptionPlan(BaseModel):
    id: Optional[str] = None
    name: str
    price_inr: float
    duration_days: int
    features: list[str]
    query_limit: Optional[int] = None  # None for unlimited
    is_active: bool = True
    razorpay_plan_id: Optional[str] = None
    created_at: datetime = datetime.utcnow()

class UserSubscription(BaseModel):
    id: Optional[str] = None
    user_id: str
    plan_id: str
    razorpay_subscription_id: Optional[str] = None
    status: SubscriptionStatus
    start_date: datetime
    end_date: datetime
    auto_renew: bool = True
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

class PaymentRecord(BaseModel):
    id: Optional[str] = None
    user_id: str
    subscription_id: str
    razorpay_payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    amount_inr: float
    status: PaymentStatus
    payment_date: datetime = datetime.utcnow()
    failure_reason: Optional[str] = None

class SubscriptionCreate(BaseModel):
    plan_id: str

class PaymentVerification(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    subscription_id: str

class SubscriptionResponse(BaseModel):
    subscription_id: str
    plan_name: str
    status: str
    start_date: datetime
    end_date: datetime
    amount_inr: float
    razorpay_order_id: Optional[str] = None