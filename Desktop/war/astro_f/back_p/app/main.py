from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.db.mongo import connect_to_mongo, close_mongo_connection
from app.auth.routes import router as auth_router
from app.astrology.routes import router as astrology_router
from app.chat.routes import router as chat_router
from app.premium.routes import router as premium_router
from app.admin.routes import router as admin_router
from app.contact.routes import router as contact_router
from app.razorpay.routes import router as razorpay_router
from app.subscription.routes import router as subscription_router
# from app.profile.routes import router as profile_router
import logging
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure logs directory exists
LOG_DIR = Path(os.getenv("LOG_DIR", "logs"))
LOG_DIR.mkdir(parents=True, exist_ok=True)

# Suppress uvicorn access logs (they produce lines like: INFO:     127.0.0.1:62705 - "POST /..."
access_logger = logging.getLogger("uvicorn.access")
access_logger.setLevel(logging.WARNING)

# Dedicated LLM/prompt logger writing to file to capture full prompts and input data
llm_logger = logging.getLogger("llm")
if not llm_logger.handlers:
    fh = logging.FileHandler(LOG_DIR / "llm_prompts.log")
    fh.setLevel(logging.INFO)
    formatter = logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")
    fh.setFormatter(formatter)
    llm_logger.addHandler(fh)
    llm_logger.propagate = False

# Create FastAPI app
app = FastAPI(
    title="Astrology RAG API",
    description="A FastAPI application implementing user-based RAG system for astrology data",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred. Please try again later.",
            "error_type": "internal_server_error"
        }
    )

# Include routers
app.include_router(auth_router)
app.include_router(astrology_router)
app.include_router(chat_router)
app.include_router(premium_router)
app.include_router(admin_router)
app.include_router(contact_router)
app.include_router(razorpay_router)
app.include_router(subscription_router)
# app.include_router(profile_router)

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    try:
        await connect_to_mongo()
        logger.info("Application started successfully")
    except Exception as e:
        logger.error(f"Startup error: {str(e)}")
        # Re-raise so the server doesn't run without a working DB connection
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    try:
        await close_mongo_connection()
        logger.info("Application shutdown complete")
    except Exception as e:
        logger.error(f"Shutdown error: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Astrology RAG API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "auth": "/auth/signup, /auth/login, /auth/google-auth",
            "astrology": "/astrology/fetch-data, /astrology/query",
            "chat": "/chat/message, /chat/history",
            "premium": "/premium/upgrade",
            "admin": "/admin/pricing, /admin/chats, /admin/stats",
            "contact": "/contact/",
            "razorpay": "/razorpay/plans, /razorpay/create-order, /razorpay/verify-payment",
            "subscription": "/subscription/plans, /subscription/create-order",
            # "profile": "/profile/, /profile/search-locations"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)