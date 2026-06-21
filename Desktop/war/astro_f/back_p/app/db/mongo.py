from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None
    database = None

mongodb = MongoDB()

async def connect_to_mongo():
    """Create database connection"""
    mongodb.client = AsyncIOMotorClient(settings.mongo_uri)
    mongodb.database = mongodb.client.get_default_database()
    
    # Create indexes
    await mongodb.database.users.create_index("email", unique=True)
    await mongodb.database.astrology_data.create_index("user_id")
    
    logger.info("Connected to MongoDB")

async def close_mongo_connection():
    """Close database connection"""
    mongodb.client.close()
    logger.info("Disconnected from MongoDB")

def get_database():
    return mongodb.database