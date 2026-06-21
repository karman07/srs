from fastapi import APIRouter, HTTPException, status, Depends
from app.profile.models import ProfileCreate, LocationSearch, LocationResult, UserProfile
from app.profile.service import ProfileService
from app.auth.guards import require_user_or_admin
from app.users.models import User
from app.astrology.service import AstrologyService
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/", response_model=UserProfile)
async def get_user_profile(
    current_user: User = Depends(require_user_or_admin)
):
    """Get current user's profile"""
    try:
        profile_service = ProfileService()
        profile = await profile_service.get_user_profile(current_user.id)
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found. Please complete your birth details first."
            )
        
        return profile
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve profile"
        )

@router.post("/", response_model=UserProfile)
async def create_or_update_profile(
    profile_data: ProfileCreate,
    current_user: User = Depends(require_user_or_admin)
):
    """Create or update user profile and fetch astrology data"""
    try:
        profile_service = ProfileService()
        
        # Create/update profile
        profile = await profile_service.create_or_update_profile(
            current_user.id, 
            profile_data.dict()
        )
        
        # Automatically fetch astrology data
        astrology_service = AstrologyService()
        birth_data = {
            "year": profile_data.birth_year,
            "month": profile_data.birth_month,
            "date": profile_data.birth_date,
            "hours": profile_data.birth_hours,
            "minutes": profile_data.birth_minutes,
            "seconds": profile_data.birth_seconds,
            "latitude": profile_data.latitude,
            "longitude": profile_data.longitude,
            "timezone": profile_data.timezone,
            "config": {"ayanamsha": profile_data.ayanamsha}
        }
        
        # Fetch astrology data
        success = await astrology_service.fetch_all_astrology_data(current_user.id, birth_data)
        
        if success:
            # Mark astrology data as fetched
            await profile_service.mark_astrology_data_fetched(current_user.id)
            profile.has_astrology_data = True
        
        return profile
        
    except Exception as e:
        logger.error(f"Create/update profile error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create/update profile"
        )

@router.post("/search-locations", response_model=List[LocationResult])
async def search_locations(
    search_data: LocationSearch,
    current_user: User = Depends(require_user_or_admin)
):
    """Search for locations with coordinates"""
    try:
        profile_service = ProfileService()
        locations = profile_service.search_locations(search_data.query)
        
        if not locations:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No locations found for the given query"
            )
        
        return locations
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Location search error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search locations"
        )

@router.get("/check-astrology-data")
async def check_astrology_data(
    current_user: User = Depends(require_user_or_admin)
):
    """Check if user has astrology data"""
    try:
        profile_service = ProfileService()
        profile = await profile_service.get_user_profile(current_user.id)
        
        return {
            "has_profile": profile is not None,
            "has_astrology_data": profile.has_astrology_data if profile else False,
            "profile_complete": profile is not None and profile.has_astrology_data
        }
        
    except Exception as e:
        logger.error(f"Check astrology data error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check astrology data"
        )