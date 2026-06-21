from fastapi import WebSocket, WebSocketDisconnect, Depends
from app.chat.service import ChatService
from app.auth.service import auth_service
from app.users.service import UserService
from app.chat.models import WebSocketMessage, MessageCreate
from typing import Dict, List
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
    
    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    # Remove dead connections
                    self.active_connections[user_id].remove(connection)

manager = ConnectionManager()

class WebSocketHandler:
    def __init__(self):
        self.chat_service = None
        self.user_service = None
    
    def _ensure_services(self):
        """Lazy initialization of services"""
        if self.chat_service is None:
            self.chat_service = ChatService()
        if self.user_service is None:
            self.user_service = UserService()
    
    async def handle_websocket(self, websocket: WebSocket, token: str):
        try:
            self._ensure_services()
            
            # Verify token
            payload = auth_service.verify_token(token)
            if not payload:
                await websocket.close(code=4001, reason="Invalid token")
                return
            
            user = await self.user_service.get_user_by_email(payload.get("sub"))
            if not user:
                await websocket.close(code=4001, reason="User not found")
                return
            
            # Check if user is active
            if not user.is_active:
                await websocket.close(code=4003, reason="Account suspended")
                return
            
            await manager.connect(websocket, user.id)
            
            try:
                while True:
                    data = await websocket.receive_text()
                    message_data = json.loads(data)
                    
                    await self.process_message(user, message_data)
                    
            except WebSocketDisconnect:
                manager.disconnect(websocket, user.id)
                
        except Exception as e:
            logger.error(f"WebSocket error: {str(e)}")
            await websocket.close(code=4000, reason="Internal error")
    
    async def process_message(self, user, message_data: dict):
        try:
            message_type = message_data.get("type")
            
            if message_type == "send_message":
                await self.handle_send_message(user, message_data)
            elif message_type == "typing":
                await self.handle_typing(user, message_data)
            else:
                await manager.send_personal_message({
                    "type": "error",
                    "message": "Unknown message type"
                }, user.id)
                
        except Exception as e:
            logger.error(f"Message processing error: {str(e)}")
            await manager.send_personal_message({
                "type": "error",
                "message": "Failed to process message"
            }, user.id)
    
    async def handle_send_message(self, user, message_data: dict):
        chat_id = message_data.get("chat_id")
        content = message_data.get("content")
        
        if not chat_id or not content:
            await manager.send_personal_message({
                "type": "error",
                "message": "Missing chat_id or content"
            }, user.id)
            return
        
        # Check rate limit for free users
        if user.plan_type == "free":
            if not await auth_service.check_rate_limit(user):
                logger.warning(f"WebSocket rate limit exceeded for user {user.email}")
                print(f"🚫 WebSocket rate limit hit - User: {user.email}, Current count: {user.prompt_count}")
                
                await manager.send_personal_message({
                    "type": "rate_limit_exceeded",
                    "error": "Daily query limit exceeded",
                    "message": "You have reached your daily limit of 5 queries. Upgrade to premium for unlimited queries.",
                    "current_count": user.prompt_count,
                    "limit": 5,
                    "plan_type": "free",
                    "upgrade_available": True
                }, user.id)
                return
            
            # Increment prompt count
            await self.user_service.increment_prompt_count(user.id)
            print(f"✅ WebSocket message sent - User: {user.email}, Count: {user.prompt_count + 1}/5")
        
        try:
            # Send typing indicator
            await manager.send_personal_message({
                "type": "ai_typing",
                "chat_id": chat_id
            }, user.id)
            
            # Send message and get response
            user_message, ai_message = await self.chat_service.send_message(
                user.id, chat_id, content
            )
            
            # Send user message
            await manager.send_personal_message({
                "type": "message",
                "message": {
                    "id": user_message.id,
                    "content": user_message.content,
                    "message_type": user_message.message_type,
                    "timestamp": user_message.timestamp.isoformat(),
                    "chat_id": chat_id
                }
            }, user.id)
            
            # Send AI response
            await manager.send_personal_message({
                "type": "message",
                "message": {
                    "id": ai_message.id,
                    "content": ai_message.content,
                    "message_type": ai_message.message_type,
                    "timestamp": ai_message.timestamp.isoformat(),
                    "chat_id": chat_id
                }
            }, user.id)
            
        except ValueError as e:
            await manager.send_personal_message({
                "type": "error",
                "message": str(e)
            }, user.id)
    
    async def handle_typing(self, user, message_data: dict):
        # For future implementation of typing indicators
        pass

# Lazy initialization - will be created when needed
websocket_handler = None

def get_websocket_handler():
    global websocket_handler
    if websocket_handler is None:
        websocket_handler = WebSocketHandler()
    return websocket_handler