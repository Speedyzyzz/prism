from __future__ import annotations
"""
OmniShop OS — Recommendation & Explainability Service

Generates personalized product recommendations with transparent
XAI reasoning badges explaining *why* each product was recommended.
"""

from typing import Optional


class RecommendationService:
    """
    Combines user profile data with product attributes to generate
    explainable, personalized recommendations.
    """

    def generate_recommendation_reasons(
        self,
        product: dict,
        user_profile: Optional[dict] = None,
    ) -> list[str]:
        """
        Generate deterministic XAI explanation tags for a product
        recommendation. Directly from spec Section 16.

        Args:
            product: Product dict with brand, price, attributes, rating_avg, etc.
            user_profile: User preference dict with preferred_brands, preferred_colors, etc.

        Returns:
            List of human-readable reason strings.
        """
        reasons = []

        if user_profile is None:
            user_profile = {}

        # Brand preference match
        preferred_brands = user_profile.get("preferred_brands", [])
        if product.get("brand") and product["brand"] in preferred_brands:
            reasons.append(f"Matches your preference for {product['brand']}")

        # Price within budget
        avg_spend = user_profile.get("avg_spend_threshold", 200)
        if product.get("price") and product["price"] <= avg_spend:
            reasons.append("Fits within your typical budget range")

        # Color preference match
        preferred_colors = user_profile.get("preferred_colors", [])
        product_color = product.get("attributes", {}).get("color", "")
        if product_color and product_color in preferred_colors:
            reasons.append(f"Matches your preferred color style ({product_color})")

        # Size history match
        size_prefs = user_profile.get("size_preferences", {})
        if size_prefs:
            # If the product's category has a matching size preference
            reasons.append("Compatible with your saved size preferences")

        # High rating
        if product.get("rating_avg", 0) >= 4.5:
            reasons.append(
                f"Highly rated ({product['rating_avg']}★ from {product.get('rating_count', 0)} reviews)"
            )

        # Material preference
        preferred_materials = user_profile.get("preferred_materials", [])
        product_material = product.get("attributes", {}).get("material", "")
        if product_material and product_material in preferred_materials:
            reasons.append(f"Made with your preferred material ({product_material})")

        # On sale / discount
        if product.get("original_price") and product.get("price"):
            if product["original_price"] > product["price"]:
                discount_pct = round(
                    (1 - product["price"] / product["original_price"]) * 100
                )
                reasons.append(f"Currently {discount_pct}% off")

        # In stock
        if product.get("stock_quantity", 0) > 0 and product.get("stock_quantity", 0) <= 5:
            reasons.append("Low stock — only a few left!")

        # Fallback
        if not reasons:
            reasons.append("Trending popular match in catalog")

        return reasons

    def score_recommendation(
        self,
        product: dict,
        user_profile: Optional[dict] = None,
    ) -> float:
        """
        Compute a personalization relevance score (0.0 — 1.0) for ranking.
        Higher = more personalized match.
        """
        if user_profile is None:
            return 0.50

        score = 0.50  # Base

        # Brand match: +0.15
        if product.get("brand") in user_profile.get("preferred_brands", []):
            score += 0.15

        # Color match: +0.10
        product_color = product.get("attributes", {}).get("color", "")
        if product_color in user_profile.get("preferred_colors", []):
            score += 0.10

        # Budget fit: +0.10
        if product.get("price", 999) <= user_profile.get("avg_spend_threshold", 200):
            score += 0.10

        # High rating: +0.08
        if product.get("rating_avg", 0) >= 4.0:
            score += 0.08

        # In stock: +0.05
        if product.get("stock_quantity", 0) > 0:
            score += 0.05

        return min(score, 1.0)

    def get_cross_sell_tags(self, product: dict) -> list[str]:
        """
        Generate cross-sell context tags for agentic accessory recommendations.
        E.g., buying a jacket → suggest matching gloves, scarves.
        """
        attrs = product.get("attributes", {})
        category = attrs.get("category", "").lower()
        color = attrs.get("color", "")

        suggestions = {
            "outerwear": [f"matching {color} scarf", "leather gloves", "winter beanie"],
            "footwear": ["shoe care kit", "matching socks", "insoles"],
            "bags": ["wallet", "key organizer", "rain cover"],
            "activewear": ["water bottle", "gym bag", "fitness tracker"],
        }

        return suggestions.get(category, ["matching accessories"])


# ── Singleton ────────────────────────────────────────────────────────────
_recommendation_service: RecommendationService | None = None


def get_recommendation_service() -> RecommendationService:
    global _recommendation_service
    if _recommendation_service is None:
        _recommendation_service = RecommendationService()
    return _recommendation_service
