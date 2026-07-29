from __future__ import annotations
"""
Prism OS — Executor Node

Handles cart mutations, product comparisons, and checkout staging
via the MCP tool layer.
"""

from app.agents.state import AgentState
from app.services.mock_llm import get_mock_llm


async def executor_node(state: AgentState, db) -> dict:
    """
    Executor Node — Dispatches cart actions, comparison requests,
    and checkout staging to the appropriate MCP tools.
    """
    from app.mcp_servers.cart_tools import manage_cart, stage_checkout
    from app.mcp_servers.catalog_tools import compare_products

    llm = get_mock_llm()

    user_id = state.get("user_id", "")
    search_params = state.get("search_params", {})
    selected_ids = state.get("selected_product_ids", [])
    retrieved = state.get("retrieved_products", [])

    # Get latest user message
    messages = state.get("messages", [])
    latest_message = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            latest_message = msg["content"]
            break

    thinking_steps = list(state.get("thinking_steps", []))
    response_text = ""
    generative_ui = None
    tool_calls = []

    message_lower = latest_message.lower()

    # ── Compare Flow ─────────────────────────────────────────────────
    if "compare" in message_lower or state.get("intent") == "COMPARE":
        if not selected_ids and retrieved:
            # Default to comparing first two results
            selected_ids = [
                p.get("product_id", p.get("id", ""))
                for p in retrieved[:2]
                if p.get("product_id") or p.get("id")
            ]

        if len(selected_ids) >= 2:
            thinking_steps.append(
                f"⚖️ Comparing {len(selected_ids)} products..."
            )

            result = await compare_products(db, selected_ids)

            if result["status"] == "success":
                response_text = await llm.generate_comparison_response(
                    len(result["products"])
                )
                generative_ui = {
                    "type": "COMPARISON_MATRIX",
                    "data": {
                        "products": result["products"],
                        "comparison_matrix": result["comparison_matrix"],
                        "highlights": result["highlights"],
                    },
                }
                tool_calls.append({
                    "tool": "compare_products",
                    "status": "success",
                    "product_count": len(result["products"]),
                })
                thinking_steps.append("✅ Comparison matrix generated")
            else:
                response_text = result.get("message", "Could not compare products")
                thinking_steps.append(f"❌ Comparison failed: {result.get('message')}")
        else:
            response_text = (
                "I need at least 2 products to compare. Please specify which products "
                "you'd like to compare, e.g., 'Compare option 1 and option 3'."
            )

    # ── Checkout Flow ────────────────────────────────────────────────
    elif any(kw in message_lower for kw in ["checkout", "check out", "staged checkout", "pay"]):
        thinking_steps.append("💳 Staging checkout session...")

        # First, add any referenced products to cart
        if selected_ids:
            for pid in selected_ids:
                add_result = await manage_cart(db, user_id, "ADD", product_id=pid, quantity=1)
                if add_result["status"] == "success":
                    thinking_steps.append(f"🛒 Added product to cart")

        result = await stage_checkout(db, user_id)

        if result["status"] == "success":
            response_text = await llm.generate_cart_response("CHECKOUT")
            generative_ui = {
                "type": "STAGED_CHECKOUT",
                "data": {
                    "cart": result["cart"],
                    "estimated_tax": result["estimated_tax"],
                    "shipping_options": result["shipping_options"],
                    "final_total": result["final_total"],
                    "checkout_url": result["checkout_url"],
                },
            }
            tool_calls.append({
                "tool": "stage_checkout",
                "status": "success",
            })
            thinking_steps.append("✅ Checkout staged successfully")
        else:
            response_text = result.get("message", "Could not stage checkout")
            thinking_steps.append(f"❌ Checkout failed: {result.get('message')}")

    # ── Add to Cart Flow ─────────────────────────────────────────────
    elif any(kw in message_lower for kw in ["add to cart", "add to my cart", "put in cart", "buy", "purchase"]):
        # Determine which product to add
        product_id = None
        product_title = ""

        if selected_ids:
            product_id = selected_ids[0]
        elif retrieved:
            product_id = retrieved[0].get("product_id", retrieved[0].get("id", ""))
            product_title = retrieved[0].get("title", "")

        if product_id:
            thinking_steps.append(f"🛒 Adding product to cart...")

            result = await manage_cart(db, user_id, "ADD", product_id=product_id, quantity=1)

            if result["status"] == "success":
                cart_data = result.get("cart", {})
                # Get title from cart items
                for item in cart_data.get("items", []):
                    if item.get("product_id") == product_id:
                        product_title = item.get("title", product_title)
                        break

                response_text = await llm.generate_cart_response("ADD", product_title)
                tool_calls.append({
                    "tool": "manage_cart",
                    "action": "ADD",
                    "status": "success",
                })
                thinking_steps.append(f"✅ Added {product_title} to cart")

                # Update cart state
                state_update = {"cart_state": cart_data}
            else:
                response_text = result.get("message", "Could not add to cart")
        else:
            response_text = (
                "Which product would you like to add to your cart? "
                "Please search for a product first or specify 'option N'."
            )

    # ── Apply Coupon Flow ────────────────────────────────────────────
    elif any(kw in message_lower for kw in ["coupon", "discount", "promo", "loyalty"]):
        coupon_code = search_params.get("coupon_code", "LOYALTY20")
        thinking_steps.append(f"🏷️ Applying coupon: {coupon_code}")

        result = await manage_cart(db, user_id, "APPLY_COUPON", coupon_code=coupon_code)

        if result["status"] == "success":
            cart_data = result.get("cart", {})
            response_text = await llm.generate_cart_response("APPLY_COUPON")
            response_text += f"\n\n**Discount:** ${cart_data.get('discount_amount', 0):.2f} off"
            response_text += f"\n**New total:** ${cart_data.get('total', 0):.2f}"
            tool_calls.append({
                "tool": "manage_cart",
                "action": "APPLY_COUPON",
                "status": "success",
            })
            thinking_steps.append(f"✅ Coupon {coupon_code} applied")
        else:
            response_text = result.get("message", "Could not apply coupon")
            thinking_steps.append(f"❌ Coupon failed: {result.get('message')}")

    # ── Remove from Cart Flow ────────────────────────────────────────
    elif any(kw in message_lower for kw in ["remove from cart", "delete from cart"]):
        if selected_ids:
            product_id = selected_ids[0]
            result = await manage_cart(db, user_id, "REMOVE", product_id=product_id)
            response_text = await llm.generate_cart_response("REMOVE", "item")
        else:
            response_text = "Which product would you like to remove from your cart?"

    # ── Fallback ─────────────────────────────────────────────────────
    else:
        response_text = "I can help you with that! Would you like me to search for products, compare options, or manage your cart?"

    return {
        "response_text": response_text,
        "generative_ui_component": generative_ui,
        "thinking_steps": thinking_steps,
        "active_tool_calls": tool_calls,
        "cart_state": state.get("cart_state", {}),
    }
