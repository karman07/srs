from fastapi import APIRouter, HTTPException, status, Depends, WebSocket, Query
from app.chat.models import ChatCreate, MessageCreate, ChatResponse, ChatWithMessages
from app.chat.service import ChatService
from app.chat.websocket import get_websocket_handler
from app.auth.guards import require_user_or_admin
from app.auth.service import auth_service
from app.users.models import User
from app.users.service import UserService
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    """WebSocket endpoint for real-time chat"""
    handler = get_websocket_handler()
    await handler.handle_websocket(websocket, token)

@router.post("/", response_model=ChatResponse)
async def create_chat(
    chat_data: ChatCreate,
    current_user: User = Depends(require_user_or_admin)
):
    """Create a new chat conversation"""
    try:
        chat_service = ChatService()
        chat = await chat_service.create_chat(current_user.id, chat_data.title)
        
        return ChatResponse(
            id=chat.id,
            title=chat.title,
            created_at=chat.created_at,
            updated_at=chat.updated_at,
            message_count=0
        )
        
    except Exception as e:
        logger.error(f"Create chat error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create chat"
        )

@router.get("/", response_model=List[ChatResponse])
async def get_user_chats(
    current_user: User = Depends(require_user_or_admin)
):
    """Get all chats for the current user"""
    try:
        chat_service = ChatService()
        chats = await chat_service.get_user_chats(current_user.id)
        return chats
        
    except Exception as e:
        logger.error(f"Get user chats error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve chats"
        )

@router.get("/{chat_id}", response_model=ChatWithMessages)
async def get_chat_with_messages(
    chat_id: str,
    current_user: User = Depends(require_user_or_admin)
):
    """Get a specific chat with all its messages"""
    try:
        chat_service = ChatService()
        chat = await chat_service.get_chat_with_messages(current_user.id, chat_id)
        
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        
        return chat
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get chat with messages error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve chat"
        )

@router.post("/{chat_id}/messages")
async def send_message_http(
    chat_id: str,
    message_data: MessageCreate,
    current_user: User = Depends(require_user_or_admin)
):
    """Send a message via HTTP (fallback for non-WebSocket clients)"""
    try:
        # TODO: Re-enable birth data validation after profile module is fixed
        # Check if user has birth data before allowing chat
        # from app.profile.service import ProfileService
        # profile_service = ProfileService()
        # profile = await profile_service.get_user_profile(current_user.id)
        # 
        # if not profile or not profile.has_astrology_data:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail={
        #             "error": "Birth data required",
        #             "message": "Please complete your birth details and fetch astrology data before starting a chat.",
        #             "action_required": "complete_profile",
        #             "profile_complete": profile is not None if profile else False,
        #             "astrology_data_fetched": profile.has_astrology_data if profile else False
        #         }
        #     )
        
        # Check rate limit for free users
        if current_user.plan_type == "free":
            if not await auth_service.check_rate_limit(current_user):
                logger.warning(f"Rate limit exceeded for user {current_user.email} in chat {chat_id}")
                print(f"🚫 Rate limit hit - User: {current_user.email}, Chat: {chat_id}, Current count: {current_user.prompt_count}")
                
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": "Daily query limit exceeded",
                        "message": "You have reached your daily limit of 5 queries. Upgrade to premium for unlimited queries.",
                        "current_count": current_user.prompt_count,
                        "limit": 5,
                        "plan_type": "free",
                        "upgrade_available": True
                    }
                )
            
            # Increment prompt count
            user_service = UserService()
            await user_service.increment_prompt_count(current_user.id)
            print(f"✅ Message sent - User: {current_user.email}, Count: {current_user.prompt_count + 1}/5")
        
        chat_service = ChatService()
        user_message, ai_message = await chat_service.send_message(
            current_user.id, chat_id, message_data.content
        )
        
        return {
            "user_message": {
                "id": user_message.id,
                "content": user_message.content,
                "message_type": user_message.message_type,
                "timestamp": user_message.timestamp
            },
            "ai_message": {
                "id": ai_message.id,
                "content": ai_message.content,
                "message_type": ai_message.message_type,
                "timestamp": ai_message.timestamp
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Send message error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send message"
        )

@router.put("/{chat_id}/title")
async def update_chat_title(
    chat_id: str,
    title_data: dict,
    current_user: User = Depends(require_user_or_admin)
):
    """Update chat title"""
    try:
        title = title_data.get("title")
        if not title:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title is required"
            )
        
        chat_service = ChatService()
        success = await chat_service.update_chat_title(current_user.id, chat_id, title)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        
        return {"message": "Chat title updated successfully", "chat_id": chat_id, "title": title}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update chat title error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update chat title"
        )

@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: str,
    current_user: User = Depends(require_user_or_admin)
):
    """Delete a chat and all its messages"""
    try:
        chat_service = ChatService()
        success = await chat_service.delete_chat(current_user.id, chat_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found"
            )
        
        return {"message": "Chat deleted successfully", "chat_id": chat_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete chat error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete chat"
        )

@router.delete("/{chat_id}/messages/{message_id}")
async def delete_message(
    chat_id: str,
    message_id: str,
    current_user: User = Depends(require_user_or_admin)
):
    """Delete a specific message"""
    try:
        chat_service = ChatService()
        success = await chat_service.delete_message(current_user.id, chat_id, message_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        
        return {"message": "Message deleted successfully", "message_id": message_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete message error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete message"
        )