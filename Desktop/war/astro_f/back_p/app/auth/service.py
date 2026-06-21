from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.users.service import UserService
from app.users.models import User
from app.utils.security import verify_token, create_access_token
from typing import Optional
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()

class AuthService:
    def __init__(self):
        self.user_service = UserService()
    
    async def get_current_user(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
        """Get current authenticated user"""
        token = credentials.credentials
        payload = verify_token(token)
        
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = await self.user_service.get_user_by_email(email)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user
    
    async def check_rate_limit(self, user: User) -> bool:
        """Check if user has exceeded daily prompt limit"""
        if user.plan_type == "premium":
            return True
        
        # Free users get 5 queries per day
        limit_exceeded = user.prompt_count >= 5
        
        if limit_exceeded:
            logger.warning(f"Rate limit exceeded for user {user.email} (ID: {user.id}). Current count: {user.prompt_count}/5")
            print(f"⚠️  RATE LIMIT EXCEEDED - User: {user.email}, Count: {user.prompt_count}/5, Plan: {user.plan_type}")
        
        return not limit_exceeded
    
    def create_access_token(self, data: dict) -> str:
        """Create JWT access token"""
        return create_access_token(data)
    
    def verify_token(self, token: str) -> dict:
        """Verify JWT token"""
        return verify_token(token)

auth_service = AuthService()