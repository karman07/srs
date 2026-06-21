from fastapi import APIRouter, HTTPException, status, Depends
from app.astrology.schemas import BirthData, AstrologyQuery, AstrologyDataResponse, QueryResponse
from app.astrology.service import AstrologyService
from app.rag.custom_rag import CustomAstrologyRAG
from app.auth.service import auth_service
from app.auth.guards import require_user_or_admin
from app.users.models import User
from app.users.service import UserService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/astrology", tags=["astrology"])

@router.post("/fetch-data", response_model=AstrologyDataResponse)
async def fetch_astrology_data(
    birth_data: BirthData,
    current_user: User = Depends(require_user_or_admin)
):
    """Fetch all astrology data for the authenticated user"""
    try:
        astrology_service = AstrologyService()
        
        success = await astrology_service.fetch_all_astrology_data(
            current_user.id, 
            birth_data
        )
        
        if success:
            return AstrologyDataResponse(
                message="Astrology data fetched and stored successfully",
                data_fetched=True
            )
        else:
            return AstrologyDataResponse(
                message="Failed to fetch some astrology data, but partial data may be available",
                data_fetched=False
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fetch astrology data error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch astrology data. Please check your birth details and try again."
        )

@router.post("/query", response_model=QueryResponse)
async def query_astrology_data(
    query: AstrologyQuery,
    current_user: User = Depends(require_user_or_admin)
):
    """Answer natural language questions about user's astrology data using custom RAG"""
    try:
        # Check rate limit
        if not await auth_service.check_rate_limit(current_user):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Daily query limit exceeded. Upgrade to premium for unlimited queries."
            )

        # Use custom RAG system with user's astrology data only
        rag_system = CustomAstrologyRAG()
        result = await rag_system.query(current_user.id, query.question, raw_mode=getattr(query, 'raw', False))

        if result["sources_used"] == 0:
            return QueryResponse(
                answer="No astrology data found for your account. Please fetch your birth chart data first using the /astrology/fetch-data endpoint.",
                sources_used=0
            )

        # Increment user's prompt count
        user_service = UserService()
        await user_service.increment_prompt_count(current_user.id)

        return QueryResponse(
            answer=result["answer"],
            sources_used=result["sources_used"]
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Query astrology data error: {str(e)}")
        return QueryResponse(
            answer="I encountered an error while processing your question. Please try again with a simpler question or contact support if the issue persists.",
            sources_used=0
        )