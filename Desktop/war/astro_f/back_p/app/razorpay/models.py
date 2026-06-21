from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PENDING = "pending"
    HALTED = "halted"

class PaymentStatus(str, Enum):
    SUCCESS = "success"
    FAILED = "failed"
    PENDING = "pending"

class PlanType(str, Enum):
    FREE = "free"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"

class RazorpayPlan(BaseModel):
    id: Optional[str] = None
    name: str
    price_inr: float
    duration_days: int
    features: List[str]
    query_limit: Optional[int] = None
    plan_type: PlanType
    razorpay_plan_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = datetime.utcnow()

class RazorpaySubscription(BaseModel):
    id: Optional[str] = None
    user_id: str
    plan_id: str
    razorpay_subscription_id: Optional[str] = None
    razorpay_customer_id: Optional[str] = None
    status: SubscriptionStatus
    start_date: datetime
    end_date: datetime
    auto_renew: bool = True
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

class PaymentRecord(BaseModel):
    id: Optional[str] = None
    user_id: str
    subscription_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    amount_inr: float
    status: PaymentStatus
    payment_date: datetime = datetime.utcnow()
    failure_reason: Optional[str] = None

class CreateOrderRequest(BaseModel):
    plan_id: str

class PaymentVerificationRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str

class WebhookEvent(BaseModel):
    event: str
    payload: dict
    created_at: int