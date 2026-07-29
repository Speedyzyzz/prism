"use client";

import { DollarSign, TrendingUp, Users, ShoppingCart, Search, ArrowUpRight, CreditCard, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useOrderStore } from "@/stores/order-store";

export function SessionAnalytics() {
  const getMetrics = useOrderStore((s) => s.getMetrics);
  const storeMetrics = getMetrics();

  const revenueMetrics = [
    { label: "Gross Revenue Volume", value: formatPrice(storeMetrics.grossVolume), change: "+18.4%", icon: DollarSign, highlight: true },
    { label: "Average Order Value (AOV)", value: formatPrice(storeMetrics.aov), change: "+8.2%", icon: CreditCard, highlight: false },
    { label: "Checkout Conversion Rate", value: "13.8%", change: "+3.2%", icon: ShoppingCart, highlight: false },
    { label: "Active Customer Sessions", value: `${storeMetrics.totalOrders * 3}`, change: "+24%", icon: Users, highlight: false },
  ];

  const revenueByChannel = [
    { channel: "Stripe Card Gateway", amount: "$7,425.86", percentage: 52, color: "bg-zinc-900" },
    { channel: "Apple Pay / GPay", amount: "$3,998.54", percentage: 28, color: "bg-orange-500" },
    { channel: "PayPal Express", amount: "$2,142.08", percentage: 15, color: "bg-amber-500" },
    { channel: "UPI & Instant Wire", amount: "$714.02", percentage: 5, color: "bg-emerald-500" },
  ];

  const topIntents = [
    { intent: "SEARCH", count: 156, percentage: 45.6, color: "bg-zinc-900" },
    { intent: "VISUAL_SEARCH", count: 68, percentage: 19.9, color: "bg-orange-500" },
    { intent: "CART & CHECKOUT", count: 52, percentage: 15.2, color: "bg-emerald-600" },
    { intent: "COMPARE", count: 38, percentage: 11.1, color: "bg-amber-500" },
    { intent: "RECOMMEND", count: 28, percentage: 8.2, color: "bg-indigo-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Revenue & Key Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueMetrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={i}
              className={`border rounded-3xl p-5 shadow-sm flex flex-col justify-between ${
                m.highlight
                  ? "bg-zinc-900 border-zinc-800 text-white"
                  : "bg-white border-zinc-200/80 text-zinc-900"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${m.highlight ? "text-orange-400" : "text-zinc-400"}`}>
                  {m.label}
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${m.highlight ? "bg-white/10 text-white" : "bg-zinc-100 text-zinc-700"}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className={`text-3xl font-bold tracking-tight block ${m.highlight ? "text-white" : "text-zinc-900"}`}>
                  {m.value}
                </span>
                <span className="text-xs font-semibold text-emerald-500 flex items-center mt-2">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  {m.change} vs last period
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Breakdown & Intent Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Distribution By Payment Gateway */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-zinc-900">Revenue by Payment Gateway</h3>
              <p className="text-xs text-zinc-400">Gross transaction volume segmented by payment method</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              100% Settled
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {revenueByChannel.map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-800">{item.channel}</span>
                  <span className="text-zinc-900 font-bold">{item.amount} ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Conversational Intent Breakdown */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-zinc-900">Conversational Intent Breakdown</h3>
              <p className="text-xs text-zinc-400">User prompts categorized by Prism AI intent classification</p>
            </div>
            <span className="text-xs font-bold text-zinc-700 bg-zinc-100 px-3 py-1 rounded-full">
              342 Queries
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {topIntents.map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-800">{item.intent}</span>
                  <span className="text-zinc-500 font-mono">{item.count} queries ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
