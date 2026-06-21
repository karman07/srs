from app.db.mongo import get_database
from app.profile.models import UserProfile, LocationResult
from bson import ObjectId
from datetime import datetime
from typing import Optional, List
import requests
import logging

logger = logging.getLogger(__name__)

class ProfileService:
    def __init__(self):
        self.db = None
        self.collection = None
    
    def _ensure_db(self):
        if self.db is None:
            self.db = get_database()
            self.collection = self.db.user_profiles
    
    async def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile by user_id"""
        self._ensure_db()
        
        doc = await self.collection.find_one({"user_id": user_id})
        if doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            return UserProfile(**doc)
        return None
    
    async def create_or_update_profile(self, user_id: str, profile_data: dict) -> UserProfile:
        """Create or update user profile"""
        self._ensure_db()
        
        profile_data["user_id"] = user_id
        profile_data["updated_at"] = datetime.utcnow()
        
        # Check if profile exists
        existing = await self.collection.find_one({"user_id": user_id})
        
        if existing:
            # Update existing profile
            await self.collection.update_one(
                {"user_id": user_id},
                {"$set": profile_data}
            )
            profile_data["id"] = str(existing["_id"])
            profile_data["created_at"] = existing["created_at"]
        else:
            # Create new profile
            profile_data["created_at"] = datetime.utcnow()
            result = await self.collection.insert_one(profile_data)
            profile_data["id"] = str(result.inserted_id)
        
        return UserProfile(**profile_data)
    
    async def mark_astrology_data_fetched(self, user_id: str) -> bool:
        """Mark that astrology data has been fetched for user"""
        self._ensure_db()
        
        result = await self.collection.update_one(
            {"user_id": user_id},
            {"$set": {"has_astrology_data": True, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0
    
    def search_locations(self, query: str) -> List[LocationResult]:
        """Search for locations using geocoding API"""
        try:
            # Using OpenStreetMap Nominatim API (free)
            url = "https://nominatim.openstreetmap.org/search"
            params = {
                "q": query,
                "format": "json",
                "limit": 5,
                "addressdetails": 1
            }
            
            headers = {
                "User-Agent": "AstrologyApp/1.0"
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            
            results = []
            for item in response.json():
                # Calculate timezone based on longitude (rough approximation)
                timezone = round(float(item["lon"]) / 15)
                
                location = LocationResult(
                    name=item["display_name"],
                    latitude=float(item["lat"]),
                    longitude=float(item["lon"]),
                    country=item.get("address", {}).get("country", "Unknown"),
                    timezone=timezone
                )
                results.append(location)
            
            return results
            
        except Exception as e:
            logger.error(f"Location search error: {str(e)}")
            return []