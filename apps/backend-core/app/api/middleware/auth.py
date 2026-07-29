from __future__ import annotations
"""
Prism OS — Auth Middleware

JWT Bearer token validation and user extraction middleware.
"""

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from jose import JWTError

from app.core.config import get_settings
from app.core.security import decode_access_token

settings = get_settings()

# Paths that don't require authentication
PUBLIC_PATHS = {
    "/",
    "/docs",
    "/openapi.json",
    "/redoc",
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/health",
}

# Path prefixes that don't require authentication
PUBLIC_PREFIXES = (
    "/docs",
    "/openapi.json",
    "/redoc",
    "/api/v1/auth/",
    "/api/v1/health",
    "/api/v1/products",  # Product browsing is public
)


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Optional authentication middleware.

    In development mode, allows unauthenticated access and sets a
    default user context. In production, enforces JWT validation.
    """

    async def dispatch(self, request: Request, call_next):
        # Skip auth for public paths
        path = request.url.path
        if path in PUBLIC_PATHS or any(path.startswith(p) for p in PUBLIC_PREFIXES):
            return await call_next(request)

        # In dev mode, allow unauthenticated access with a default user
        if settings.DEBUG:
            auth_header = request.headers.get("authorization", "")
            if not auth_header:
                # Set default demo user context
                request.state.user_id = "demo-user-001"
                request.state.user_role = "CUSTOMER"
                return await call_next(request)

        # Validate JWT token
        auth_header = request.headers.get("authorization", "")
        if not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid authorization header",
            )

        token = auth_header.split(" ", 1)[1]
        try:
            payload = decode_access_token(token)
            request.state.user_id = payload.get("sub", "")
            request.state.user_role = payload.get("role", "CUSTOMER")
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )

        return await call_next(request)
