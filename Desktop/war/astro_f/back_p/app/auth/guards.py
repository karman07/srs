from fastapi import HTTPException, status, Depends
from app.auth.service import auth_service
from app.users.models import User, UserRole
from typing import List

def require_roles(allowed_roles: List[UserRole]):
    """Role-based access control decorator"""
    def role_checker(current_user: User = Depends(auth_service.get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[role.value for role in allowed_roles]}"
            )
        return current_user
    return role_checker

# Predefined role guards
def require_admin(current_user: User = Depends(auth_service.get_current_user)) -> User:
    """Require admin role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def require_user_or_admin(current_user: User = Depends(auth_service.get_current_user)) -> User:
    """Require user or admin role (any authenticated user)"""
    if current_user.role not in [UserRole.USER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User access required"
        )
    
    # Check if user is active
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account access has been revoked. Contact administrator."
        )
    
    return current_user