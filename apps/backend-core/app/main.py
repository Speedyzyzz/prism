from __future__ import annotations
"""
OmniShop OS — FastAPI Application Entry Point

Application factory with CORS, middleware, lifespan handlers,
and API router mounting.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import init_db, close_db
from app.api.v1.router import api_router
from app.api.middleware.rate_limit import RateLimitMiddleware
from app.models.schemas import HealthResponse

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown hooks."""
    # ── Startup ──────────────────────────────────────────────────────
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"🌍 Environment: {settings.ENVIRONMENT}")
    print(f"🗄️  Database: {settings.DATABASE_URL}")
    print(f"🤖 Mock LLM: {settings.USE_MOCK_LLM}")
    print(f"🔍 Mock Vector DB: {settings.USE_MOCK_VECTOR_DB}")

    # Initialize database tables
    await init_db()
    print("✅ Database tables created")

    # Seed demo data if database is empty
    await _seed_if_empty()

    print(f"🎯 {settings.APP_NAME} is ready!")
    print(f"📖 API docs: http://localhost:8000/docs")

    yield

    # ── Shutdown ─────────────────────────────────────────────────────
    await close_db()
    print(f"👋 {settings.APP_NAME} shutdown complete")


async def _seed_if_empty():
    """Seed demo data if the database has no products."""
    from app.core.database import async_session_factory
    from sqlalchemy import select, func
    from app.models.db_models import Product

    async with async_session_factory() as session:
        count = await session.scalar(select(func.count(Product.id)))
        if count == 0:
            print("📦 Database is empty — seeding demo data...")
            from scripts.seed_database import seed_all
            await seed_all(session)
            await session.commit()
            print("✅ Demo data seeded successfully")
        else:
            print(f"📦 Database has {count} products — skipping seed")


def create_app() -> FastAPI:
    """FastAPI application factory."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "AI-Powered Commerce Operating System — "
            "Conversational shopping, visual search, agentic checkout, "
            "and merchant fraud analytics."
        ),
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ── CORS ─────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Session-Id", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
    )

    # ── Rate Limiting ────────────────────────────────────────────────
    app.add_middleware(RateLimitMiddleware, max_requests=120, window_seconds=60)

    # ── Routes ───────────────────────────────────────────────────────
    app.include_router(api_router)

    # ── Health Check ─────────────────────────────────────────────────
    @app.get("/", tags=["Health"])
    async def root():
        return {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "status": "running",
            "docs": "/docs",
        }

    @app.get("/api/v1/health", response_model=HealthResponse, tags=["Health"])
    async def health():
        return HealthResponse(
            version=settings.APP_VERSION,
            environment=settings.ENVIRONMENT,
        )

    return app


# ── ASGI Application ────────────────────────────────────────────────────
app = create_app()
