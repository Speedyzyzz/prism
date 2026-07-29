"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle, RefreshCw, Filter } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-client";

interface ReturnClaim {
  request_id: string;
  order_id: string;
  customer_email: string;
  customer_name: string;
  reason: string;
  claimed_condition: string;
  risk_score: number;
  risk_level: string;
  flagged_reasons: string[];
  status: string;
}

export function RiskTable() {
  const [claims, setClaims] = useState<ReturnClaim[]>([
    {
      request_id: "ret_4412",
      order_id: "ord_8821",
      customer_email: "alex.c@domain.com",
      customer_name: "Alex Chen",
      reason: "Item arrived damaged — visible scratches on case",
      claimed_condition: "Damaged",
      risk_score: 87.4,
      risk_level: "CRITICAL",
      flagged_reasons: [
        "High return frequency (>80% of orders returned)",
        "Device ID matching known fraud ring",
        "Shipping address velocity anomaly",
        "High-value return ($479.98)",
      ],
      status: "SUBMITTED",
    },
    {
      request_id: "ret_4413",
      order_id: "ord_8822",
      customer_email: "sam.w@domain.com",
      customer_name: "Sam Wilson",
      reason: "Wrong item sent — this is not what I ordered",
      claimed_condition: "Sealed, unopened",
      risk_score: 72.8,
      risk_level: "HIGH",
      flagged_reasons: [
        "High return frequency (60% return rate)",
        "Claim reason matches common fraud patterns",
      ],
      status: "SUBMITTED",
    },
    {
      request_id: "ret_4414",
      order_id: "ord_8823",
      customer_email: "morgan.l@domain.com",
      customer_name: "Morgan Lee",
      reason: "Color mismatch — looks different from online photo",
      claimed_condition: "Worn once",
      risk_score: 35.2,
      risk_level: "MEDIUM",
      flagged_reasons: ["Item worn before return"],
      status: "UNDER_REVIEW",
    },
    {
      request_id: "ret_4415",
      order_id: "ord_8824",
      customer_email: "jordan.k@domain.com",
      customer_name: "Jordan Kim",
      reason: "Item does not fit as expected",
      claimed_condition: "Unworn, tags attached",
      risk_score: 8.5,
      risk_level: "LOW",
      flagged_reasons: ["Standard fit return"],
      status: "APPROVED",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const fetchRiskData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/returns/risk-audit`);
      if (res.ok) {
        const data = await res.json();
        if (data.pending_returns) {
          setClaims(data.pending_returns);
        }
      }
    } catch {
      // Keep pre-seeded data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  const getRiskBadge = (level: string, score: number) => {
    if (level === "CRITICAL" || score >= 75) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-bold flex items-center space-x-1 w-fit">
          <ShieldAlert className="w-3 h-3 text-rose-500" />
          <span>{score} CRITICAL</span>
        </span>
      );
    } else if (level === "HIGH" || score >= 50) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center space-x-1 w-fit">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>{score} HIGH</span>
        </span>
      );
    } else if (level === "MEDIUM" || score >= 25) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 text-[11px] font-semibold w-fit">
          {score} MEDIUM
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold w-fit">
        {score} LOW
      </span>
    );
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-[#27272a] shadow-2xl">
      <div className="flex items-center justify-between mb-4 border-b border-[#27272a] pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h2 className="font-bold text-base text-white">
              Return Fraud Risk Analytics (PS 3)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Automated ML risk scoring & fraud ring detection on order claims
          </p>
        </div>

        <button
          onClick={fetchRiskData}
          disabled={loading}
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center space-x-1 border border-zinc-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#27272a] text-zinc-400">
              <th className="py-3 px-3 font-semibold">Claim ID</th>
              <th className="py-3 px-3 font-semibold">Customer</th>
              <th className="py-3 px-3 font-semibold">Claim Reason</th>
              <th className="py-3 px-3 font-semibold">Risk Score</th>
              <th className="py-3 px-3 font-semibold">Flagged Indicators</th>
              <th className="py-3 px-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {claims.map((claim) => (
              <tr key={claim.request_id} className="hover:bg-zinc-900/40 transition-colors">
                <td className="py-3 px-3 font-mono text-zinc-300">
                  {claim.request_id}
                  <span className="block text-[10px] text-zinc-500">{claim.order_id}</span>
                </td>
                <td className="py-3 px-3 text-white font-medium">
                  {claim.customer_name}
                  <span className="block text-[10px] text-zinc-400">{claim.customer_email}</span>
                </td>
                <td className="py-3 px-3 text-zinc-300 max-w-xs">
                  <p className="line-clamp-2">{claim.reason}</p>
                </td>
                <td className="py-3 px-3">
                  {getRiskBadge(claim.risk_level, claim.risk_score)}
                </td>
                <td className="py-3 px-3 max-w-xs">
                  <div className="space-y-1">
                    {claim.flagged_reasons.map((reason, i) => (
                      <span
                        key={i}
                        className="inline-block text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 mr-1"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <button className="px-3 py-1.5 rounded-lg bg-[#6366f1] hover:bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-500/20">
                    Audit Claim
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
