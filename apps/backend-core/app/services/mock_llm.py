from __future__ import annotations

"""
Prism OS — Mock LLM Service

Simulates Gemini 2.5 Flash / GPT-4o responses for hackathon development.
Provides intent classification, response generation, and streaming simulation.
"""

import asyncio
import json
import random
import re
from typing import AsyncGenerator

from app.core.config import get_settings

settings = get_settings()


# ── Intent Keywords ──────────────────────────────────────────────────────
INTENT_PATTERNS = {
    "VISUAL_SEARCH": [
        r"(?:find|search|look for|get)\s+(?:this|something|items?)\s+(?:like|similar|matching)",
        r"(?:photo|image|picture|screenshot|upload)",
        r"find\s+(?:me\s+)?this",
    ],
    "COMPARE": [
        r"compare",
        r"(?:side.by.side|vs|versus|difference|differences)",
        r"which\s+(?:one|is better)",
        r"option\s+\d+\s+(?:and|vs|or)\s+option\s+\d+",
    ],
    "CART": [
        r"(?:add|put|place)\s+(?:to|in|into)\s+(?:my\s+)?cart",
        r"(?:remove|delete)\s+from\s+(?:my\s+)?cart",
        r"checkout|check\s*out",
        r"(?:apply|use)\s+(?:coupon|discount|promo|code|loyalty)",
        r"(?:buy|purchase|order)\s+(?:this|it|option)",
    ],
    "RECOMMEND": [
        r"(?:recommend|suggest|what\s+(?:should|would|do\s+you))",
        r"(?:best|top|popular|trending)",
        r"(?:for me|personalized|my style|my taste)",
    ],
    "SEARCH": [
        r"(?:find|search|show|looking for|need|want)\s+",
        r"(?:jacket|shoe|bag|dress|shirt|pants|sneaker|boot|coat)",
        r"under\s+\$?\d+",
        r"(?:black|white|red|blue|leather|vegan|cotton)",
    ],
}


