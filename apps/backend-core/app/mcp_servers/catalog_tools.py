from __future__ import annotations
"""
OmniShop OS — Catalog MCP Tools

MCP-compliant tool functions for product search, visual search,
product comparison, and detail retrieval.
"""

from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.db_models import Product, Category
from app.services.mock_vector_search import get_vector_search
from app.services.vision_service import get_vision_service
from app.services.recommendation import get_recommendation_service


async def search_catalog(
    db: AsyncSession,
    query: str,
    category: Optional[str] = None,
    max_price: Optional[float] = None,
    min_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    material: Optional[str] = None,
    color: Optional[str] = None,
    limit: int = 10,
) -> dict[str, Any]:
    """
    MCP Tool: search_catalog
    Performs hybrid semantic and structured query over product database.
    """
    vector_search = get_vector_search()

    results = await vector_search.text_search(
        db=db,
        query=query,
        category=category,
        max_price=max_price,
        min_price=min_price,
        min_rating=min_rating,
        material=material,
        color=color,
        limit=limit,
    )

    # Add recommendation reasons for each result
    rec_service = get_recommendation_service()
    for product in results:
        product["recommendation_reasons"] = rec_service.generate_recommendation_reasons(
            product=product,
        )

    return {
        "tool": "search_catalog",
        "status": "success",
        "query": query,
        "result_count": len(results),
        "products": results,
        "filters_applied": {
            "category": category,
            "max_price": max_price,
            "min_price": min_price,
            "min_rating": min_rating,
            "material": material,
            "color": color,
        },
    }


async def find_similar_image(
    db: AsyncSession,
    image_url: Optional[str] = None,
    image_data: Optional[str] = None,
    max_price: Optional[float] = None,
    category: Optional[str] = None,
    limit: int = 5,
) -> dict[str, Any]:
    """
    MCP Tool: find_similar_image
    Visual embedding vector query using SigLIP analysis.
    """
    vision = get_vision_service()
    vector_search = get_vector_search()

    # Analyze the image
    visual_attrs = await vision.analyze_image(
        image_data=image_data,
        image_url=image_url,
    )

    # Use extracted category if not explicitly provided
    search_category = category or visual_attrs.get("category")

    # Search for visually similar products
    matches = await vector_search.visual_search(
        db=db,
        visual_attributes=visual_attrs,
        max_price=max_price,
        category=search_category,
        limit=limit,
    )

    return {
        "tool": "find_similar_image",
        "status": "success",
        "extracted_attributes": visual_attrs,
        "match_count": len(matches),
        "matches": matches,
    }


async def compare_products(
    db: AsyncSession,
    product_ids: list[str],
) -> dict[str, Any]:
    """
    MCP Tool: compare_products
    Generates a structured comparison matrix for the specified products.
    """
    result = await db.execute(
        select(Product)
        .where(Product.id.in_(product_ids))
        .options(selectinload(Product.category))
    )
    products = result.scalars().all()

    if len(products) < 2:
        return {
            "tool": "compare_products",
            "status": "error",
            "message": "Need at least 2 valid product IDs to compare",
        }

    # Build comparison matrix
    product_dicts = []
    for p in products:
        product_dicts.append({
            "id": p.id,
            "title": p.title,
            "brand": p.brand,
            "price": float(p.price),
            "original_price": float(p.original_price) if p.original_price else None,
            "rating_avg": float(p.rating_avg),
            "rating_count": p.rating_count,
            "stock_quantity": p.stock_quantity,
            "attributes": p.attributes or {},
            "images": p.images or [],
            "category_name": p.category.name if p.category else "",
        })

    # Extract all unique attribute keys for comparison
    all_attr_keys = set()
    for p in product_dicts:
        all_attr_keys.update(p["attributes"].keys())

    comparison_matrix = {}
    # Standard comparison fields
    comparison_matrix["price"] = [p["price"] for p in product_dicts]
    comparison_matrix["brand"] = [p["brand"] for p in product_dicts]
    comparison_matrix["rating"] = [
        f"{p['rating_avg']}★ ({p['rating_count']} reviews)" for p in product_dicts
    ]
    comparison_matrix["availability"] = [
        f"In Stock ({p['stock_quantity']})" if p["stock_quantity"] > 0 else "Out of Stock"
        for p in product_dicts
    ]

    # Dynamic attribute comparison
    for key in sorted(all_attr_keys):
        comparison_matrix[key] = [
            p["attributes"].get(key, "—") for p in product_dicts
        ]

    # Generate highlights (key differences)
    highlights = []
    prices = [p["price"] for p in product_dicts]
    if max(prices) - min(prices) > 20:
        cheapest = min(product_dicts, key=lambda x: x["price"])
        highlights.append(f"💰 {cheapest['title']} is the most affordable option")

    ratings = [p["rating_avg"] for p in product_dicts]
    if max(ratings) - min(ratings) > 0.5:
        top_rated = max(product_dicts, key=lambda x: x["rating_avg"])
        highlights.append(f"⭐ {top_rated['title']} has the highest rating")

    return {
        "tool": "compare_products",
        "status": "success",
        "products": product_dicts,
        "comparison_matrix": comparison_matrix,
        "highlights": highlights,
    }


async def get_product_details(
    db: AsyncSession,
    product_id: str,
) -> dict[str, Any]:
    """
    MCP Tool: get_product_details
    Retrieves full product information including reviews summary.
    """
    result = await db.execute(
        select(Product)
        .where(Product.id == product_id)
        .options(selectinload(Product.category), selectinload(Product.reviews))
    )
    product = result.scalar_one_or_none()

    if product is None:
        return {
            "tool": "get_product_details",
            "status": "error",
            "message": f"Product {product_id} not found",
        }

    # Build reviews summary
    reviews = product.reviews or []
    review_summary = {
        "total_reviews": len(reviews),
        "avg_rating": float(product.rating_avg),
        "rating_distribution": {},
    }
    for r in reviews:
        key = f"{r.rating}_star"
        review_summary["rating_distribution"][key] = (
            review_summary["rating_distribution"].get(key, 0) + 1
        )

    return {
        "tool": "get_product_details",
        "status": "success",
        "product": {
            "id": product.id,
            "sku": product.sku,
            "title": product.title,
            "description": product.description,
            "brand": product.brand,
            "price": float(product.price),
            "original_price": float(product.original_price) if product.original_price else None,
            "stock_quantity": product.stock_quantity,
            "attributes": product.attributes or {},
            "images": product.images or [],
            "category_name": product.category.name if product.category else "",
            "rating_avg": float(product.rating_avg),
            "rating_count": product.rating_count,
        },
        "review_summary": review_summary,
    }
