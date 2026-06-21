from fastapi import APIRouter, HTTPException, status, Depends
from app.premium.models import PremiumResponse
from app.auth.guards import require_user_or_admin
from app.users.models import User
from app.users.service import UserService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/premium", tags=["premium"])

@router.post("/upgrade", response_model=PremiumResponse)
async def upgrade_to_premium(
    current_user: User = Depends(require_user_or_admin)
):
    """Upgrade user to premium plan with unlimited queries"""
    try:
        user_service = UserService()
        
        # Update user to premium
        await user_service.upgrade_to_premium(current_user.id)
        
        return PremiumResponse(
            message="Successfully upgraded to premium plan",
            plan_type="premium",
            unlimited_queries=True
        )
        
    except Exception as e:
        logger.error(f"Premium upgrade error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upgrade to premium"
        )