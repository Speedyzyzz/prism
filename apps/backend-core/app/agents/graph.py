from __future__ import annotations

"""
OmniShop OS — LangGraph Agent Graph

Compiles the state machine graph that orchestrates the agent pipeline.
Topology matches spec Section 8:
  START → Planner → [Vision | Retriever | Executor] → Reflection → Response
"""

from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.state import AgentState, create_initial_state
from app.agents.nodes.planner import planner_node
from app.agents.nodes.vision import vision_node
from app.agents.nodes.retriever import retriever_node
from app.agents.nodes.executor import executor_node
from app.agents.nodes.reflect import reflect_node
from app.services.mock_llm import get_mock_llm


def route_by_intent(state: AgentState) -> str:
    """Conditional edge: routes from planner to the appropriate handler node."""
    intent = state.get("intent", "GENERAL")

    if intent == "VISUAL_SEARCH":
        return "vision"
    elif intent in ("SEARCH", "RECOMMEND"):
        return "retriever"
    elif intent in ("CART", "COMPARE"):
        return "executor"
    else:
        return "general"


def route_after_reflection(state: AgentState) -> str:
    """Conditional edge: decides whether to retry or finalize response."""
    needs_reflection = state.get("needs_reflection", False)
    reflection_attempts = state.get("reflection_attempts", 0)

    if needs_reflection and reflection_attempts > 0 and reflection_attempts <= 2:
        return "retry"
    return "finalize"


async def general_node(state: AgentState) -> dict:
    """Handles general/greeting/help messages without tool calls."""
    llm = get_mock_llm()

    messages = state.get("messages", [])
    latest_message = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            latest_message = msg["content"]
            break

    response_text = await llm.generate_general_response(latest_message)

    thinking_steps = list(state.get("thinking_steps", []))
    thinking_steps.append("💬 General conversation — no tool calls needed")

    return {
        "response_text": response_text,
        "thinking_steps": thinking_steps,
        "needs_reflection": False,
    }


async def finalize_node(state: AgentState) -> dict:
    """
    Finalize the response — add the assistant message to history.
    """
    response_text = state.get("response_text", "")

    return {
        "messages": [{"role": "assistant", "content": response_text}],
    }


class AgentOrchestrator:
    """
    Simplified graph executor that runs the agent pipeline.

    Note: We implement this as a manual pipeline rather than using
    the full LangGraph library to avoid heavyweight dependencies.
    The architecture follows the same topology and can be upgraded
    to the full LangGraph StateGraph when needed.
    """

    def __init__(self):
        self.llm = get_mock_llm()

    async def invoke(
        self,
        user_id: str,
        session_id: str,
        message: str,
        image_payload: str | None = None,
        db: AsyncSession | None = None,
        previous_products: list[dict] | None = None,
    ) -> AgentState:
        """
        Execute the full agent pipeline for a user message.
        Returns the final AgentState with response and UI components.
        """
        # Initialize state
        state = create_initial_state(
            user_id=user_id,
            session_id=session_id,
            message=message,
            image_payload=image_payload,
        )

        # Carry over previous products for "option N" references
        if previous_products:
            state["retrieved_products"] = previous_products

        # ── Step 1: Planner ──────────────────────────────────────────
        planner_result = await planner_node(state)
        state = {**state, **planner_result}

        # ── Step 2: Route to handler ─────────────────────────────────
        route = route_by_intent(state)

        if route == "vision" and db:
            handler_result = await vision_node(state, db)
        elif route == "retriever" and db:
            handler_result = await retriever_node(state, db)
        elif route == "executor" and db:
            handler_result = await executor_node(state, db)
        else:
            handler_result = await general_node(state)

        state = {**state, **handler_result}

        # ── Step 3: Reflection ───────────────────────────────────────
        reflect_result = await reflect_node(state)
        state = {**state, **reflect_result}

        # Retry loop if reflection triggers rewrite
        retry_route = route_after_reflection(state)
        while retry_route == "retry" and db:
            # Re-run retriever with broadened params
            if route in ("vision",):
                handler_result = await vision_node(state, db)
            elif route in ("retriever",):
                handler_result = await retriever_node(state, db)
            else:
                break

            state = {**state, **handler_result}

            reflect_result = await reflect_node(state)
            state = {**state, **reflect_result}
            retry_route = route_after_reflection(state)

        # ── Step 4: Finalize ─────────────────────────────────────────
        finalize_result = await finalize_node(state)
        state = {**state, **finalize_result}

        return state

    async def stream(
        self,
        user_id: str,
        session_id: str,
        message: str,
        image_payload: str | None = None,
        db: AsyncSession | None = None,
        previous_products: list[dict] | None = None,
    ):
        """
        Generator that yields SSE-formatted events during agent execution.
        Emits: thinking steps, text chunks, generative UI components, and done signal.
        """
        import json

        # Run the full pipeline
        state = await self.invoke(
            user_id=user_id,
            session_id=session_id,
            message=message,
            image_payload=image_payload,
            db=db,
            previous_products=previous_products,
        )

        # Emit thinking steps
        for step in state.get("thinking_steps", []):
            yield f"event: thinking\ndata: {json.dumps({'step': step})}\n\n"

        # Emit text response (streamed word-by-word)
        response_text = state.get("response_text", "")
        if response_text:
            async for token in self.llm.stream_text(response_text):
                yield f"event: text\ndata: {json.dumps({'token': token})}\n\n"

        # Emit Generative UI component
        ui_component = state.get("generative_ui_component")
        if ui_component:
            yield f"event: generative_ui\ndata: {json.dumps(ui_component)}\n\n"

        # Emit tool call records
        for tool_call in state.get("active_tool_calls", []):
            yield f"event: tool_call\ndata: {json.dumps(tool_call)}\n\n"

        # Done
        yield f"event: done\ndata: {json.dumps({'status': 'complete'})}\n\n"


# ── Singleton ────────────────────────────────────────────────────────────
_orchestrator: AgentOrchestrator | None = None


def get_orchestrator() -> AgentOrchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = AgentOrchestrator()
    return _orchestrator
