"""
Core configuration settings for the Dental-AI Booking API.
"""
import os
from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with validation."""
    
    # FastAPI settings
    app_name: str = "Dental-AI Booking API"
    app_version: str = "0.1.0"
    debug: bool = False
    
    # Google Cloud settings
    project_id: str = "dental-dev"
    location: str = "us-central1"
    
    # Vertex AI settings
    vertex_ai_model: str = "medpalm2-text-bison@001"
    vertex_ai_endpoint: Optional[str] = None
    
    # Firestore settings
    firestore_database: str = "(default)"
    
    # CORS settings
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://localhost:3000",
        "https://localhost:5173"
    ]
    
    model_config = {"env_file": ".env", "case_sensitive": False}


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
