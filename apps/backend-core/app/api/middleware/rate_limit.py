from __future__ import annotations
"""
OmniShop OS — Rate Limiting Middleware

Simple in-memory rate limiter. Upgradeable to Redis in production.
"""

import time
from collections import defaultdict
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Token bucket rate limiter using in-memory storage.

    Config:
        - max_requests: Maximum requests per window (default: 60)
        - window_seconds: Time window in seconds (default: 60)
    """

    def __init__(self, app, max_requests: int = 60, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # Get client identifier (IP or user ID)
        client_id = self._get_client_id(request)

        # Clean old entries
        now = time.time()
        self._requests[client_id] = [
            ts for ts in self._requests[client_id]
            if now - ts < self.window_seconds
        ]

        # Check rate limit
        if len(self._requests[client_id]) >= self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later.",
                headers={
                    "Retry-After": str(self.window_seconds),
                    "X-RateLimit-Limit": str(self.max_requests),
                    "X-RateLimit-Remaining": "0",
                },
            )

        # Record request
        self._requests[client_id].append(now)

        # Add rate limit headers to response
        response = await call_next(request)
        remaining = self.max_requests - len(self._requests[client_id])
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
        response.headers["X-RateLimit-Reset"] = str(self.window_seconds)

        return response

    def _get_client_id(self, request: Request) -> str:
        """Extract client identifier for rate limiting."""
        # Prefer user ID from auth middleware
        user_id = getattr(request.state, "user_id", None)
        if user_id:
            return f"user:{user_id}"

        # Fall back to IP address
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return f"ip:{forwarded.split(',')[0].strip()}"

        return f"ip:{request.client.host if request.client else 'unknown'}"
