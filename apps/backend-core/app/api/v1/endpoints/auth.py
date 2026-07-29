from __future__ import annotations
"""
Prism OS — Auth Endpoints

User registration, login, and profile retrieval.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
    require_auth,
)
from app.models.db_models import User, UserProfile
from app.models.schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    UserProfileResponse,
    TokenResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    # Check if email already exists
    existing = await db.execute(
        select(User).where(User.email == payload.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create user
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
    )
    db.add(user)
    await db.flush()

    # Create default profile
    profile = UserProfile(user_id=user.id)
    db.add(profile)
    await db.flush()

    # Generate token
    token = create_access_token(data={"sub": user.id, "role": user.role})

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        role=user.role,
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate and receive a JWT access token."""
    result = await db.execute(
        select(User).where(User.email == payload.email)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(data={"sub": user.id, "role": user.role})

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        role=user.role,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(require_auth)):
    """Get the current authenticated user's info."""
    return UserResponse.model_validate(user)


@router.get("/me/profile", response_model=UserProfileResponse)
async def get_my_profile(
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's personalization profile."""
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        return UserProfileResponse()

    return UserProfileResponse(
        preferred_brands=profile.preferred_brands or [],
        size_preferences=profile.size_preferences or {},
        preferred_colors=profile.preferred_colors or [],
        price_sensitivity_score=float(profile.price_sensitivity_score) if profile.price_sensitivity_score else 0.50,
        avg_spend_threshold=float(profile.avg_spend_threshold) if profile.avg_spend_threshold else 200.00,
    )
