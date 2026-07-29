from __future__ import annotations
"""
Prism OS — Vision Service

Simulates SigLIP visual analysis for image-based product search.
Extracts mock visual attributes (color, material, style, category)
from uploaded images.
"""

import random
from typing import Optional


class VisionService:
    """
    Simulates SigLIP SO400M visual embedding and attribute extraction.
    In production: processes actual image bytes through the SigLIP encoder.
    """

    # Predefined attribute pools for mock generation
    COLORS = ["black", "brown", "navy", "white", "grey", "tan", "olive", "burgundy", "beige"]
    MATERIALS = ["leather", "vegan leather", "canvas", "denim", "suede", "nylon", "wool", "cotton"]
    STYLES = ["minimalist", "streetwear", "classic", "modern", "vintage", "sporty", "casual", "luxury"]
    CATEGORIES = ["outerwear", "footwear", "accessories", "activewear", "bags"]

    GARMENT_DETAILS = {
        "outerwear": {
            "features": ["zippered", "buttoned", "hooded", "belted", "cropped"],
            "types": ["jacket", "coat", "blazer", "parka", "bomber"],
        },
        "footwear": {
            "features": ["lace-up", "slip-on", "high-top", "low-profile", "cushioned"],
            "types": ["sneaker", "boot", "loafer", "sandal", "derby"],
        },
        "bags": {
            "features": ["compartmented", "water-resistant", "padded", "adjustable-strap"],
            "types": ["backpack", "tote", "messenger", "duffel", "crossbody"],
        },
        "accessories": {
            "features": ["adjustable", "lightweight", "UV-protective", "premium"],
            "types": ["watch", "belt", "sunglasses", "scarf", "hat"],
        },
        "activewear": {
            "features": ["moisture-wicking", "breathable", "stretch", "reflective"],
            "types": ["hoodie", "jogger", "legging", "tank", "shorts"],
        },
    }

    async def analyze_image(
        self,
        image_data: Optional[str] = None,
        image_url: Optional[str] = None,
    ) -> dict:
        """
        Analyze an uploaded image and extract visual attributes.

        In production: Runs the image through SigLIP + a vision LLM
        to extract structured attributes.

        Returns:
            dict with keys: color, material, style, category, features,
            garment_type, confidence
        """
        # Simulate processing delay would happen in production
        category = random.choice(self.CATEGORIES)
        details = self.GARMENT_DETAILS.get(category, self.GARMENT_DETAILS["outerwear"])

        return {
            "color": random.choice(self.COLORS),
            "material": random.choice(self.MATERIALS),
            "style": random.choice(self.STYLES),
            "category": category,
            "garment_type": random.choice(details["types"]),
            "features": random.sample(details["features"], k=min(2, len(details["features"]))),
            "confidence": round(random.uniform(0.82, 0.96), 2),
        }

    async def generate_embedding(
        self,
        image_data: Optional[str] = None,
    ) -> list[float]:
        """
        Generate a mock 1152-dimensional visual embedding vector.
        In production: SigLIP-so400m-patch14-384 encoder output.
        """
        return [random.gauss(0, 1) for _ in range(1152)]

    async def extract_text_from_image(
        self,
        image_data: Optional[str] = None,
    ) -> str:
        """
        Extract any visible text from the image (OCR simulation).
        In production: Gemini Vision or dedicated OCR.
        """
        # Mock: return empty — most fashion images have no text
        return ""


# ── Singleton ────────────────────────────────────────────────────────────
_vision_service: VisionService | None = None


def get_vision_service() -> VisionService:
    global _vision_service
    if _vision_service is None:
        _vision_service = VisionService()
    return _vision_service
