from __future__ import annotations
"""
OmniShop OS — Pydantic Schemas

Request/response models for all API endpoints, including typed
Generative UI payloads for the streaming chat interface.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Optional, Union

from pydantic import BaseModel, EmailStr, Field


# ══════════════════════════════════════════════════════════════════════════
# AUTH
# ══════════════════════════════════════════════════════════════════════════


class UserCreate(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="Account password")
    full_name: str = Field(..., min_length=1, description="User's full name")
    role: str = Field(default="CUSTOMER", description="User role")


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfileResponse(BaseModel):
    preferred_brands: list[str] = []
    size_preferences: dict[str, str] = {}
    preferred_colors: list[str] = []
    price_sensitivity_score: float = 0.50
    avg_spend_threshold: float = 200.00

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════════════════════════════════
# PRODUCTS
# ══════════════════════════════════════════════════════════════════════════


class ProductResponse(BaseModel):
    id: str
    sku: str
    title: str
    description: str
    brand: str
    price: float
    original_price: Optional[float] = None
    stock_quantity: int
    attributes: dict[str, Any] = {}
    images: list[str] = []
    category_name: Optional[str] = None
    rating_avg: float = 0.0
    rating_count: int = 0
    is_active: bool = True

    model_config = {"from_attributes": True}


class ProductSearchRequest(BaseModel):
    query: str = Field(..., description="Search query text")
    category: Optional[str] = None
    max_price: Optional[float] = None
    min_price: Optional[float] = None
    min_rating: Optional[float] = None
    limit: int = Field(default=10, le=50)


class ProductComparisonRequest(BaseModel):
    product_ids: list[str] = Field(..., min_length=2, max_length=5)


class ProductComparisonResponse(BaseModel):
    products: list[ProductResponse]
    comparison_matrix: dict[str, list[Any]]  # {"material": ["leather", "canvas"], ...}
    highlights: list[str] = []  # Key differences


class VisualSearchRequest(BaseModel):
    max_price: Optional[float] = None
    category: Optional[str] = None
    limit: int = Field(default=5, le=20)


class VisualSearchMatch(BaseModel):
    product_id: str
    similarity_score: float
    title: str
    price: float
    image_url: str
    brand: str = ""


class VisualSearchResponse(BaseModel):
    status: str = "success"
    matches: list[VisualSearchMatch]
    extracted_attributes: dict[str, str] = {}  # From vision analysis


# ══════════════════════════════════════════════════════════════════════════
# CART
# ══════════════════════════════════════════════════════════════════════════


class CartActionEnum(str, Enum):
    ADD = "ADD"
    REMOVE = "REMOVE"
    CLEAR = "CLEAR"
    APPLY_COUPON = "APPLY_COUPON"
    UPDATE_QUANTITY = "UPDATE_QUANTITY"


class CartActionRequest(BaseModel):
    action: CartActionEnum
    product_id: Optional[str] = None
    quantity: Optional[int] = Field(default=1, ge=1)
    coupon_code: Optional[str] = None


class CartItemResponse(BaseModel):
    product_id: str
    title: str
    price: float
    quantity: int
    image_url: Optional[str] = None
    subtotal: float

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    item_count: int
    subtotal: float
    discount_amount: float = 0.0
    applied_coupon: Optional[str] = None
    total: float


class CheckoutStagingResponse(BaseModel):
    cart: CartResponse
    estimated_tax: float
    shipping_options: list[dict[str, Any]]
    final_total: float
    checkout_url: str = ""


# ══════════════════════════════════════════════════════════════════════════
# ORDERS
# ══════════════════════════════════════════════════════════════════════════


class OrderResponse(BaseModel):
    id: str
    total_amount: float
    status: str
    fraud_score: float = 0.0
    fraud_risk: str = "LOW"
    created_at: datetime
    items: list[dict[str, Any]] = []

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════════════════════════════════
# ADMIN — FRAUD & REVIEWS
# ══════════════════════════════════════════════════════════════════════════


class ReturnRiskAuditItem(BaseModel):
    request_id: str
    order_id: str
    customer_email: str
    customer_name: str
    reason: str
    claimed_condition: str
    risk_score: float
    risk_level: str
    flagged_reasons: list[str]
    status: str
    created_at: datetime


class ReturnRiskAuditResponse(BaseModel):
    pending_returns: list[ReturnRiskAuditItem]
    total_count: int
    high_risk_count: int
    avg_risk_score: float


class ReviewAuditItem(BaseModel):
    review_id: str
    product_id: str
    product_title: str
    user_email: str
    rating: int
    review_text: str
    authenticity_score: float
    is_flagged_fake: bool
    is_verified_purchase: bool
    flag_reasons: list[str] = []
    created_at: datetime


class ReviewAuditResponse(BaseModel):
    reviews: list[ReviewAuditItem]
    total_count: int
    flagged_count: int
    avg_authenticity: float


# ══════════════════════════════════════════════════════════════════════════
# CHAT & GENERATIVE UI
# ══════════════════════════════════════════════════════════════════════════


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str = Field(..., min_length=1, description="User message")
    image_url: Optional[str] = None  # Base64 or URL
    stream: bool = True


class GenerativeUIType(str, Enum):
    PRODUCT_CARD = "PRODUCT_CARD"
    PRODUCT_CAROUSEL = "PRODUCT_CAROUSEL"
    COMPARISON_MATRIX = "COMPARISON_MATRIX"
    STAGED_CHECKOUT = "STAGED_CHECKOUT"
    REASONING_BADGE = "REASONING_BADGE"
    SIZE_GUIDE = "SIZE_GUIDE"
    ORDER_TRACKER = "ORDER_TRACKER"


class ReasoningBadge(BaseModel):
    product_id: str
    reasons: list[str]


class GenerativeUIPayload(BaseModel):
    """Typed payload emitted by the LLM for frontend Generative UI rendering."""
    type: GenerativeUIType
    data: Union[
        list[ProductResponse],           # PRODUCT_CAROUSEL
        ProductResponse,                 # PRODUCT_CARD
        ProductComparisonResponse,       # COMPARISON_MATRIX
        CheckoutStagingResponse,         # STAGED_CHECKOUT
        list[ReasoningBadge],            # REASONING_BADGE
        dict[str, Any],                  # SIZE_GUIDE, ORDER_TRACKER, generic
    ]


class ChatStreamEvent(BaseModel):
    """Individual SSE event in the chat stream."""
    event: str  # "text", "thinking", "generative_ui", "tool_call", "done", "error"
    data: Any


class RecommendationReason(BaseModel):
    product_id: str
    reasons: list[str]
    confidence: float = 0.85


# ══════════════════════════════════════════════════════════════════════════
# REVIEWS (User-facing)
# ══════════════════════════════════════════════════════════════════════════


class ReviewResponse(BaseModel):
    id: str
    rating: int
    review_text: str
    is_verified_purchase: bool
    created_at: datetime
    user_name: str = "Anonymous"

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════════════════════════════════
# GENERIC
# ══════════════════════════════════════════════════════════════════════════


class PaginatedResponse(BaseModel):
    items: list[Any]
    total: int
    page: int = 1
    page_size: int = 20
    has_more: bool = False


class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str
    environment: str
