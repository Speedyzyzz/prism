from __future__ import annotations
"""
OmniShop OS — Agent State Definition

Typed state schema for the LangGraph orchestrator.
Matches the spec's Section 8 state machine definition.
"""

from typing import Annotated, Any, Optional, TypedDict
import operator


class AgentState(TypedDict):
    """
    Immutable state schema passed through the LangGraph execution graph.

    Each node reads from and returns partial updates to this state.
    The `messages` field uses operator.add for accumulation.
    """

    # ── Conversation ─────────────────────────────────────────────────
    messages: Annotated[list[dict], operator.add]
    """Chat message history: [{"role": "user"|"assistant"|"system", "content": "..."}]"""

    # ── Session Context ──────────────────────────────────────────────
    user_id: str
    session_id: str

    # ── Intent Classification ────────────────────────────────────────
    intent: str
    """Classified intent: SEARCH, COMPARE, CART, RECOMMEND, VISUAL_SEARCH, GENERAL"""

    # ── Visual Input ─────────────────────────────────────────────────
    image_payload: Optional[str]
    """Base64 image data or URL, None if text-only"""

    # ── Search / Retrieval Results ───────────────────────────────────
    retrieved_products: list[dict]
    """Products returned from search/retrieval tools"""

    search_params: dict
    """Extracted search parameters: {query, category, max_price, material, color, ...}"""

    # ── Product Selection ────────────────────────────────────────────
    selected_product_ids: list[str]
    """Product IDs the user has selected or referenced"""

    # ── Cart State ───────────────────────────────────────────────────
    cart_state: dict
    """Current cart data: {items, subtotal, discount, total, ...}"""

    # ── Tool Execution ───────────────────────────────────────────────
    active_tool_calls: list[dict]
    """Tool call records: [{tool, args, result, status}]"""

    # ── Reflection / Self-Correction ─────────────────────────────────
    needs_reflection: bool
    """Whether the reflection node should evaluate result quality"""

    reflection_attempts: int
    """Number of retry attempts (max 2)"""

    # ── Generative UI Output ─────────────────────────────────────────
    generative_ui_component: Optional[dict]
    """Typed JSON UI spec for frontend rendering:
    {type: "PRODUCT_CAROUSEL"|"COMPARISON_MATRIX"|"STAGED_CHECKOUT"|..., data: {...}}
    """

    # ── Response ─────────────────────────────────────────────────────
    response_text: str
    """Final text response to stream to the user"""

    # ── Thinking Steps ───────────────────────────────────────────────
    thinking_steps: list[str]
    """Agent reasoning trace for the "thinking" indicator"""

    # ── Error State ──────────────────────────────────────────────────
    error: Optional[str]
    """Error message if something went wrong"""


def create_initial_state(
    user_id: str,
    session_id: str,
    message: str,
    image_payload: Optional[str] = None,
) -> AgentState:
    """Create a fresh agent state for a new user message."""
    return AgentState(
        messages=[{"role": "user", "content": message}],
        user_id=user_id,
        session_id=session_id,
        intent="",
        image_payload=image_payload,
        retrieved_products=[],
        search_params={},
        selected_product_ids=[],
        cart_state={},
        active_tool_calls=[],
        needs_reflection=True,
        reflection_attempts=0,
        generative_ui_component=None,
        response_text="",
        thinking_steps=[],
        error=None,
    )
