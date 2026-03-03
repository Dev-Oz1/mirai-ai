from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    # Application Settings
    APP_NAME: str = "Mirai AI"
    ENVIRONMENT: str = "development"

    # Database Settings
    DATABASE_URL: str = "sqlite:///./mirai_ai.db"

    # Security Settings
    SECRET_KEY: str = "your-secret-key-change-this-in-production-make-it-very-long-and-random"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    OAUTH_STATE_EXPIRE_MINUTES: int = 10
    DELETE_REAUTH_MAX_AGE_MINUTES: int = 10
    ONLINE_HEARTBEAT_WINDOW_SECONDS: int = 180

    # App URLs
    FRONTEND_URL: str = "http://localhost:5173"
    API_BASE_URL: str = "http://localhost:8000"

    # OAuth - Google
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # OAuth - GitHub
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    ADMIN_EMAILS: str = ""
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = ""

    # CORS Settings
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:8080"

    # AI Settings
    AI_PROVIDER: str = "huggingface"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma2:2b"  # Changed from llama3.2
    HUGGINGFACE_MODEL: str = "meta-llama/Llama-3.1-8B-Instruct"

    # Paid AI (for premium users)
    ANTHROPIC_API_KEY: str = ""
    HUGGINGFACE_API_KEY: str = ""

    def get_cors_origins(self) -> list:
        """Convert comma-separated string to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    def get_admin_emails(self) -> list[str]:
        return [email.strip().lower() for email in self.ADMIN_EMAILS.split(",") if email.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    """
    Get cached settings instance.
    Uses lru_cache so settings are loaded only once.
    """
    return Settings()


# Create a global settings instance
settings = get_settings()
