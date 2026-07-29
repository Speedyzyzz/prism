from __future__ import annotations
"""
OmniShop OS — Recommendation MCP Tools

MCP-compliant tool functions for personalized product recommendations
and size fit evaluation.
"""

from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.db_models import Product, UserProfile
from app.services.mock_vector_search import get_vector_search
from app.services.recommendation import get_recommendation_service


async def recommend_products(
    db: AsyncSession,
    user_id: str,
    context_tags: Optional[list[str]] = None,
    limit: int = 5,
) -> dict[str, Any]:
    """
    MCP Tool: recommend_products
    Generates personalized product recommendations based on user profile.
    """
    rec_service = get_recommendation_service()
    vector_search = get_vector_search()

    # Load user profile
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    profile = profile_result.scalar_one_or_none()

    profile_dict = {}
    if profile:
        profile_dict = {
            "preferred_brands": profile.preferred_brands or [],
            "size_preferences": profile.size_preferences or {},
            "preferred_colors": profile.preferred_colors or [],
            "avg_spend_threshold": float(profile.avg_spend_threshold) if profile.avg_spend_threshold else 200.0,
        }

    # Build search query from context tags and profile
    query_parts = context_tags or []
    if profile_dict.get("preferred_brands"):
        query_parts.extend(profile_dict["preferred_brands"][:2])

    search_query = " ".join(query_parts) if query_parts else "popular trending"

    # Get candidate products
    results = await vector_search.text_search(
        db=db,
        query=search_query,
        max_price=profile_dict.get("avg_spend_threshold"),
        limit=limit * 2,  # Fetch extra for re-ranking
    )

    # Re-rank by personalization score
    for product in results:
        product["personalization_score"] = rec_service.score_recommendation(
            product, profile_dict
        )
        product["recommendation_reasons"] = rec_service.generate_recommendation_reasons(
            product, profile_dict
        )

    results.sort(key=lambda x: x["personalization_score"], reverse=True)
    results = results[:limit]

    return {
        "tool": "recommend_products",
        "status": "success",
        "user_id": user_id,
        "result_count": len(results),
        "products": results,
        "profile_used": bool(profile_dict),
    }


async def evaluate_size_fit(
    db: AsyncSession,
    product_id: str,
    user_id: Optional[str] = None,
    user_measurements: Optional[dict] = None,
) -> dict[str, Any]:
    """
    MCP Tool: evaluate_size_fit
    Deterministic sizing heuristic matching product specs to user dimensions.
    """
    product = await db.get(Product, product_id)
    if not product:
        return {
            "tool": "evaluate_size_fit",
            "status": "error",
            "message": f"Product {product_id} not found",
        }

    # Load user size preferences
    user_sizes = user_measurements or {}
    if user_id and not user_measurements:
        profile_result = await db.execute(
            select(UserProfile).where(UserProfile.user_id == user_id)
        )
        profile = profile_result.scalar_one_or_none()
        if profile and profile.size_preferences:
            user_sizes = profile.size_preferences

    # Product attributes
    attrs = product.attributes or {}
    product_category = attrs.get("category", "general").lower()

    # Size recommendation logic
    size_guide = _get_size_guide(product_category)
    recommended_size = user_sizes.get(product_category, user_sizes.get("default", "M"))

    return {
        "tool": "evaluate_size_fit",
        "status": "success",
        "product_id": product_id,
        "product_title": product.title,
        "recommended_size": recommended_size,
        "fit_notes": _get_fit_notes(attrs, recommended_size),
        "size_guide": size_guide,
        "user_size_history": user_sizes,
    }


def _get_size_guide(category: str) -> dict:
    """Returns a mock size guide for the category."""
    guides = {
        "outerwear": {
            "S": {"chest": "34-36in", "length": "26in"},
            "M": {"chest": "38-40in", "length": "27in"},
            "L": {"chest": "42-44in", "length": "28in"},
            "XL": {"chest": "46-48in", "length": "29in"},
        },
        "footwear": {
            "8": {"us": "8", "eu": "41", "cm": "26"},
            "9": {"us": "9", "eu": "42", "cm": "27"},
            "10": {"us": "10", "eu": "43", "cm": "28"},
            "11": {"us": "11", "eu": "44.5", "cm": "29"},
        },
    }
    return guides.get(category, guides["outerwear"])


def _get_fit_notes(attributes: dict, size: str) -> list[str]:
    """Generate fit notes based on product attributes."""
    notes = []
    fit = attributes.get("fit", "regular")

    if fit == "slim":
        notes.append("This item runs slim — consider sizing up if you prefer a relaxed fit")
    elif fit == "oversized":
        notes.append("Oversized fit — your usual size will give a relaxed look")
    else:
        notes.append("True to size — standard fit")

    material = attributes.get("material", "")
    if "leather" in material.lower():
        notes.append("Leather stretches slightly with wear")
    if "cotton" in material.lower():
        notes.append("May shrink slightly after first wash")

    notes.append(f"Based on your history, we recommend size {size}")

    return notes