class MockLLMService:
    """Simulates LLM capabilities without requiring API keys."""

    def classify_intent(self, message: str, has_image: bool = False) -> str:
        """
        Classify user intent from message text using keyword heuristics.
        Returns: VISUAL_SEARCH, COMPARE, CART, RECOMMEND, SEARCH, or GENERAL
        """
        message_lower = message.lower().strip()

        # Image payload always implies visual search
        if has_image:
            return "VISUAL_SEARCH"

        # Check patterns in priority order
        for intent, patterns in INTENT_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, message_lower):
                    return intent

        return "GENERAL"

    def extract_search_params(self, message: str) -> dict:
        """Extract structured search parameters from natural language."""
        params = {}

        # Price extraction
        price_match = re.search(r"under\s+\$?(\d+(?:\.\d{2})?)", message.lower())
        if price_match:
            params["max_price"] = float(price_match.group(1))

        price_range = re.search(
            r"\$?(\d+)\s*[-–to]+\s*\$?(\d+)", message.lower()
        )
        if price_range:
            params["min_price"] = float(price_range.group(1))
            params["max_price"] = float(price_range.group(2))

        # Category extraction
        category_keywords = {
            "outerwear": ["jacket", "coat", "blazer", "parka", "windbreaker"],
            "footwear": ["shoe", "sneaker", "boot", "sandal", "loafer"],
            "accessories": ["bag", "watch", "belt", "sunglasses", "hat", "scarf"],
            "activewear": ["hoodie", "jogger", "legging", "sports", "gym", "running"],
            "bags": ["backpack", "tote", "duffel", "messenger", "clutch"],
        }
        for category, keywords in category_keywords.items():
            if any(kw in message.lower() for kw in keywords):
                params["category"] = category
                break

        # Material / attribute extraction
        materials = ["leather", "vegan leather", "canvas", "denim", "suede", "nylon", "cotton", "wool"]
        for mat in materials:
            if mat in message.lower():
                params["material"] = mat
                break

        # Color extraction
        colors = ["black", "white", "brown", "navy", "grey", "gray", "red", "blue", "green", "tan", "beige"]
        for color in colors:
            if color in message.lower():
                params["color"] = color
                break

        return params

    def extract_product_references(self, message: str) -> list[int]:
        """Extract 'option N' references from the message."""
        matches = re.findall(r"option\s+(\d+)", message.lower())
        return [int(m) for m in matches]

    def extract_coupon_code(self, message: str) -> str | None:
        """Extract coupon/discount code from message."""
        # Look for explicit codes
        code_match = re.search(
            r"(?:code|coupon|promo|discount)\s+['\"]?([A-Z0-9]+)['\"]?",
            message,
            re.IGNORECASE,
        )
        if code_match:
            return code_match.group(1).upper()

        # Look for loyalty-related keywords
        if any(kw in message.lower() for kw in ["loyalty", "member", "vip"]):
            return "LOYALTY20"

        return None

    async def generate_search_response(
        self,
        query: str,
        product_count: int,
    ) -> str:
        """Generate a natural language response for search results."""
        responses = [
            f"I found {product_count} items matching your search. Here are the best matches:",
            f"Great news! I discovered {product_count} products that fit what you're looking for:",
            f"Based on your request, here are {product_count} curated results:",
            f"I've searched our catalog and found {product_count} excellent options for you:",
        ]
        return random.choice(responses)

    async def generate_comparison_response(self, product_count: int) -> str:
        """Generate intro text for comparison results."""
        return f"Here's a detailed side-by-side comparison of the {product_count} products you selected:"

    async def generate_cart_response(self, action: str, product_title: str = "") -> str:
        """Generate response text for cart actions."""
        responses = {
            "ADD": f"✅ Added **{product_title}** to your cart. Would you like to continue shopping or proceed to checkout?",
            "REMOVE": f"Removed **{product_title}** from your cart.",
            "CLEAR": "Your cart has been cleared.",
            "APPLY_COUPON": f"🎉 Coupon applied successfully! Your discount has been updated.",
            "CHECKOUT": "Your checkout has been staged. Review the details below and confirm when ready:",
        }
        return responses.get(action, "Cart updated successfully.")

    async def generate_visual_search_response(
        self,
        extracted_attrs: dict,
        match_count: int,
    ) -> str:
        """Generate response for visual search results."""
        attr_desc = ", ".join(
            f"{k}: {v}" for k, v in extracted_attrs.items() if v
        )
        return (
            f"I analyzed your image and detected: **{attr_desc}**. "
            f"I found {match_count} visually similar products in our catalog:"
        )

    async def generate_general_response(self, message: str) -> str:
        """Generate a general conversational response."""
        greetings = ["hi", "hello", "hey", "good morning", "good evening"]
        if any(g in message.lower() for g in greetings):
            return (
                "👋 Welcome to Prism OS! I'm your AI shopping assistant. "
                "You can:\n"
                "• **Search** for products by describing what you want\n"
                "• **Upload an image** to find visually similar items\n"
                "• **Compare** products side-by-side\n"
                "• **Add to cart** and checkout — all through our conversation\n\n"
                "What are you looking for today?"
            )

        help_words = ["help", "what can you do", "features", "how"]
        if any(h in message.lower() for h in help_words):
            return (
                "I'm an AI-powered shopping assistant! Here's what I can do:\n\n"
                "🔍 **Smart Search** — Describe what you need in natural language\n"
                "📸 **Visual Search** — Upload a photo to find matching products\n"
                "⚖️ **Product Compare** — Say 'compare option 1 and 2'\n"
                "🛒 **Cart Management** — 'Add option 1 to cart'\n"
                "💳 **Checkout** — 'Checkout' or 'Apply my loyalty discount'\n"
                "💡 **Recommendations** — 'What would you recommend for me?'\n\n"
                "Try it out!"
            )

        return (
            "I can help you find the perfect products! Try telling me what you're "
            "looking for, or upload an image of something you'd like to find. "
            "For example: *'Find me a black leather jacket under $200'*"
        )

    async def stream_text(self, text: str) -> AsyncGenerator[str, None]:
        """Simulate token-by-token streaming with realistic delays."""
        words = text.split(" ")
        for i, word in enumerate(words):
            separator = " " if i > 0 else ""
            yield separator + word
            await asyncio.sleep(settings.STREAM_DELAY_MS / 1000.0)


# ── Singleton ────────────────────────────────────────────────────────────
_mock_llm: MockLLMService | None = None


def get_mock_llm() -> MockLLMService:
    global _mock_llm
    if _mock_llm is None:
        _mock_llm = MockLLMService()
    return _mock_llm
