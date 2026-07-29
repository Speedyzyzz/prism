from __future__ import annotations
"""
Prism OS — Risk MCP Tools

MCP-compliant tool functions for return fraud risk evaluation (PS 3)
and fake review verification (PS 8).
"""

from typing import Any

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.db_models import ReturnRequest, Order, ProductReview, Product, User
from app.services.fraud_service import get_fraud_service


async def evaluate_return_risk(
    db: AsyncSession,
    order_id: str,
    claim_reason: str,
) -> dict[str, Any]:
    """
    MCP Tool: evaluate_return_risk
    Evaluates return fraud probability for an order context.
    """
    fraud_service = get_fraud_service()

    # Load order details
    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()

    if not order:
        return {
            "tool": "evaluate_return_risk",
            "status": "error",
            "message": f"Order {order_id} not found",
        }

    # Count user's historical returns and orders
    user_return_count = await db.scalar(
        select(func.count(ReturnRequest.id)).where(
            ReturnRequest.user_id == order.user_id
        )
    ) or 0

    user_order_count = await db.scalar(
        select(func.count(Order.id)).where(Order.user_id == order.user_id)
    ) or 1

    # Evaluate risk
    risk_result = fraud_service.evaluate_return_risk(
        order_id=order_id,
        claim_reason=claim_reason,
        user_return_count=user_return_count,
        user_order_count=user_order_count,
        order_amount=float(order.total_amount),
    )

    return {
        "tool": "evaluate_return_risk",
        "status": "success",
        "order_id": order_id,
        "order_amount": float(order.total_amount),
        "user_return_history": {
            "total_returns": user_return_count,
            "total_orders": user_order_count,
            "return_rate": round(user_return_count / max(user_order_count, 1), 2),
        },
        **risk_result,
    }


async def verify_review_authenticity(
    db: AsyncSession,
    review_id: str,
) -> dict[str, Any]:
    """
    MCP Tool: verify_review_authenticity
    NLP-driven analysis of a specific review for fake/spam detection.
    """
    fraud_service = get_fraud_service()

    result = await db.execute(
        select(ProductReview)
        .where(ProductReview.id == review_id)
        .options(selectinload(ProductReview.user))
    )
    review = result.scalar_one_or_none()

    if not review:
        return {
            "tool": "verify_review_authenticity",
            "status": "error",
            "message": f"Review {review_id} not found",
        }

    # Count reviewer's total reviews
    reviewer_count = await db.scalar(
        select(func.count(ProductReview.id)).where(
            ProductReview.user_id == review.user_id
        )
    ) or 1

    # Run NLP analysis
    analysis = fraud_service.verify_review_authenticity(
        review_text=review.review_text,
        rating=review.rating,
        is_verified_purchase=review.is_verified_purchase,
        reviewer_review_count=reviewer_count,
    )

    # Update review record with analysis results
    review.authenticity_score = analysis["authenticity_score"]
    review.is_flagged_fake = analysis["is_flagged_fake"]
    await db.flush()

    return {
        "tool": "verify_review_authenticity",
        "status": "success",
        "review_id": review_id,
        "review_text": review.review_text,
        "rating": review.rating,
        "reviewer_email": review.user.email if review.user else "",
        **analysis,
    }


async def get_risk_dashboard(
    db: AsyncSession,
) -> dict[str, Any]:
    """
    MCP Tool: get_risk_dashboard
    Aggregated admin risk metrics for the merchant dashboard.
    """
    # Return request stats
    total_returns = await db.scalar(
        select(func.count(ReturnRequest.id))
    ) or 0

    high_risk_returns = await db.scalar(
        select(func.count(ReturnRequest.id)).where(
            ReturnRequest.risk_score >= 50
        )
    ) or 0

    avg_risk = await db.scalar(
        select(func.avg(ReturnRequest.risk_score))
    ) or 0.0

    pending_returns = await db.scalar(
        select(func.count(ReturnRequest.id)).where(
            ReturnRequest.status == "SUBMITTED"
        )
    ) or 0

    # Review stats
    total_reviews = await db.scalar(
        select(func.count(ProductReview.id))
    ) or 0

    flagged_reviews = await db.scalar(
        select(func.count(ProductReview.id)).where(
            ProductReview.is_flagged_fake == True
        )
    ) or 0

    avg_authenticity = await db.scalar(
        select(func.avg(ProductReview.authenticity_score))
    ) or 1.0

    return {
        "tool": "get_risk_dashboard",
        "status": "success",
        "returns": {
            "total": total_returns,
            "high_risk": high_risk_returns,
            "pending": pending_returns,
            "avg_risk_score": round(float(avg_risk), 2),
        },
        "reviews": {
            "total": total_reviews,
            "flagged_fake": flagged_reviews,
            "avg_authenticity": round(float(avg_authenticity), 2),
        },
    }
