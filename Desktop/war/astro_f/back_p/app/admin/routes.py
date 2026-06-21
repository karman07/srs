from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.admin.models import PricingPlan, PricingPlanCreate, PricingPlanUpdate, AdminChatView, AdminStats, AdminUserView, UserUpdateRequest, UserListResponse
from app.admin.service import AdminService
from app.auth.guards import require_admin
from app.users.models import User, AdminCreateUser, UserResponse
from app.users.service import UserService
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/pricing", response_model=PricingPlan)
async def create_pricing_plan(
    plan_data: PricingPlanCreate,
    admin_user: User = Depends(require_admin)
):
    """Create a new pricing plan"""
    try:
        admin_service = AdminService()
        plan = await admin_service.create_pricing_plan(plan_data.dict())
        return plan
        
    except Exception as e:
        logger.error(f"Create pricing plan error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create pricing plan"
        )

@router.get("/pricing", response_model=List[PricingPlan])
async def get_pricing_plans(
    admin_user: User = Depends(require_admin)
):
    """Get all pricing plans"""
    try:
        admin_service = AdminService()
        plans = await admin_service.get_pricing_plans()
        return plans
        
    except Exception as e:
        logger.error(f"Get pricing plans error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve pricing plans"
        )

@router.get("/pricing/{plan_id}", response_model=PricingPlan)
async def get_pricing_plan(
    plan_id: str,
    admin_user: User = Depends(require_admin)
):
    """Get specific pricing plan (Admin only)"""
    try:
        admin_service = AdminService()
        plan = await admin_service.get_pricing_plan_by_id(plan_id)
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pricing plan not found"
            )
        
        return plan
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get pricing plan error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve pricing plan"
        )

@router.put("/pricing/{plan_id}", response_model=PricingPlan)
async def update_pricing_plan(
    plan_id: str,
    plan_updates: PricingPlanUpdate,
    admin_user: User = Depends(require_admin)
):
    """Update pricing plan (Admin only)"""
    try:
        admin_service = AdminService()
        
        # Check if plan exists
        existing_plan = await admin_service.get_pricing_plan_by_id(plan_id)
        if not existing_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pricing plan not found"
            )
        
        # Update plan
        success = await admin_service.update_pricing_plan(plan_id, plan_updates.dict())
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No changes made to pricing plan"
            )
        
        # Return updated plan
        updated_plan = await admin_service.get_pricing_plan_by_id(plan_id)
        return updated_plan
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update pricing plan error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update pricing plan"
        )

@router.delete("/pricing/{plan_id}")
async def delete_pricing_plan(
    plan_id: str,
    admin_user: User = Depends(require_admin)
):
    """Delete pricing plan (Admin only)"""
    try:
        admin_service = AdminService()
        
        # Check if plan exists
        existing_plan = await admin_service.get_pricing_plan_by_id(plan_id)
        if not existing_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pricing plan not found"
            )
        
        success = await admin_service.delete_pricing_plan(plan_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete pricing plan"
            )
        
        return {"message": "Pricing plan deleted successfully", "plan_id": plan_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete pricing plan error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete pricing plan"
        )

@router.post("/pricing/{plan_id}/activate")
async def activate_pricing_plan(
    plan_id: str,
    admin_user: User = Depends(require_admin)
):
    """Activate pricing plan (Admin only)"""
    try:
        admin_service = AdminService()
        
        success = await admin_service.toggle_pricing_plan_status(plan_id, True)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pricing plan not found"
            )
        
        return {"message": "Pricing plan activated", "plan_id": plan_id, "is_active": True}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Activate pricing plan error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to activate pricing plan"
        )

@router.post("/pricing/{plan_id}/deactivate")
async def deactivate_pricing_plan(
    plan_id: str,
    admin_user: User = Depends(require_admin)
):
    """Deactivate pricing plan (Admin only)"""
    try:
        admin_service = AdminService()
        
        success = await admin_service.toggle_pricing_plan_status(plan_id, False)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pricing plan not found"
            )
        
        return {"message": "Pricing plan deactivated", "plan_id": plan_id, "is_active": False}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Deactivate pricing plan error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate pricing plan"
        )

@router.get("/chats", response_model=List[AdminChatView])
async def get_all_user_chats(
    admin_user: User = Depends(require_admin)
):
    """Get all user chats for admin monitoring"""
    try:
        admin_service = AdminService()
        chats = await admin_service.get_all_chats_with_users()
        return chats
        
    except Exception as e:
        logger.error(f"Get admin chats error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user chats"
        )

