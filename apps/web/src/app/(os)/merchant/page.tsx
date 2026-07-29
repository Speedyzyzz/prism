"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Building, ShieldAlert, Star, LineChart, CreditCard, ArrowUpRight, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { RiskTable } from "@/components/admin/risk-table";
import { ReviewFeed } from "@/components/admin/review-feed";
import { SessionAnalytics } from "@/components/admin/session-analytics";
import { formatPrice } from "@/lib/format";

import { useOrderStore } from "@/stores/order-store";

export default function MerchantPage() {
  const [adminSubTab, setAdminSubTab] = useState<"fraud" | "reviews" | "analytics" | "payments">("fraud");
  const getMetrics = useOrderStore((s) => s.getMetrics);
  const storeMetrics = getMetrics();
  const liveOrders = useOrderStore((s) => s.orders);

  // Combine live orders with sample merchant logs
  const allTransactions = [
    ...liveOrders.map((o) => ({
      id: `tx_${o.id}`,
      orderId: o.id,
      customer: o.customerName,
      amount: o.totalAmount,
      status: o.paymentStatus,
      provider: o.paymentMethod,
      date: "Just now",
    })),
    { id: "tx_102", orderId: "PRSM-19402", customer: "Sarah Jenkins", amount: 289.99, status: "SETTLED", provider: "Apple Pay", date: "2h ago" },
    { id: "tx_103", orderId: "PRSM-18301", customer: "Michael Brown", amount: 179.99, status: "REFUND_REQUESTED", provider: "PayPal", date: "5h ago" },
    { id: "tx_104", orderId: "PRSM-17550", customer: "David Miller", amount: 449.97, status: "SETTLED", provider: "Stripe (Card)", date: "1d ago" },
  ];

  return (
    <div className="w-full h-full p-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className="space-y-8"
      >
        <div className="flex items-center space-x-3 mb-2">
          <Building className="w-8 h-8 text-zinc-900" />
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Prism Merchant</h1>
        </div>
        <p className="text-zinc-500 mb-8">Enterprise-grade fraud protection, review shielding, and payment gateway console.</p>

        {/* Merchant Sub-navigation */}
        <div className="flex items-center space-x-4 border-b border-zinc-200 pb-4">
          <button
            onClick={() => setAdminSubTab("fraud")}
            className={`flex items-center space-x-2 font-semibold pb-4 -mb-[17px] transition-colors ${
              adminSubTab === "fraud"
                ? "text-zinc-900 border-b-2 border-zinc-900"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Fraud Risk</span>
          </button>

          <button
            onClick={() => setAdminSubTab("reviews")}
            className={`flex items-center space-x-2 font-semibold pb-4 -mb-[17px] transition-colors ${
              adminSubTab === "reviews"
                ? "text-zinc-900 border-b-2 border-zinc-900"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Fake Reviews</span>
          </button>

          <button
            onClick={() => setAdminSubTab("payments")}
            className={`flex items-center space-x-2 font-semibold pb-4 -mb-[17px] transition-colors ${
              adminSubTab === "payments"
                ? "text-zinc-900 border-b-2 border-zinc-900"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payments & Revenue</span>
          </button>

          <button
            onClick={() => setAdminSubTab("analytics")}
            className={`flex items-center space-x-2 font-semibold pb-4 -mb-[17px] transition-colors ${
              adminSubTab === "analytics"
                ? "text-zinc-900 border-b-2 border-zinc-900"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <LineChart className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </div>

        {/* Sub-tab Views */}
        <div className="pt-4">
          {adminSubTab === "fraud" && <RiskTable />}
          {adminSubTab === "reviews" && <ReviewFeed />}
          {adminSubTab === "analytics" && <SessionAnalytics />}
          
          {adminSubTab === "payments" && (
            <div className="space-y-6">
              {/* Revenue Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm">
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Gross Volume</p>
                  <p className="text-2xl font-bold text-zinc-900 mt-1">{formatPrice(storeMetrics.grossVolume)}</p>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center mt-2">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +18.4% vs last week
                  </span>
                </div>

                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm">
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Success Rate</p>
                  <p className="text-2xl font-bold text-zinc-900 mt-1">99.8%</p>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 0.02% Chargeback Risk
                  </span>
                </div>

                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm">
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Refund Requests</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">1 Pending</p>
                  <span className="text-[11px] text-zinc-400 font-medium flex items-center mt-2">
                    Item condition under review
                  </span>
                </div>

                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm">
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Gateway Status</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">Operational</p>
                  <span className="text-[11px] text-zinc-400 font-medium flex items-center mt-2">
                    Provider-Agnostic Engine
                  </span>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-900 mb-4">Recent Payment Transactions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Provider</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium text-zinc-800">
                      {allTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-4 font-mono font-bold text-zinc-900">{tx.orderId}</td>
                          <td className="py-4 font-semibold">{tx.customer}</td>
                          <td className="py-4 text-zinc-500">{tx.provider}</td>
                          <td className="py-4 font-bold text-zinc-900">{formatPrice(tx.amount)}</td>
                          <td className="py-4">
                            {tx.status === "SETTLED" ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                Settled
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center w-fit">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Refund Requested
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-right text-zinc-400">{tx.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
