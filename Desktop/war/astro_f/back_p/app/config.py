import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    mongo_uri: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/astro_rag")
    jwt_secret: str = os.getenv("JWT_SECRET", "default-secret-key")
    astrology_api_key: str = os.getenv("ASTROLOGY_API_KEY", "")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_expire_minutes: int = int(os.getenv("JWT_EXPIRE_MINUTES", "525600"))
    firebase_project_id: str = os.getenv("FIREBASE_PROJECT_ID", "")
    firebase_private_key: str = os.getenv("FIREBASE_PRIVATE_KEY", "")
    firebase_client_email: str = os.getenv("FIREBASE_CLIENT_EMAIL", "")
    
    # Razorpay settings
    razorpay_key_id: str = os.getenv("RAZORPAY_KEY_ID", "")
    razorpay_key_secret: str = os.getenv("RAZORPAY_KEY_SECRET", "")
    razorpay_webhook_secret: str = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")
    
    # Default pricing in INR
    free_plan_queries: int = int(os.getenv("FREE_PLAN_QUERIES", "5"))
    premium_plan_price_inr: float = float(os.getenv("PREMIUM_PLAN_PRICE_INR", "999.0"))

settings = Settings()