@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    admin_user: User = Depends(require_admin)
):
    """Get admin dashboard statistics"""
    try:
        admin_service = AdminService()
        stats = await admin_service.get_admin_stats()
        return stats
        
    except Exception as e:
        logger.error(f"Get admin stats error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve admin statistics"
        )

@router.post("/create-user", response_model=UserResponse)
async def create_user_by_admin(
    user_data: AdminCreateUser,
    admin_user: User = Depends(require_admin)
):
    """Create user with specific role (Admin only)"""
    try:
        user_service = UserService()
        
        # Check if user already exists
        existing_user = await user_service.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create user with specified role
        user = await user_service.create_admin_user(user_data.dict())
        
        return UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            plan_type=user.plan_type,
            prompt_count=user.prompt_count
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create user by admin error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    admin_user: User = Depends(require_admin)
):
    """Update user role (Admin only)"""
    try:
        from app.users.models import UserRole
        
        # Validate role
        if role not in [UserRole.USER.value, UserRole.ADMIN.value]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role. Must be 'user' or 'admin'"
            )
        
        user_service = UserService()
        success = await user_service.update_user_role(user_id, role)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {"message": f"User role updated to {role}", "user_id": user_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update user role error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user role"
        )

@router.get("/users", response_model=UserListResponse)
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    admin_user: User = Depends(require_admin)
):
    """Get all users with pagination (Admin only)"""
    try:
        user_service = UserService()
        users_data = await user_service.get_all_users(skip, limit)
        
        # Convert to AdminUserView
        users = [AdminUserView(**user) for user in users_data]
        
        # Get counts
        total_count = len(users)
        premium_count = len([u for u in users if u.plan_type == "premium"])
        free_count = total_count - premium_count
        
        return UserListResponse(
            users=users,
            total_count=total_count,
            premium_count=premium_count,
            free_count=free_count
        )
        
    except Exception as e:
        logger.error(f"Get all users error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )

@router.get("/users/{user_id}", response_model=AdminUserView)
async def get_user_details(
    user_id: str,
    admin_user: User = Depends(require_admin)
):
    """Get specific user details (Admin only)"""
    try:
        user_service = UserService()
        user = await user_service.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return AdminUserView(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            plan_type=user.plan_type,
            prompt_count=user.prompt_count,
            is_active=user.is_active,
            created_at=user.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user details error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user details"
        )

@router.put("/users/{user_id}")
async def update_user_details(
    user_id: str,
    updates: UserUpdateRequest,
    admin_user: User = Depends(require_admin)
):
    """Update user details (Admin only)"""
    try:
        user_service = UserService()
        
        # Validate role if provided
        if updates.role and updates.role not in ["user", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role. Must be 'user' or 'admin'"
            )
        
        # Validate plan_type if provided
        if updates.plan_type and updates.plan_type not in ["free", "premium"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid plan type. Must be 'free' or 'premium'"
            )
        
        success = await user_service.update_user(user_id, updates.dict())
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found or no changes made"
            )
        
        return {"message": "User updated successfully", "user_id": user_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update user details error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )

@router.post("/users/{user_id}/revoke-access")
async def revoke_user_access(
    user_id: str,
    admin_user: User = Depends(require_admin)
):
    """Revoke user access (Admin only)"""
    try:
        user_service = UserService()
        success = await user_service.toggle_user_access(user_id, False)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {"message": "User access revoked", "user_id": user_id, "is_active": False}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Revoke user access error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke user access"
        )

@router.post("/users/{user_id}/grant-access")
async def grant_user_access(
    user_id: str,
    admin_user: User = Depends(require_admin)
):
    """Grant user access (Admin only)"""
    try:
        user_service = UserService()
        success = await user_service.toggle_user_access(user_id, True)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {"message": "User access granted", "user_id": user_id, "is_active": True}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Grant user access error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to grant user access"
        )

@router.post("/users/{user_id}/upgrade-premium")
async def upgrade_user_to_premium(
    user_id: str,
    admin_user: User = Depends(require_admin)
):
    """Upgrade user to premium (Admin only)"""
    try:
        user_service = UserService()
        success = await user_service.upgrade_to_premium(user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {"message": "User upgraded to premium", "user_id": user_id, "plan_type": "premium"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upgrade user to premium error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upgrade user to premium"
        )