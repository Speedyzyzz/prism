from __future__ import annotations
"""
OmniShop OS — Vision Node

Processes image payloads through the vision service and performs
visual product search via the catalog MCP tools.
"""

from app.agents.state import AgentState
from app.services.vision_service import get_vision_service
from app.services.mock_llm import get_mock_llm


async def vision_node(state: AgentState, db) -> dict:
    """
    Vision Node — Analyzes uploaded images, extracts visual attributes,
    and performs visual similarity search.
    """
    from app.mcp_servers.catalog_tools import find_similar_image

    vision = get_vision_service()
    llm = get_mock_llm()

    image_payload = state.get("image_payload")
    search_params = state.get("search_params", {})

    thinking_steps = list(state.get("thinking_steps", []))
    thinking_steps.append("📸 Analyzing image with SigLIP vision model...")

    # Analyze the image
    visual_attrs = await vision.analyze_image(
        image_data=image_payload,
        image_url=image_payload if image_payload and image_payload.startswith("http") else None,
    )

    thinking_steps.append(
        f"🎨 Detected attributes: {visual_attrs.get('garment_type', 'item')} | "
        f"color: {visual_attrs.get('color', 'N/A')} | "
        f"material: {visual_attrs.get('material', 'N/A')} | "
        f"style: {visual_attrs.get('style', 'N/A')} "
        f"(confidence: {visual_attrs.get('confidence', 0):.0%})"
    )

    thinking_steps.append("🔍 Searching Qdrant vector space for visual matches...")

    # Perform visual search
    search_result = await find_similar_image(
        db=db,
        image_url=image_payload,
        image_data=image_payload,
        max_price=search_params.get("max_price"),
        category=search_params.get("category") or visual_attrs.get("category"),
        limit=5,
    )

    matches = search_result.get("matches", [])

    if search_params.get("max_price"):
        thinking_steps.append(
            f"💰 Filtering results: price ≤ ${search_params['max_price']}"
        )

    thinking_steps.append(f"✅ Found {len(matches)} visually similar products")

    # Generate response text
    response_text = await llm.generate_visual_search_response(
        extracted_attrs=visual_attrs,
        match_count=len(matches),
    )

    # Build Generative UI component
    generative_ui = None
    if matches:
        generative_ui = {
            "type": "PRODUCT_CAROUSEL",
            "data": {
                "products": matches,
                "search_type": "visual",
                "extracted_attributes": visual_attrs,
            },
        }

    return {
        "retrieved_products": matches,
        "generative_ui_component": generative_ui,
        "response_text": response_text,
        "thinking_steps": thinking_steps,
        "active_tool_calls": [
            {
                "tool": "find_similar_image",
                "status": "success",
                "result_count": len(matches),
            }
        ],
    }
