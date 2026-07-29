from __future__ import annotations
"""
Prism OS — Cart MCP Tools

MCP-compliant tool functions for cart mutation, coupon application,
and checkout staging.
"""

from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.db_models import Cart, CartItem, Product, User


# ── Coupon Registry ──────────────────────────────────────────────────────
VALID_COUPONS = {
    "LOYALTY20": {"discount_percent": 20, "description": "Loyalty member 20% off"},
    "WELCOME10": {"discount_percent": 10, "description": "New member 10% off"},
    "FLASH30": {"discount_percent": 30, "description": "Flash sale 30% off"},
    "HACKATHON": {"discount_percent": 15, "description": "Hackathon special 15% off"},
    "VIP25": {"discount_percent": 25, "description": "VIP exclusive 25% off"},
}


async def manage_cart(
    db: AsyncSession,
    user_id: str,
    action: str,
    product_id: Optional[str] = None,
    quantity: int = 1,
    coupon_code: Optional[str] = None,
) -> dict[str, Any]:
    """
    MCP Tool: execute_cart_action
    Modifies user cart state: ADD, REMOVE, CLEAR, APPLY_COUPON, UPDATE_QUANTITY.
    """
    # Get or create cart
    result = await db.execute(
        select(Cart)
        .where(Cart.user_id == user_id)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
        .execution_options(populate_existing=True)
    )
    cart = result.scalar_one_or_none()

    if cart is None:
        cart = Cart(user_id=user_id, items=[])
        db.add(cart)
        await db.flush()

    action = action.upper()

    if action == "ADD":
        if not product_id:
            return {"tool": "manage_cart", "status": "error", "message": "product_id required for ADD"}

        # Check product exists and is in stock
        product = await db.get(Product, product_id)
        if not product:
            return {"tool": "manage_cart", "status": "error", "message": f"Product {product_id} not found"}
        if product.stock_quantity < quantity:
            return {"tool": "manage_cart", "status": "error", "message": f"Insufficient stock for {product.title}"}

        # Check if already in cart
        existing_item = None
        cart_items = cart.__dict__["items"] if "items" in cart.__dict__ else []
        for item in cart_items:
            if item.product_id == product_id:
                existing_item = item
                break

        if existing_item:
            existing_item.quantity += quantity
        else:
            new_item = CartItem(
                cart_id=cart.id,
                product_id=product_id,
                quantity=quantity,
            )
            new_item.product = product
            db.add(new_item)

        await db.flush()
        product_title = product.title

    elif action == "REMOVE":
        if not product_id:
            return {"tool": "manage_cart", "status": "error", "message": "product_id required for REMOVE"}

        cart_items = cart.__dict__.get("items", [])
        for item in cart_items:
            if item.product_id == product_id:
                product_title = item.product.title if "product" in item.__dict__ and item.product else "Item"
                await db.delete(item)
                break
        else:
            return {"tool": "manage_cart", "status": "error", "message": "Product not in cart"}

        await db.flush()

    elif action == "UPDATE_QUANTITY":
        if not product_id:
            return {"tool": "manage_cart", "status": "error", "message": "product_id required"}

        cart_items = cart.__dict__.get("items", [])
        for item in cart_items:
            if item.product_id == product_id:
                item.quantity = quantity
                break

        await db.flush()
        product_title = ""

    elif action == "CLEAR":
        cart_items = cart.__dict__.get("items", [])
        for item in cart_items:
            await db.delete(item)
        cart.applied_coupon = None
        cart.discount_amount = 0.0
        await db.flush()
        product_title = ""

    elif action == "APPLY_COUPON":
        if not coupon_code:
            return {"tool": "manage_cart", "status": "error", "message": "coupon_code required"}

        coupon = VALID_COUPONS.get(coupon_code.upper())
        if not coupon:
            return {
                "tool": "manage_cart",
                "status": "error",
                "message": f"Invalid coupon code: {coupon_code}",
            }

        cart.applied_coupon = coupon_code.upper()
        # Calculate discount
        cart_items = cart.__dict__.get("items", [])
        subtotal = sum(
            float(item.product.price) * item.quantity
            for item in cart_items
            if "product" in item.__dict__ and item.product
        )
        cart.discount_amount = round(subtotal * coupon["discount_percent"] / 100, 2)
        await db.flush()
        product_title = ""

    else:
        return {"tool": "manage_cart", "status": "error", "message": f"Unknown action: {action}"}

    # Query fresh cart with eager loaded relationships
    result = await db.execute(
        select(Cart)
        .where(Cart.id == cart.id)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
        .execution_options(populate_existing=True)
    )
    fresh_cart = result.scalar_one()

    return {
        "tool": "manage_cart",
        "status": "success",
        "action": action,
        "cart": _serialize_cart(fresh_cart),
    }


