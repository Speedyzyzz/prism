from __future__ import annotations
"""
OmniShop OS — Reflection Node

Self-correcting RAG pipeline node that evaluates result quality
and triggers query rewriting if results are insufficient.
"""

from app.agents.state import AgentState
from app.core.config import get_settings

settings = get_settings()


async def reflect_node(state: AgentState) -> dict:
    """
    Reflection Node — Evaluates whether retrieved results are satisfactory.
    If not, increments reflection_attempts and signals for query rewrite.
    """
    intent = state.get("intent", "GENERAL")
    retrieved = state.get("retrieved_products", [])
    reflection_attempts = state.get("reflection_attempts", 0)
    thinking_steps = list(state.get("thinking_steps", []))

    # General / cart intents don't need retrieval reflection
    if intent in ("GENERAL", "CART"):
        return {
            "needs_reflection": False,
            "thinking_steps": thinking_steps,
        }

    # Evaluate result quality
    is_satisfactory = True
    reasons = []

    # Check: did we get any results?
    if not retrieved:
        is_satisfactory = False
        reasons.append("No products found")

    # Check: minimum result count for search intents
    elif intent in ("SEARCH", "RECOMMEND") and len(retrieved) < 2:
        is_satisfactory = False
        reasons.append(f"Only {len(retrieved)} result(s) — below minimum threshold")

    # Check: similarity scores (if available)
    elif retrieved:
        avg_score = sum(
            p.get("similarity_score", 0.5) for p in retrieved
        ) / len(retrieved)
        if avg_score < 0.65:
            is_satisfactory = False
            reasons.append(f"Average similarity score too low ({avg_score:.2f})")

    if is_satisfactory:
        thinking_steps.append("✅ Results pass quality check")
        return {
            "needs_reflection": False,
            "thinking_steps": thinking_steps,
        }

    # Results are not satisfactory
    if reflection_attempts >= settings.MAX_REFLECTION_ATTEMPTS:
        # Max retries reached — proceed with what we have
        thinking_steps.append(
            f"⚠️ Results below quality threshold ({', '.join(reasons)}) "
            f"but max retries ({settings.MAX_REFLECTION_ATTEMPTS}) reached. "
            "Proceeding with available results."
        )
        return {
            "needs_reflection": False,
            "thinking_steps": thinking_steps,
        }

    # Trigger retry
    thinking_steps.append(
        f"🔄 Reflection: Results unsatisfactory ({', '.join(reasons)}). "
        f"Attempt {reflection_attempts + 1}/{settings.MAX_REFLECTION_ATTEMPTS} — rewriting query..."
    )

    # Broaden search params for retry
    search_params = dict(state.get("search_params", {}))
    if "max_price" in search_params:
        search_params["max_price"] = search_params["max_price"] * 1.3  # Expand budget
    if "material" in search_params:
        del search_params["material"]  # Remove material constraint
    if "color" in search_params:
        del search_params["color"]  # Remove color constraint

    return {
        "needs_reflection": True,
        "reflection_attempts": reflection_attempts + 1,
        "search_params": search_params,
        "thinking_steps": thinking_steps,
    }
