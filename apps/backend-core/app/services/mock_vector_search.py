from __future__ import annotations
"""
OmniShop OS — Mock Vector Search Service

Simulates Qdrant hybrid search (dense + sparse) with realistic
similarity scoring and payload metadata filtering.
"""

import random
from typing import Optional

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.db_models import Product, Category


class MockVectorSearchService:
    """
    Simulates Qdrant vector search using the relational database
    with randomized similarity scores for demo purposes.
    """

    async def text_search(
        self,
        db: AsyncSession,
        query: str,
        category: Optional[str] = None,
        max_price: Optional[float] = None,
        min_price: Optional[float] = None,
        min_rating: Optional[float] = None,
        material: Optional[str] = None,
        color: Optional[str] = None,
        limit: int = 10,
    ) -> list[dict]:
        """
        Simulate hybrid text vector search.
        In production: Qdrant dense + BM25 sparse + RRF + Cohere rerank.
        Mock: SQL query with randomized similarity scores.
        """
        stmt = select(Product).where(Product.is_active == True)

        # Category filter
        if category:
            cat_result = await db.execute(
                select(Category).where(Category.slug == category)
            )
            cat = cat_result.scalar_one_or_none()
            if cat:
                stmt = stmt.where(Product.category_id == cat.id)

        # Price filters
        if max_price is not None:
            stmt = stmt.where(Product.price <= max_price)
        if min_price is not None:
            stmt = stmt.where(Product.price >= min_price)

        # Rating filter
        if min_rating is not None:
            stmt = stmt.where(Product.rating_avg >= min_rating)

        result = await db.execute(stmt)
        products = result.scalars().all()

        # Score and rank results with semantic keyword similarity
        scored_results = []
        for product in products:
            score = self._compute_mock_similarity(
                query, product, material=material, color=color
            )

            # Sanitize images array
            imgs = product.images or []
            sanitized_imgs = []
            for img in imgs:
                if "cdn.omnishop.os" in img or not img.startswith("http"):
                    if "shoe" in product.title.lower() or "sneaker" in product.title.lower():
                        sanitized_imgs.append("/images/shoes.png")
                    elif "bag" in product.title.lower() or "tote" in product.title.lower():
                        sanitized_imgs.append("/images/bag.png")
                    else:
                        sanitized_imgs.append("/images/jacket.png")
                else:
                    sanitized_imgs.append(img)

            if not sanitized_imgs:
                sanitized_imgs = ["/images/jacket.png"]

            scored_results.append({
                "product_id": product.id,
                "sku": product.sku,
                "title": product.title,
                "description": product.description,
                "brand": product.brand,
                "price": float(product.price),
                "original_price": float(product.original_price) if product.original_price else None,
                "stock_quantity": product.stock_quantity,
                "attributes": product.attributes or {},
                "images": sanitized_imgs,
                "rating_avg": float(product.rating_avg),
                "rating_count": product.rating_count,
                "similarity_score": round(score, 3),
                "in_stock": product.stock_quantity > 0,
            })

        # Filter out completely irrelevant items if relevant matches exist
        relevant = [p for p in scored_results if p["similarity_score"] >= 0.55]
        if relevant:
            scored_results = relevant

        # Sort by similarity score descending
        scored_results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored_results[:limit]

    async def visual_search(
        self,
        db: AsyncSession,
        visual_attributes: dict,
        max_price: Optional[float] = None,
        category: Optional[str] = None,
        limit: int = 5,
    ) -> list[dict]:
        """
        Simulate visual vector search (SigLIP embeddings).
        In production: Qdrant cosine similarity on 1152-dim vectors.
        Mock: SQL query filtered by extracted visual attributes.
        """
        stmt = select(Product).where(Product.is_active == True)

        # Category from vision analysis
        if category:
            cat_result = await db.execute(
                select(Category).where(Category.slug == category)
            )
            cat = cat_result.scalar_one_or_none()
            if cat:
                stmt = stmt.where(Product.category_id == cat.id)

        if max_price is not None:
            stmt = stmt.where(Product.price <= max_price)

        stmt = stmt.limit(limit * 2)  # Fetch extra for filtering
        result = await db.execute(stmt)
        products = result.scalars().all()

        scored_results = []
        for product in products:
            score = self._compute_visual_similarity(visual_attributes, product)

            # Sanitize images array
            imgs = product.images or []
            sanitized_imgs = []
            for img in imgs:
                if "cdn.omnishop.os" in img or not img.startswith("http"):
                    if "shoe" in product.title.lower() or "sneaker" in product.title.lower():
                        sanitized_imgs.append("/images/shoes.png")
                    elif "bag" in product.title.lower() or "tote" in product.title.lower():
                        sanitized_imgs.append("/images/bag.png")
                    else:
                        sanitized_imgs.append("/images/jacket.png")
                else:
                    sanitized_imgs.append(img)

            if not sanitized_imgs:
                sanitized_imgs = ["/images/jacket.png"]

            scored_results.append({
                "product_id": product.id,
                "title": product.title,
                "brand": product.brand,
                "price": float(product.price),
                "images": sanitized_imgs,
                "similarity_score": round(score, 3),
                "attributes": product.attributes or {},
            })

        scored_results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored_results[:limit]

    def _compute_mock_similarity(
        self,
        query: str,
        product,
        material: Optional[str] = None,
        color: Optional[str] = None,
    ) -> float:
        """
        Compute similarity score based on query relevance, synonym expansion, and attribute overlap.
        Relevant matches: [0.75, 0.98]
        Irrelevant items: [0.10, 0.35]
        """
        from app.services.synonym_expander import expand_query_terms

        query_lower = query.lower()
        title_lower = product.title.lower()
        desc_lower = product.description.lower()
        
        # Expand synonyms (e.g. 'purse' -> ['purse', 'bag', 'handbag', 'tote', 'crossbody'])
        expanded_words = expand_query_terms(query_lower)

        title_matches = sum(1 for w in expanded_words if w in title_lower)
        desc_matches = sum(1 for w in expanded_words if w in desc_lower)

        attrs = product.attributes or {}
        attr_str = " ".join(str(v).lower() for v in attrs.values())
        attr_matches = sum(1 for w in expanded_words if w in attr_str)

        brand_match = product.brand and any(b in product.brand.lower() for b in expanded_words)

        total_matches = title_matches + desc_matches + attr_matches + (2 if brand_match else 0)

        if total_matches == 0 and not material and not color:
            # Low score for completely unrelated products
            return random.uniform(0.10, 0.35)

        base_score = 0.72 + (title_matches * 0.08) + (desc_matches * 0.03) + (attr_matches * 0.04)

        if material and attrs.get("material", "").lower() == material.lower():
            base_score += 0.08
        if color and attrs.get("color", "").lower() == color.lower():
            base_score += 0.08
        if brand_match:
            base_score += 0.08

        return min(base_score, 0.98)

    def _compute_visual_similarity(self, visual_attrs: dict, product) -> float:
        """
        Compute mock visual similarity based on attribute overlap.
        Range: [0.70, 0.97]
        """
        base_score = random.uniform(0.70, 0.88)
        prod_attrs = product.attributes or {}

        # Color match
        if visual_attrs.get("color") and prod_attrs.get("color"):
            if visual_attrs["color"].lower() == prod_attrs["color"].lower():
                base_score += 0.06

        # Material match
        if visual_attrs.get("material") and prod_attrs.get("material"):
            if visual_attrs["material"].lower() == prod_attrs["material"].lower():
                base_score += 0.05

        # Style match
        if visual_attrs.get("style") and prod_attrs.get("style"):
            if visual_attrs["style"].lower() == prod_attrs["style"].lower():
                base_score += 0.04

        return min(base_score, 0.97)


# ── Singleton ────────────────────────────────────────────────────────────
_vector_search: MockVectorSearchService | None = None


def get_vector_search() -> MockVectorSearchService:
    global _vector_search
    if _vector_search is None:
        _vector_search = MockVectorSearchService()
    return _vector_search
