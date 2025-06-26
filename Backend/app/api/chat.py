"""
Chat API routes for the Dental-AI Booking API.
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse

from ..models import ChatMessage, ChatResponse, ErrorResponse
from ..services import vertex_ai_service
from ..core import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(chat_message: ChatMessage) -> ChatResponse:
    """
    Send a message to the dental AI chatbot and get a response.
    
    Args:
        chat_message: The user's message and optional session ID
        
    Returns:
        ChatResponse: The bot's response with session ID and timestamp
        
    Raises:
        HTTPException: If the chat service is unavailable
    """
    try:
        logger.info(f"Processing chat message: {chat_message.message[:50]}...")
        
        response = await vertex_ai_service.generate_response(chat_message)
        
        logger.info(f"Generated response for session {response.session_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail="Chat service is currently unavailable. Please try again later."
        )


@router.get("/chat/health")
async def chat_health_check() -> JSONResponse:
    """
    Check the health of the chat service.
    
    Returns:
        JSONResponse: Service health status
    """
    try:
        # Simple health check - could be expanded to test Vertex AI connectivity
        return JSONResponse(
            status_code=200,
            content={
                "status": "healthy",
                "service": "chat",
                "vertex_ai_model": vertex_ai_service._model_name,
                "timestamp": str(vertex_ai_service._sessions.__len__()) + " active sessions"
            }
        )
    except Exception as e:
        logger.error(f"Chat health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "service": "chat",
                "error": str(e)
            }
        )
