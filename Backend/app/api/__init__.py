"""
API routes module initialization.
"""
from fastapi import APIRouter

from .chat import router as chat_router

# Main API router
router = APIRouter()

# Include sub-routers
router.include_router(chat_router, prefix="/chat", tags=["chat"])

__all__ = ["router"]
