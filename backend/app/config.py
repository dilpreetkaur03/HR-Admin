from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    app_name: str = "HRMS Lite"
    debug: bool = False
    
    # MongoDB settings - defaults to localhost, override with MONGODB_URL env var
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "hrms_lite"
    
    # CORS settings - allow common development ports
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
    ]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