async def apply_coupon(
    db: AsyncSession,
    user_id: str,
    code: str,
) -> dict[str, Any]:
    """MCP Tool: apply_coupon — Validates and applies a discount code."""
    return await manage_cart(db, user_id, "APPLY_COUPON", coupon_code=code)


async def stage_checkout(
    db: AsyncSession,
    user_id: str,
) -> dict[str, Any]:
    """
    MCP Tool: stage_checkout
    Generates a pre-filled checkout session with shipping options.
    """
    result = await db.execute(
        select(Cart)
        .where(Cart.user_id == user_id)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
        .execution_options(populate_existing=True)
    )
    cart = result.scalar_one_or_none()

    if not cart or not cart.items:
        return {
            "tool": "stage_checkout",
            "status": "error",
            "message": "Cart is empty",
        }

    cart_data = _serialize_cart(cart)
    subtotal = cart_data["subtotal"]
    discount = cart_data["discount_amount"]
    tax_rate = 0.08  # 8% mock tax
    estimated_tax = round((subtotal - discount) * tax_rate, 2)

    shipping_options = [
        {
            "method": "Standard Shipping",
            "estimated_days": "5-7 business days",
            "cost": 0.00 if subtotal > 50 else 5.99,
            "is_free": subtotal > 50,
        },
        {
            "method": "Express Shipping",
            "estimated_days": "2-3 business days",
            "cost": 12.99,
            "is_free": False,
        },
        {
            "method": "Next Day Delivery",
            "estimated_days": "1 business day",
            "cost": 24.99,
            "is_free": False,
        },
    ]

    final_total = round(subtotal - discount + estimated_tax + shipping_options[0]["cost"], 2)

    return {
        "tool": "stage_checkout",
        "status": "success",
        "cart": cart_data,
        "estimated_tax": estimated_tax,
        "shipping_options": shipping_options,
        "final_total": final_total,
        "checkout_url": f"/checkout/{cart.id}",
    }


def _serialize_cart(cart: Cart) -> dict[str, Any]:
    """Convert cart ORM object to API-friendly dict."""
    items = []
    subtotal = 0.0

    # Safely iterate cart items
    cart_items = getattr(cart, "items", []) or []
    for item in cart_items:
        # Inspect item dict to check if product relationship is loaded
        product = None
        if "product" in item.__dict__:
            product = item.__dict__["product"]
        elif hasattr(item, "product"):
            try:
                product = item.product
            except Exception:
                product = None

        if product:
            price = float(product.price)
            item_subtotal = price * item.quantity
            subtotal += item_subtotal
            items.append({
                "product_id": item.product_id,
                "title": product.title,
                "price": price,
                "quantity": item.quantity,
                "image_url": (product.images or [""])[0] if product.images else "",
                "subtotal": round(item_subtotal, 2),
            })

    discount = float(cart.discount_amount) if cart.discount_amount else 0.0

    return {
        "items": items,
        "item_count": sum(i["quantity"] for i in items),
        "subtotal": round(subtotal, 2),
        "discount_amount": discount,
        "applied_coupon": cart.applied_coupon,
        "total": round(max(0.0, subtotal - discount), 2),
    }
