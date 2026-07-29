from __future__ import annotations
"""
OmniShop OS — Planner Node

Entry point of the agent graph. Classifies user intent, extracts
structured parameters, and routes to the appropriate execution node.
"""

from app.agents.state import AgentState
from app.services.mock_llm import get_mock_llm


async def planner_node(state: AgentState) -> dict:
    """
    Planner Node — Evaluates user message, classifies intent,
    extracts parameters, and determines routing.
    """
    llm = get_mock_llm()

    # Get the latest user message
    messages = state.get("messages", [])
    latest_message = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            latest_message = msg["content"]
            break

    has_image = bool(state.get("image_payload"))

    # Classify intent
    intent = llm.classify_intent(latest_message, has_image=has_image)

    # Extract search parameters
    search_params = llm.extract_search_params(latest_message)

    # Extract product references (for compare / cart operations)
    product_refs = llm.extract_product_references(latest_message)
    selected_ids = state.get("selected_product_ids", [])

    # Map option numbers to actual product IDs from previous results
    retrieved = state.get("retrieved_products", [])
    if product_refs and retrieved:
        for ref_num in product_refs:
            idx = ref_num - 1  # "option 1" → index 0
            if 0 <= idx < len(retrieved):
                pid = retrieved[idx].get("product_id", retrieved[idx].get("id", ""))
                if pid and pid not in selected_ids:
                    selected_ids.append(pid)

    # Extract coupon code for cart intents
    coupon_code = None
    if intent == "CART":
        coupon_code = llm.extract_coupon_code(latest_message)

    # Build thinking trace
    thinking_steps = [
        f"🧠 Analyzing message: \"{latest_message[:80]}{'...' if len(latest_message) > 80 else ''}\"",
        f"📋 Classified intent: {intent}",
    ]

    if has_image:
        thinking_steps.append("📸 Image payload detected — routing to Vision Agent")

    if search_params:
        params_str = ", ".join(f"{k}={v}" for k, v in search_params.items())
        thinking_steps.append(f"🔍 Extracted parameters: {params_str}")

    if selected_ids:
        thinking_steps.append(f"🎯 Referenced products: {selected_ids}")

    if coupon_code:
        thinking_steps.append(f"🏷️ Coupon code detected: {coupon_code}")
        search_params["coupon_code"] = coupon_code

    return {
        "intent": intent,
        "search_params": search_params,
        "selected_product_ids": selected_ids,
        "thinking_steps": thinking_steps,
        "needs_reflection": True,
    }
