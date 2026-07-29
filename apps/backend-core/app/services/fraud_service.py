from __future__ import annotations
"""
OmniShop OS — Fraud Detection & Review Verification Service

Provides mock ML-based risk scoring for return fraud (PS 3)
and NLP-driven fake review detection (PS 8).
"""

import random
import re
from datetime import datetime, timezone
from typing import Optional


class FraudDetectionService:
    """
    Simulates ML-based fraud detection for returns and reviews.
    In production: trained models with feature engineering pipelines.
    """

    # ── Return Fraud (PS 3) ──────────────────────────────────────────────

    # Known suspicious patterns
    FRAUD_INDICATORS = {
        "high_return_frequency": {
            "description": "Return rate exceeds 60% of purchases",
            "weight": 25.0,
        },
        "condition_mismatch": {
            "description": "Claimed condition inconsistent with purchase history",
            "weight": 20.0,
        },
        "rapid_return": {
            "description": "Return initiated within 24 hours of delivery",
            "weight": 15.0,
        },
        "serial_returner": {
            "description": "Multiple returns across different product categories",
            "weight": 18.0,
        },
        "device_fingerprint_match": {
            "description": "Device ID matching known fraud ring",
            "weight": 30.0,
        },
        "address_velocity": {
            "description": "Multiple accounts associated with shipping address",
            "weight": 22.0,
        },
        "high_value_pattern": {
            "description": "Consistently targets high-value items for returns",
            "weight": 16.0,
        },
    }

    def evaluate_return_risk(
        self,
        order_id: str,
        claim_reason: str,
        user_return_count: int = 0,
        user_order_count: int = 1,
        order_amount: float = 0.0,
    ) -> dict:
        """
        Evaluate fraud risk for a return request.

        Returns:
            dict with risk_score (0-100), risk_level, flagged_reasons
        """
        risk_score = 0.0
        flagged_reasons = []

        # Return frequency analysis
        if user_order_count > 0:
            return_rate = user_return_count / user_order_count
            if return_rate > 0.6:
                risk_score += self.FRAUD_INDICATORS["high_return_frequency"]["weight"]
                flagged_reasons.append(
                    f"High return frequency ({return_rate:.0%} of orders returned)"
                )
            elif return_rate > 0.4:
                risk_score += self.FRAUD_INDICATORS["high_return_frequency"]["weight"] * 0.5
                flagged_reasons.append(
                    f"Elevated return frequency ({return_rate:.0%})"
                )

        # High value targeting
        if order_amount > 150:
            risk_score += self.FRAUD_INDICATORS["high_value_pattern"]["weight"] * 0.5
            flagged_reasons.append(
                f"High-value return (${order_amount:.2f})"
            )

        # Suspicious claim keywords
        suspicious_keywords = [
            "wrong item", "not as described", "never arrived",
            "damaged", "counterfeit", "not authentic",
        ]
        reason_lower = claim_reason.lower()
        if any(kw in reason_lower for kw in suspicious_keywords):
            risk_score += 12.0
            flagged_reasons.append(
                "Claim reason matches common fraud patterns"
            )

        # Simulate additional ML signal (random for demo)
        ml_signal = random.uniform(0, 15)
        risk_score += ml_signal

        # Clamp to 0-100
        risk_score = max(0, min(100, risk_score))

        # Determine risk level
        if risk_score >= 75:
            risk_level = "CRITICAL"
        elif risk_score >= 50:
            risk_level = "HIGH"
        elif risk_score >= 25:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        if not flagged_reasons:
            flagged_reasons.append("No significant risk indicators detected")

        return {
            "risk_score": round(risk_score, 2),
            "risk_level": risk_level,
            "flagged_reasons": flagged_reasons,
            "model_version": "mock-v1.0",
            "evaluated_at": datetime.now(timezone.utc).isoformat(),
        }

    # ── Fake Review Detection (PS 8) ─────────────────────────────────────

    # Spam/fake review indicators
    REVIEW_SPAM_PATTERNS = [
        r"(best|amazing|perfect|excellent|wonderful)\s+(product|item|purchase)\s+(ever|i.ve)",
        r"(buy|order|purchased?)\s+\d+\s+(more|again|times)",
        r"(click|visit|check\s+out)\s+(my|this|the)\s+(link|profile|page)",
        r"(discount|coupon|free|promo)\s+(code|offer)",
        r"(.)\1{4,}",  # Repeated characters: "amaaaaaazing"
        r"[A-Z]{10,}",  # Excessive caps
    ]

    GENERIC_REVIEW_PHRASES = [
        "great product",
        "highly recommend",
        "five stars",
        "love it",
        "best purchase",
        "must buy",
        "exceeded expectations",
    ]

    def verify_review_authenticity(
        self,
        review_text: str,
        rating: int = 5,
        is_verified_purchase: bool = False,
        reviewer_review_count: int = 1,
    ) -> dict:
        """
        Analyze a review for authenticity using NLP heuristics.

        Returns:
            dict with authenticity_score (0-1), is_flagged, flag_reasons
        """
        score = 1.0  # Start as fully authentic
        flag_reasons = []

        # Length analysis
        word_count = len(review_text.split())
        if word_count < 5:
            score -= 0.15
            flag_reasons.append("Extremely short review")
        elif word_count < 10:
            score -= 0.08
            flag_reasons.append("Very brief review text")

        # Spam pattern matching
        for pattern in self.REVIEW_SPAM_PATTERNS:
            if re.search(pattern, review_text, re.IGNORECASE):
                score -= 0.20
                flag_reasons.append("Matches known spam pattern")
                break

        # Generic phrase detection
        review_lower = review_text.lower()
        generic_count = sum(
            1 for phrase in self.GENERIC_REVIEW_PHRASES
            if phrase in review_lower
        )
        if generic_count >= 2:
            score -= 0.15
            flag_reasons.append(f"Contains {generic_count} generic review phrases")

        # Rating distribution anomaly
        if rating == 5 and not is_verified_purchase:
            score -= 0.10
            flag_reasons.append("5-star rating from unverified purchase")

        # Reviewer history
        if reviewer_review_count > 20:
            score -= 0.08
            flag_reasons.append(f"Reviewer has {reviewer_review_count} reviews (potential bot)")

        # Sentiment-rating mismatch (simplified)
        negative_words = ["bad", "terrible", "awful", "worst", "hate", "broken", "cheap"]
        has_negative = any(w in review_lower for w in negative_words)
        if rating >= 4 and has_negative:
            score -= 0.12
            flag_reasons.append("Sentiment-rating mismatch detected")

        # Clamp score
        score = max(0.0, min(1.0, score))

        return {
            "authenticity_score": round(score, 2),
            "is_flagged_fake": score < 0.60,
            "flag_reasons": flag_reasons if flag_reasons else ["Review appears authentic"],
            "analysis_version": "mock-nlp-v1.0",
        }


# ── Singleton ────────────────────────────────────────────────────────────
_fraud_service: FraudDetectionService | None = None


def get_fraud_service() -> FraudDetectionService:
    global _fraud_service
    if _fraud_service is None:
        _fraud_service = FraudDetectionService()
    return _fraud_service
