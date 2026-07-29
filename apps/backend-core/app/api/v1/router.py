"""
Prism OS — API Router

Aggregates all endpoint routers under /api/v1.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, chat, search, cart, products, admin

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(chat.router)
api_router.include_router(search.router)
api_router.include_router(cart.router)
api_router.include_router(products.router)
api_router.include_router(admin.router)
