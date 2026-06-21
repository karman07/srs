from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PremiumUpgrade(BaseModel):
    user_id: str
    plan_type: str = "premium"
    upgraded_at: datetime = datetime.utcnow()

class PremiumResponse(BaseModel):
    message: str
    plan_type: str
    unlimited_queries: bool = True