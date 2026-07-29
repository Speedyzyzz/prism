from __future__ import annotations
"""
OmniShop OS — Product Endpoints

Product listing, detail, reviews, and comparison.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.db_models import Product, Category, ProductReview
from app.models.schemas import ProductResponse, ProductComparisonRequest
from app.mcp_servers.catalog_tools import compare_products

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("")
async def list_products(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    brand: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List products with optional filtering and pagination."""
    stmt = (
        select(Product)
        .where(Product.is_active == True)
        .options(selectinload(Product.category))
    )

    if category:
        cat_result = await db.execute(
            select(Category).where(Category.slug == category)
        )
        cat = cat_result.scalar_one_or_none()
        if cat:
            stmt = stmt.where(Product.category_id == cat.id)

    if min_price is not None:
        stmt = stmt.where(Product.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Product.price <= max_price)
    if brand:
        stmt = stmt.where(Product.brand.ilike(f"%{brand}%"))

    # Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = await db.scalar(count_stmt) or 0

    # Paginate
    offset = (page - 1) * page_size
    stmt = stmt.offset(offset).limit(page_size).order_by(Product.created_at.desc())

    result = await db.execute(stmt)
    products = result.scalars().all()

    return {
        "products": [
            {
                "id": p.id,
                "sku": p.sku,
                "title": p.title,
                "description": p.description[:200] + "..." if len(p.description) > 200 else p.description,
                "brand": p.brand,
                "price": float(p.price),
                "original_price": float(p.original_price) if p.original_price else None,
                "stock_quantity": p.stock_quantity,
                "attributes": p.attributes or {},
                "images": p.images or [],
                "category_name": p.category.name if p.category else "",
                "rating_avg": float(p.rating_avg),
                "rating_count": p.rating_count,
            }
            for p in products
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_more": offset + page_size < total,
    }


@router.get("/{product_id}")
async def get_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get full product details by ID."""
    from app.mcp_servers.catalog_tools import get_product_details

    result = await get_product_details(db, product_id)

    if result["status"] == "error":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["message"],
        )

    return result


@router.get("/{product_id}/reviews")
async def get_product_reviews(
    product_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get reviews for a product."""
    # Verify product exists
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    # Query reviews
    stmt = (
        select(ProductReview)
        .where(ProductReview.product_id == product_id)
        .options(selectinload(ProductReview.user))
        .order_by(ProductReview.created_at.desc())
    )

    count = await db.scalar(
        select(func.count()).select_from(
            select(ProductReview.id).where(ProductReview.product_id == product_id).subquery()
        )
    ) or 0

    offset = (page - 1) * page_size
    stmt = stmt.offset(offset).limit(page_size)

    result = await db.execute(stmt)
    reviews = result.scalars().all()

    return {
        "product_id": product_id,
        "product_title": product.title,
        "reviews": [
            {
                "id": r.id,
                "rating": r.rating,
                "review_text": r.review_text,
                "is_verified_purchase": r.is_verified_purchase,
                "user_name": r.user.full_name if r.user else "Anonymous",
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in reviews
        ],
        "total": count,
        "page": page,
        "page_size": page_size,
        "avg_rating": float(product.rating_avg),
    }


@router.post("/compare")
async def compare(
    payload: ProductComparisonRequest,
    db: AsyncSession = Depends(get_db),
):
    """Compare multiple products side-by-side."""
    result = await compare_products(db, payload.product_ids)

    if result["status"] == "error":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"],
        )

    return result
