from __future__ import annotations
"""
Prism OS — Cart Endpoints

Cart management, coupon application, and checkout staging.
"""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.mcp_servers.cart_tools import manage_cart, stage_checkout
from app.models.schemas import CartActionRequest

router = APIRouter(prefix="/cart", tags=["Cart"])


def _get_user_id(request: Request) -> str:
    """Extract user ID from request state (set by auth middleware)."""
    return getattr(request.state, "user_id", "demo-user-001")


@router.get("")
async def get_cart(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's cart contents."""
    user_id = _get_user_id(request)

    # Use manage_cart with a no-op to get current state
    # We'll do a direct query instead
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models.db_models import Cart, CartItem

    result = await db.execute(
        select(Cart)
        .where(Cart.user_id == user_id)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
    )
    cart = result.scalar_one_or_none()

    if not cart or not cart.items:
        return {
            "items": [],
            "item_count": 0,
            "subtotal": 0.0,
            "discount_amount": 0.0,
            "applied_coupon": None,
            "total": 0.0,
        }

    from app.mcp_servers.cart_tools import _serialize_cart
    return _serialize_cart(cart)


@router.post("/action")
async def cart_action(
    payload: CartActionRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Execute a cart action: ADD, REMOVE, CLEAR, APPLY_COUPON, UPDATE_QUANTITY.
    """
    user_id = _get_user_id(request)

    result = await manage_cart(
        db=db,
        user_id=user_id,
        action=payload.action.value,
        product_id=payload.product_id,
        quantity=payload.quantity or 1,
        coupon_code=payload.coupon_code,
    )

    return result


@router.post("/checkout")
async def checkout(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Stage a checkout session.

    Returns cart summary, tax estimate, shipping options, and total.
    """
    user_id = _get_user_id(request)
    result = await stage_checkout(db=db, user_id=user_id)
    return result
