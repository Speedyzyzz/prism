from __future__ import annotations
"""
OmniShop OS — Retriever Node

Executes hybrid text-based product search through the catalog MCP tools
and generates personalized recommendation reasons.
"""

from app.agents.state import AgentState
from app.services.mock_llm import get_mock_llm
from app.services.recommendation import get_recommendation_service


async def retriever_node(state: AgentState, db) -> dict:
    """
    Retriever Node — Performs hybrid semantic search, applies
    personalization re-ranking, and generates XAI reasoning badges.
    """
    from app.mcp_servers.catalog_tools import search_catalog
    from app.mcp_servers.recommendation_tools import recommend_products

    llm = get_mock_llm()
    rec_service = get_recommendation_service()

    intent = state.get("intent", "SEARCH")
    search_params = state.get("search_params", {})
    user_id = state.get("user_id", "")

    thinking_steps = list(state.get("thinking_steps", []))

    # Get the latest user message for the search query
    messages = state.get("messages", [])
    query = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            query = msg["content"]
            break

    if intent == "RECOMMEND":
        # Use recommendation pipeline
        thinking_steps.append("💡 Generating personalized recommendations...")
        thinking_steps.append("📊 Loading user preference profile...")

        result = await recommend_products(
            db=db,
            user_id=user_id,
            context_tags=search_params.get("tags", []),
            limit=5,
        )
        products = result.get("products", [])
        thinking_steps.append(
            f"✅ Generated {len(products)} personalized recommendations"
        )
        response_text = f"Based on your preferences, here are {len(products)} personalized recommendations:"

    else:
        # Standard search
        search_desc_parts = []
        if search_params.get("category"):
            search_desc_parts.append(f"category: {search_params['category']}")
        if search_params.get("max_price"):
            search_desc_parts.append(f"price ≤ ${search_params['max_price']}")
        if search_params.get("material"):
            search_desc_parts.append(f"material: {search_params['material']}")
        if search_params.get("color"):
            search_desc_parts.append(f"color: {search_params['color']}")

        filter_desc = ", ".join(search_desc_parts) if search_desc_parts else "no filters"
        thinking_steps.append(f"🔍 Searching catalog: \"{query[:60]}\" ({filter_desc})")
        thinking_steps.append("⚡ Executing hybrid search (dense vectors + BM25)...")

        result = await search_catalog(
            db=db,
            query=query,
            category=search_params.get("category"),
            max_price=search_params.get("max_price"),
            min_price=search_params.get("min_price"),
            min_rating=search_params.get("min_rating"),
            material=search_params.get("material"),
            color=search_params.get("color"),
            limit=10,
        )
        products = result.get("products", [])

        thinking_steps.append(
            f"📊 Reciprocal Rank Fusion: merged {len(products)} results"
        )
        thinking_steps.append("🏆 Re-ranking with Cohere Rerank v3...")

        response_text = await llm.generate_search_response(query, len(products))

    # Build Generative UI
    generative_ui = None
    if products:
        # Generate recommendation reasons for display
        reasoning_badges = []
        for p in products:
            reasons = p.get("recommendation_reasons", [])
            if reasons:
                reasoning_badges.append({
                    "product_id": p.get("product_id", p.get("id", "")),
                    "reasons": reasons,
                })

        generative_ui = {
            "type": "PRODUCT_CAROUSEL",
            "data": {
                "products": products,
                "search_type": "recommendation" if intent == "RECOMMEND" else "search",
                "reasoning_badges": reasoning_badges,
            },
        }

        thinking_steps.append(f"✅ Returning {len(products)} products with reasoning badges")

    return {
        "retrieved_products": products,
        "generative_ui_component": generative_ui,
        "response_text": response_text,
        "thinking_steps": thinking_steps,
        "active_tool_calls": [
            {
                "tool": "search_catalog" if intent != "RECOMMEND" else "recommend_products",
                "status": "success",
                "result_count": len(products),
            }
        ],
    }
