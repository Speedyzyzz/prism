from __future__ import annotations
"""
OmniShop OS — Database Layer

Async SQLAlchemy engine, session factory, and base model.
Uses SQLite for local dev, swappable to PostgreSQL via config.
"""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator

from app.core.config import get_settings

settings = get_settings()

# ── Engine ───────────────────────────────────────────────────────────────
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    # SQLite-specific: allow async usage
    connect_args={"check_same_thread": False}
    if "sqlite" in settings.DATABASE_URL
    else {},
)

# ── Session Factory ──────────────────────────────────────────────────────
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ── Base Model ───────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """Declarative base for all ORM models."""
    pass


# ── Dependency ───────────────────────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields an async database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ── Lifecycle ────────────────────────────────────────────────────────────
async def init_db() -> None:
    """Create all tables. Called during app startup."""
    async with engine.begin() as conn:
        from app.models.db_models import (  # noqa: F401 — ensure models are registered
            User,
            UserProfile,
            Category,
            Product,
            Cart,
            CartItem,
            Order,
            OrderItem,
            ReturnRequest,
            ProductReview,
        )
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Dispose engine. Called during app shutdown."""
    await engine.dispose()
