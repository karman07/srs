from fastapi import APIRouter, HTTPException, status, Depends
from app.auth.schemas import Token, GoogleAuthRequest
from app.auth.service import auth_service
from app.auth.guards import require_admin
from app.users.models import User, UserCreate, UserLogin, AdminCreateUser, UserResponse
from app.users.service import UserService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/signup", response_model=Token)
async def signup(user_data: UserCreate):
    """Register a new user"""
    try:
        user_service = UserService()
        
        # Check if user already exists
        existing_user = await user_service.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create user
        user = await user_service.create_user(user_data)
        
        # Generate token
        token = auth_service.create_access_token(data={"sub": user.email})
        
        return Token(access_token=token, token_type="bearer")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account"
        )

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Authenticate user and return JWT token"""
    try:
        user_service = UserService()
        user = await user_service.authenticate_user(
            user_credentials.email, 
            user_credentials.password
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Generate token
        token = auth_service.create_access_token(data={"sub": user.email})
        
        return Token(access_token=token, token_type="bearer")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )

@router.post("/google-auth", response_model=Token)
async def google_auth(request: GoogleAuthRequest):
    """Authenticate with Google Firebase token"""
    try:
        from app.auth.firebase_auth import verify_firebase_token
        
        # Verify Firebase token
        user_info = await verify_firebase_token(request.id_token)
        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token"
            )
        
        user_service = UserService()
        
        # Check if user exists, create if not
        user = await user_service.get_user_by_email(user_info["email"])
        if not user:
            user_data = UserCreate(
                email=user_info["email"],
                password="google_auth",  # Placeholder for Google auth users
                name=user_info.get("name", "Google User")
            )
            user = await user_service.create_user(user_data)
        
        # Generate token
        token = auth_service.create_access_token(data={"sub": user.email})
        
        return Token(access_token=token, token_type="bearer")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google auth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google authentication failed"
        )

@router.post("/admin/create-user", response_model=UserResponse)
async def create_admin_user(
    user_data: AdminCreateUser
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
        logger.error(f"Create admin user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )