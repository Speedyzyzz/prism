"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, AlertOctagon, Star, CheckCircle, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-client";

interface ReviewAuditItem {
  review_id: string;
  product_title: string;
  user_email: string;
  rating: number;
  review_text: string;
  authenticity_score: number;
  is_flagged_fake: boolean;
  is_verified_purchase: boolean;
  flag_reasons: string[];
}

export function ReviewFeed() {
  const [reviews, setReviews] = useState<ReviewAuditItem[]>([
    {
      review_id: "rev_901",
      product_title: "Water-Resistant Commuter Backpack",
      user_email: "spam_bot_88@domain.com",
      rating: 1,
      review_text:
        "DO NOT BUY!! Check out my page for better deals and discount codes!! Visit link in bio for 50% off coupons!! This product is OVERPRICED!!",
      authenticity_score: 0.15,
      is_flagged_fake: true,
      is_verified_purchase: false,
      flag_reasons: ["Matches known spam pattern", "50% coupon promo link detected", "Unverified purchase"],
    },
    {
      review_id: "rev_902",
      product_title: "Titanium Chronograph Watch",
      user_email: "fake_user_12@domain.com",
      rating: 5,
      review_text:
        "This watch is terrible, cheaply made and broke in a week. But I give it 5 stars because the seller asked me to.",
      authenticity_score: 0.20,
      is_flagged_fake: true,
      is_verified_purchase: false,
      flag_reasons: ["Sentiment-rating mismatch detected", "Unverified purchase"],
    },
    {
      review_id: "rev_903",
      product_title: "Minimalist Vegan Leather Biker Jacket",
      user_email: "bot_network_4@domain.com",
      rating: 5,
      review_text:
        "Best product ever!!! Amazing amazing amazing!! Must buy this now!! I ordered 3 more for my friends!! Highly recommend everyone should buy this IMMEDIATELY!!!!",
      authenticity_score: 0.25,
      is_flagged_fake: true,
      is_verified_purchase: false,
      flag_reasons: ["Contains generic review phrases", "Excessive repetition & punctuation"],
    },
    {
      review_id: "rev_904",
      product_title: "Minimalist Vegan Leather Biker Jacket",
      user_email: "alex.chen@domain.com",
      rating: 5,
      review_text:
        "This vegan leather jacket exceeded my expectations. The fit is perfect for a slim build, and the material feels premium without any animal products.",
      authenticity_score: 0.95,
      is_flagged_fake: false,
      is_verified_purchase: true,
      flag_reasons: ["Review appears authentic"],
    },
  ]);

  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/reviews/audit`);
      if (res.ok) {
        const data = await res.json();
        if (data.reviews) {
          setReviews(data.reviews);
        }
      }
    } catch {
      // Keep pre-seeded data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="glass-card rounded-2xl p-5 border border-[#27272a] shadow-2xl">
      <div className="flex items-center justify-between mb-4 border-b border-[#27272a] pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-base text-white">
              Fake Review Shield & Authenticity Engine (PS 8)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            NLP spam pattern recognition, bot network detection & sentiment analysis
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={loading}
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center space-x-1 border border-zinc-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-3">
        {reviews.map((rev) => (
          <div
            key={rev.review_id}
            className={`p-4 rounded-xl border text-xs transition-all ${
              rev.is_flagged_fake
                ? "bg-rose-950/20 border-rose-500/30"
                : "bg-zinc-900/50 border-zinc-800"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">{rev.product_title}</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">{rev.user_email}</span>
              </div>

              {rev.is_flagged_fake ? (
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30 text-[10px] flex items-center space-x-1">
                  <AlertOctagon className="w-3 h-3 text-rose-500" />
                  <span>FLAGGED SPAM ({rev.authenticity_score * 100}%)</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 text-[10px] flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>VERIFIED AUTHENTIC</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1 text-amber-400 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < rev.rating ? "fill-current" : "text-zinc-700"
                  }`}
                />
              ))}
            </div>

            <p className="text-zinc-300 italic mb-3 bg-black/40 p-2.5 rounded-lg border border-zinc-800 font-serif">
              "{rev.review_text}"
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <div className="flex items-center space-x-1 text-[11px] text-zinc-400">
                <span className="font-semibold text-zinc-300">Flag Reasons:</span>
                <span>{rev.flag_reasons.join(" • ")}</span>
              </div>

              {rev.is_flagged_fake && (
                <button className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px]">
                  Purge Review
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
