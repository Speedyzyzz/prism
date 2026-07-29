from __future__ import annotations
"""
OmniShop OS — Application Configuration

Pydantic Settings with environment variable overrides.
All AI/LLM services default to mock mode for hackathon development.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application configuration with sensible defaults for local development."""

    # ── App ──────────────────────────────────────────────────────────────
    APP_NAME: str = "OmniShop OS"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # ── Database ─────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite+aiosqlite:///./omnishop.db"
    # For PostgreSQL: "postgresql+asyncpg://user:pass@localhost:5432/omnishop"

    # ── Security ─────────────────────────────────────────────────────────
    SECRET_KEY: str = "omnishop-hackathon-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for dev

    # ── CORS ─────────────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173", "*"]

    # ── AI Feature Flags ─────────────────────────────────────────────────
    USE_MOCK_LLM: bool = True
    USE_MOCK_VECTOR_DB: bool = True
    USE_MOCK_VISION: bool = True

    # ── AI API Keys (unused when mocks are enabled) ──────────────────────
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    COHERE_API_KEY: str = ""

    # ── Vector DB (Qdrant) ───────────────────────────────────────────────
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str = ""
    QDRANT_TEXT_COLLECTION: str = "products_text"
    QDRANT_IMAGE_COLLECTION: str = "products_image"

    # ── Redis / Cache ────────────────────────────────────────────────────
    REDIS_URL: str = ""  # Empty = use in-memory cache

    # ── Agent Configuration ──────────────────────────────────────────────
    MAX_REFLECTION_ATTEMPTS: int = 2
    STREAM_DELAY_MS: int = 30  # Simulated token streaming delay
    CONTEXT_WINDOW_TURNS: int = 15

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — one per process."""
    return Settings()
