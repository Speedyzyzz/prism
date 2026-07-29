from __future__ import annotations
"""
Prism OS — Chat Streaming Endpoint

POST /api/v1/chat — Main conversational AI endpoint.
Streams SSE events: thinking steps, text tokens, Generative UI components.
"""

import json
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.agents.graph import get_orchestrator
from app.models.schemas import ChatRequest

router = APIRouter(prefix="/chat", tags=["Chat"])

# In-memory session store (maps session_id → previous products)
# In production: Redis
_session_store: dict[str, list[dict]] = {}


@router.post("")
async def chat(
    payload: ChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Main conversational endpoint. Invokes the LangGraph agent and
    streams SSE events for real-time UI rendering.

    Events emitted:
    - `thinking`: Agent reasoning steps
    - `text`: Streamed text response tokens
    - `generative_ui`: Typed JSON for Product Cards, Comparison Grids, Checkout Cards
    - `tool_call`: Tool invocation records
    - `done`: Stream termination signal
    """
    orchestrator = get_orchestrator()

    # Resolve user ID from auth middleware
    user_id = getattr(request.state, "user_id", "demo-user-001")

    # Resolve or create session
    session_id = payload.session_id or str(uuid.uuid4())

    # Get previous products from session (for "option N" references)
    previous_products = _session_store.get(session_id, [])

    if payload.stream:
        async def event_stream():
            """SSE event generator."""
            # Run the agent pipeline and yield events
            state = None
            async for event in orchestrator.stream(
                user_id=user_id,
                session_id=session_id,
                message=payload.message,
                image_payload=payload.image_url,
                db=db,
                previous_products=previous_products,
            ):
                yield event

                # Capture state for session storage (from the last generative_ui event)
                if "generative_ui" in event:
                    try:
                        data = json.loads(event.split("data: ", 1)[1].strip())
                        products = data.get("data", {}).get("products", [])
                        if products:
                            _session_store[session_id] = products
                    except (json.JSONDecodeError, IndexError):
                        pass

            # Also store products from non-streaming invoke for session persistence
            final_state = await orchestrator.invoke(
                user_id=user_id,
                session_id=session_id,
                message=payload.message,
                image_payload=payload.image_url,
                db=db,
                previous_products=previous_products,
            )
            retrieved = final_state.get("retrieved_products", [])
            if retrieved:
                _session_store[session_id] = retrieved

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Session-Id": session_id,
            },
        )

    else:
        # Non-streaming: return full response as JSON
        state = await orchestrator.invoke(
            user_id=user_id,
            session_id=session_id,
            message=payload.message,
            image_payload=payload.image_url,
            db=db,
            previous_products=previous_products,
        )

        # Store products in session
        retrieved = state.get("retrieved_products", [])
        if retrieved:
            _session_store[session_id] = retrieved

        return {
            "session_id": session_id,
            "intent": state.get("intent", ""),
            "response_text": state.get("response_text", ""),
            "generative_ui": state.get("generative_ui_component"),
            "thinking_steps": state.get("thinking_steps", []),
            "tool_calls": state.get("active_tool_calls", []),
            "retrieved_products": retrieved[:5],  # Limit for JSON response
        }
