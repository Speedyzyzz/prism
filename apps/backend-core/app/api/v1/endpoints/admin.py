from __future__ import annotations
"""
Prism OS — Admin Endpoints

Merchant OS dashboard: Return fraud risk analytics (PS 3),
fake review detection (PS 8), and session analytics.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.db_models import ReturnRequest, Order, ProductReview, Product, User
from app.models.schemas import ReturnRiskAuditResponse, ReturnRiskAuditItem, ReviewAuditResponse, ReviewAuditItem
from app.mcp_servers.risk_tools import evaluate_return_risk, verify_review_authenticity, get_risk_dashboard
from app.services.fraud_service import get_fraud_service

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/returns/risk-audit")
async def return_risk_audit(
    status_filter: Optional[str] = Query(None, alias="status"),
    min_risk: Optional[float] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Return Fraud Risk Dashboard (PS 3).

    Lists all return requests with risk scores and flagged reasons.
    """
    stmt = (
        select(ReturnRequest)
        .options(
            selectinload(ReturnRequest.order),
            selectinload(ReturnRequest.user),
        )
        .order_by(ReturnRequest.risk_score.desc())
    )

    if status_filter:
        stmt = stmt.where(ReturnRequest.status == status_filter.upper())
    if min_risk is not None:
        stmt = stmt.where(ReturnRequest.risk_score >= min_risk)

    result = await db.execute(stmt)
    returns = result.scalars().all()

    # Calculate aggregates
    total_count = len(returns)
    high_risk_count = sum(1 for r in returns if float(r.risk_score) >= 50)
    avg_risk = (
        sum(float(r.risk_score) for r in returns) / total_count
        if total_count > 0
        else 0.0
    )

    # Determine risk level from score
    def risk_level(score: float) -> str:
        if score >= 75:
            return "CRITICAL"
        elif score >= 50:
            return "HIGH"
        elif score >= 25:
            return "MEDIUM"
        return "LOW"

    pending_returns = [
        ReturnRiskAuditItem(
            request_id=r.id,
            order_id=r.order_id,
            customer_email=r.user.email if r.user else "",
            customer_name=r.user.full_name if r.user else "",
            reason=r.reason,
            claimed_condition=r.claimed_condition,
            risk_score=float(r.risk_score),
            risk_level=risk_level(float(r.risk_score)),
            flagged_reasons=r.risk_factors if isinstance(r.risk_factors, list) else [],
            status=r.status,
            created_at=r.created_at,
        )
        for r in returns
    ]

    return ReturnRiskAuditResponse(
        pending_returns=pending_returns,
        total_count=total_count,
        high_risk_count=high_risk_count,
        avg_risk_score=round(avg_risk, 2),
    )


