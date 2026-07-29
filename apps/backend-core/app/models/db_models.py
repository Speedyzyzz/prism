"""
OmniShop OS — SQLAlchemy ORM Models

Full relational schema matching the spec's DDL (Section 6).
Uses SQLAlchemy 2.0 declarative mapping with type annotations.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.sqlite import JSON  # Portable JSON (works on SQLite + PG)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# ── Helpers ──────────────────────────────────────────────────────────────
def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ── Enums (stored as strings for SQLite compatibility) ───────────────────
USER_ROLES = ("CUSTOMER", "MERCHANT", "ADMIN")
ORDER_STATUSES = ("PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED")
RETURN_STATUSES = ("SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED")
FRAUD_RISK_LEVELS = ("LOW", "MEDIUM", "HIGH", "CRITICAL")


# ══════════════════════════════════════════════════════════════════════════
# USERS & PROFILES
# ══════════════════════════════════════════════════════════════════════════


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(
        String(20), default="CUSTOMER", nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    # Relationships
    profile: Mapped[Optional["UserProfile"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False
    )
    cart: Mapped[Optional["Cart"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False
    )
    orders: Mapped[list["Order"]] = relationship(back_populates="user")
    reviews: Mapped[list["ProductReview"]] = relationship(back_populates="user")
    return_requests: Mapped[list["ReturnRequest"]] = relationship(
        back_populates="user"
    )


class UserProfile(Base):
    """Personalization context — preferred brands, sizes, price sensitivity."""

    __tablename__ = "user_profiles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    preferred_brands: Mapped[Optional[dict]] = mapped_column(
        JSON, default=list  # Stored as JSON array
    )
    size_preferences: Mapped[Optional[dict]] = mapped_column(
        JSON, default=dict  # e.g., {"tops": "L", "shoes": "10"}
    )
    price_sensitivity_score: Mapped[float] = mapped_column(
        Numeric(3, 2), default=0.50
    )
    preferred_colors: Mapped[Optional[dict]] = mapped_column(
        JSON, default=list
    )
    historical_tags: Mapped[Optional[dict]] = mapped_column(
        JSON, default=dict
    )
    avg_spend_threshold: Mapped[float] = mapped_column(
        Numeric(10, 2), default=200.00
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="profile")


# ══════════════════════════════════════════════════════════════════════════
# CATALOG
# ══════════════════════════════════════════════════════════════════════════


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    parent_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    products: Mapped[list["Product"]] = relationship(back_populates="category")
    children: Mapped[list["Category"]] = relationship(back_populates="parent")
    parent: Mapped[Optional["Category"]] = relationship(
        back_populates="children", remote_side="Category.id"
    )


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    sku: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("categories.id"), nullable=False
    )
    brand: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    original_price: Mapped[Optional[float]] = mapped_column(
        Numeric(10, 2), nullable=True
    )
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    attributes: Mapped[Optional[dict]] = mapped_column(
        JSON, default=dict  # {"color": "black", "material": "leather", "fit": "regular"}
    )
    images: Mapped[Optional[dict]] = mapped_column(
        JSON, default=list  # List of image URLs
    )
    rating_avg: Mapped[float] = mapped_column(Numeric(2, 1), default=0.0)
    rating_count: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )

    # Relationships
    category: Mapped["Category"] = relationship(back_populates="products", lazy="selectin")
    reviews: Mapped[list["ProductReview"]] = relationship(back_populates="product", lazy="selectin")
    cart_items: Mapped[list["CartItem"]] = relationship(back_populates="product")
    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="product")


# ══════════════════════════════════════════════════════════════════════════
# CART
# ══════════════════════════════════════════════════════════════════════════


class Cart(Base):
    __tablename__ = "carts"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    applied_coupon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    discount_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="cart")
    items: Mapped[list["CartItem"]] = relationship(
        back_populates="cart", cascade="all, delete-orphan", lazy="selectin"
    )


class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = (
        UniqueConstraint("cart_id", "product_id", name="uq_cart_product"),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    cart_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("carts.id", ondelete="CASCADE"), nullable=False
    )
    product_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("products.id"), nullable=False
    )
    quantity: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    # Relationships
    cart: Mapped["Cart"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(back_populates="cart_items", lazy="selectin")


# ══════════════════════════════════════════════════════════════════════════
# ORDERS
# ══════════════════════════════════════════════════════════════════════════


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default="PENDING", nullable=False
    )
    shipping_address: Mapped[Optional[dict]] = mapped_column(JSON, nullable=False)
    fraud_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0.00)
    fraud_risk: Mapped[str] = mapped_column(
        String(20), default="LOW", nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )
    return_requests: Mapped[list["ReturnRequest"]] = relationship(
        back_populates="order"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    order_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    product_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("products.id"), nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    # Relationships
    order: Mapped["Order"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(back_populates="order_items")


# ══════════════════════════════════════════════════════════════════════════
# RETURNS & FRAUD (PS 3)
# ══════════════════════════════════════════════════════════════════════════


class ReturnRequest(Base):
    __tablename__ = "return_requests"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    order_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("orders.id"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    claimed_condition: Mapped[str] = mapped_column(String(100), nullable=False)
    risk_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0.00)
    risk_factors: Mapped[Optional[dict]] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(
        String(20), default="SUBMITTED", nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )

    # Relationships
    order: Mapped["Order"] = relationship(back_populates="return_requests")
    user: Mapped["User"] = relationship(back_populates="return_requests")


# ══════════════════════════════════════════════════════════════════════════
# PRODUCT REVIEWS (PS 8)
# ══════════════════════════════════════════════════════════════════════════


class ProductReview(Base):
    __tablename__ = "product_reviews"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    product_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    review_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_verified_purchase: Mapped[bool] = mapped_column(Boolean, default=False)
    authenticity_score: Mapped[float] = mapped_column(Numeric(3, 2), default=1.00)
    is_flagged_fake: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )

    # Relationships
    product: Mapped["Product"] = relationship(back_populates="reviews")
    user: Mapped["User"] = relationship(back_populates="reviews")
