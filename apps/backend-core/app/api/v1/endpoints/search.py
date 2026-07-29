from __future__ import annotations
"""
Prism OS — Search Endpoints

Visual product search (PS 10) and standard product search.
"""

from typing import Optional

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.mcp_servers.catalog_tools import search_catalog, find_similar_image
from app.models.schemas import VisualSearchResponse, VisualSearchMatch

router = APIRouter(prefix="/search", tags=["Search"])


@router.post("/visual", response_model=VisualSearchResponse)
async def visual_search(
    file: UploadFile = File(...),
    max_price: Optional[float] = Form(None),
    category: Optional[str] = Form(None),
    limit: int = Form(5),
    db: AsyncSession = Depends(get_db),
):
    """
    Visual Product Search (PS 10).

    Upload an image to find visually similar products in the catalog.
    Uses SigLIP visual embeddings for similarity matching.
    """
    # Read image data
    image_data = await file.read()
    import base64
    image_b64 = base64.b64encode(image_data).decode("utf-8")

    result = await find_similar_image(
        db=db,
        image_data=image_b64,
        max_price=max_price,
        category=category,
        limit=limit,
    )

    matches = [
        VisualSearchMatch(
            product_id=m["product_id"],
            similarity_score=m["similarity_score"],
            title=m["title"],
            price=m["price"],
            image_url=m.get("image_url", ""),
            brand=m.get("brand", ""),
        )
        for m in result.get("matches", [])
    ]

    return VisualSearchResponse(
        matches=matches,
        extracted_attributes=result.get("extracted_attributes", {}),
    )


@router.get("/products")
async def search_products(
    q: str = Query(..., description="Search query"),
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    sort: Optional[str] = Query(None, description="Sort by: price_asc, price_desc, rating, relevance"),
    limit: int = Query(10, le=50),
    db: AsyncSession = Depends(get_db),
):
    """
    Standard product search with filters.

    Uses hybrid semantic + structured search.
    """
    result = await search_catalog(
        db=db,
        query=q,
        category=category,
        max_price=max_price,
        min_price=min_price,
        min_rating=min_rating,
        limit=limit,
    )

    products = result.get("products", [])

    # Apply sorting
    if sort == "price_asc":
        products.sort(key=lambda x: x["price"])
    elif sort == "price_desc":
        products.sort(key=lambda x: x["price"], reverse=True)
    elif sort == "rating":
        products.sort(key=lambda x: x.get("rating_avg", 0), reverse=True)

    return {
        "status": "success",
        "query": q,
        "result_count": len(products),
        "products": products,
        "filters": result.get("filters_applied", {}),
    }