@router.post("/returns/{return_id}/evaluate")
async def evaluate_return(
    return_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Trigger fraud risk evaluation on a specific return request.
    """
    return_req = await db.get(ReturnRequest, return_id)
    if not return_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Return request not found",
        )

    result = await evaluate_return_risk(
        db=db,
        order_id=return_req.order_id,
        claim_reason=return_req.reason,
    )

    # Update the return request with new risk score
    return_req.risk_score = result["risk_score"]
    return_req.risk_factors = result["flagged_reasons"]
    await db.flush()

    return result


@router.get("/reviews/audit")
async def review_audit(
    flagged_only: bool = Query(False),
    min_authenticity: Optional[float] = Query(None),
    max_authenticity: Optional[float] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Fake Review Detection Dashboard (PS 8).

    Lists reviews with authenticity scores and flag analysis.
    """
    stmt = (
        select(ProductReview)
        .options(
            selectinload(ProductReview.product),
            selectinload(ProductReview.user),
        )
        .order_by(ProductReview.authenticity_score.asc())  # Most suspicious first
    )

    if flagged_only:
        stmt = stmt.where(ProductReview.is_flagged_fake == True)
    if min_authenticity is not None:
        stmt = stmt.where(ProductReview.authenticity_score >= min_authenticity)
    if max_authenticity is not None:
        stmt = stmt.where(ProductReview.authenticity_score <= max_authenticity)

    result = await db.execute(stmt)
    reviews = result.scalars().all()

    # Run fraud analysis on each review to get flag reasons
    fraud_service = get_fraud_service()

    total_count = len(reviews)
    flagged_count = sum(1 for r in reviews if r.is_flagged_fake)
    avg_authenticity = (
        sum(float(r.authenticity_score) for r in reviews) / total_count
        if total_count > 0
        else 1.0
    )

    audit_items = []
    for r in reviews:
        analysis = fraud_service.verify_review_authenticity(
            review_text=r.review_text,
            rating=r.rating,
            is_verified_purchase=r.is_verified_purchase,
        )

        audit_items.append(ReviewAuditItem(
            review_id=r.id,
            product_id=r.product_id,
            product_title=r.product.title if r.product else "",
            user_email=r.user.email if r.user else "",
            rating=r.rating,
            review_text=r.review_text,
            authenticity_score=float(r.authenticity_score),
            is_flagged_fake=r.is_flagged_fake,
            is_verified_purchase=r.is_verified_purchase,
            flag_reasons=analysis.get("flag_reasons", []),
            created_at=r.created_at,
        ))

    return ReviewAuditResponse(
        reviews=audit_items,
        total_count=total_count,
        flagged_count=flagged_count,
        avg_authenticity=round(avg_authenticity, 2),
    )


@router.post("/reviews/{review_id}/verify")
async def verify_review(
    review_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Run NLP verification on a specific review."""
    result = await verify_review_authenticity(db=db, review_id=review_id)

    if result["status"] == "error":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["message"],
        )

    return result


@router.get("/dashboard")
async def admin_dashboard(
    db: AsyncSession = Depends(get_db),
):
    """
    Aggregated admin risk dashboard.

    Provides high-level metrics for returns, reviews, and catalog health.
    """
    dashboard = await get_risk_dashboard(db)

    # Add catalog stats
    from app.models.db_models import Product, Category
    total_products = await db.scalar(select(func.count(Product.id))) or 0
    active_products = await db.scalar(
        select(func.count(Product.id)).where(Product.is_active == True)
    ) or 0
    out_of_stock = await db.scalar(
        select(func.count(Product.id)).where(Product.stock_quantity <= 0)
    ) or 0

    total_users = await db.scalar(select(func.count(User.id))) or 0

    dashboard["catalog"] = {
        "total_products": total_products,
        "active_products": active_products,
        "out_of_stock": out_of_stock,
    }
    dashboard["users"] = {
        "total": total_users,
    }

    return dashboard


@router.get("/analytics/sessions")
async def session_analytics():
    """
    Customer session analytics (mock data).

    In production: tracks conversation flows, search drop-offs, and query intents.
    """
    return {
        "total_sessions_today": 342,
        "active_sessions": 28,
        "avg_session_duration_seconds": 186,
        "top_intents": [
            {"intent": "SEARCH", "count": 156, "percentage": 45.6},
            {"intent": "VISUAL_SEARCH", "count": 68, "percentage": 19.9},
            {"intent": "CART", "count": 52, "percentage": 15.2},
            {"intent": "COMPARE", "count": 38, "percentage": 11.1},
            {"intent": "RECOMMEND", "count": 28, "percentage": 8.2},
        ],
        "conversion_funnel": {
            "searches": 224,
            "product_views": 167,
            "add_to_cart": 89,
            "checkout_staged": 45,
            "completed_orders": 31,
            "conversion_rate": 13.8,
        },
        "search_drop_off_queries": [
            {"query": "vintage denim jacket", "drop_off_rate": 0.72},
            {"query": "sustainable sneakers", "drop_off_rate": 0.65},
            {"query": "silk evening dress", "drop_off_rate": 0.58},
        ],
    }
