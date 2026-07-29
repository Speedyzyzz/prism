"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, CheckCircle2, Truck, Clock, Package, ChevronDown, Download, ShieldCheck } from "lucide-react";
import { useOrderStore, Order } from "@/stores/order-store";
import { formatPrice } from "@/lib/format";
import Link from "next/link";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  DELIVERED: { label: "Delivered", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  SHIPPED: { label: "In Transit (Shipped)", color: "text-blue-700 bg-blue-50 border-blue-200", icon: Truck },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "text-indigo-700 bg-indigo-50 border-indigo-200", icon: Truck },
  PAID: { label: "Payment Confirmed", color: "text-purple-700 bg-purple-50 border-purple-200", icon: ShieldCheck },
  PREPARING: { label: "Preparing Order", color: "text-amber-700 bg-amber-50 border-amber-200", icon: Clock },
};

export default function OrdersPage() {
  const orders = useOrderStore((s) => s.orders);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0]?.id || null);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center space-x-3">
            <span>Orders & Purchases</span>
            <ClipboardList className="w-6 h-6 text-zinc-700" />
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Live order tracking, receipts, and order lifecycle management.</p>
        </div>
        <span className="text-xs font-bold text-zinc-700 bg-zinc-100 px-3 py-1.5 rounded-full border border-zinc-200">
          {orders.length} Active Orders
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center space-y-4">
          <Package className="w-12 h-12 text-zinc-300 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-900">No Orders Yet</h3>
          <p className="text-xs text-zinc-400">Your completed purchases will appear here in real-time.</p>
          <Link href="/workspace">
            <button className="px-6 py-2.5 bg-zinc-900 text-white rounded-full text-xs font-bold">
              Shop with Prism AI
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = statusConfig[order.orderStatus] || {
              label: order.orderStatus,
              color: "text-zinc-700 bg-zinc-50 border-zinc-200",
              icon: Clock,
            };
            const StatusIcon = statusInfo.icon;
            const isExpanded = expandedOrderId === order.id;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* Order Header Card */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-6 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-bold text-zinc-900">{order.id}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} &middot; {order.items.length} item(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-base font-bold text-zinc-900 block">{formatPrice(order.totalAmount)}</span>
                      <span className="text-[11px] text-zinc-400 font-medium">Delivery: {order.estimatedDelivery}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {/* Expanded Details & Tracking Timeline */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-zinc-100 bg-zinc-50/50 p-6 space-y-6"
                    >
                      {/* Tracking Stepper Bar */}
                      <div className="bg-white border border-zinc-200/60 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-zinc-900">Tracking #: {order.trackingNumber}</span>
                          <span className="text-zinc-500 font-medium">{order.courier}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden flex">
                          <div
                            className={`h-full bg-emerald-500 transition-all duration-500 ${
                              order.orderStatus === "DELIVERED"
                                ? "w-full"
                                : order.orderStatus === "SHIPPED"
                                ? "w-3/4"
                                : "w-1/2"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Purchased Items List */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Order Items</h4>
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between bg-white border border-zinc-200/60 rounded-2xl p-4">
                            <div className="flex items-center space-x-3">
                              <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-contain bg-zinc-50 p-1 border border-zinc-100" />
                              <div>
                                <p className="text-xs font-bold text-zinc-900">{item.title}</p>
                                <p className="text-[11px] text-zinc-400">{item.brand} &middot; Qty {item.quantity}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-zinc-900">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60">
                        <span className="text-xs text-zinc-400 font-medium">Payment Method: {order.paymentMethod}</span>
                        <button
                          onClick={() => alert(`Downloading Invoice for ${order.id}`)}
                          className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-full text-xs font-semibold text-zinc-700 flex items-center space-x-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Invoice</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
