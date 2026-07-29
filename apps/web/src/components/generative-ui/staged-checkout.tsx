"use client";

import React, { useState } from "react";
import { ShoppingBag, Tag, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface StagedCheckoutProps {
  cart: {
    items: any[];
    subtotal: number;
    discount_amount: number;
    applied_coupon?: string;
    total: number;
  };
  estimated_tax: number;
  shipping_options: any[];
  final_total: number;
  onConfirmOrder?: () => void;
}

import { useOrderStore } from "@/stores/order-store";

export function StagedCheckout({
  cart,
  estimated_tax,
  shipping_options = [],
  final_total,
  onConfirmOrder,
}: StagedCheckoutProps) {
  const [selectedShipping, setSelectedShipping] = useState(0);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const createOrderFromCart = useOrderStore((s) => s.createOrderFromCart);

  const currentShipping = shipping_options[selectedShipping] || {
    method: "Standard Shipping",
    cost: 0,
  };

  const calculatedFinal = (
    cart.total +
    estimated_tax +
    (currentShipping.cost || 0)
  ).toFixed(2);

  const handleOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const order = createOrderFromCart({
        items: cart.items.map((i) => ({
          id: i.product_id || "p1",
          title: i.title,
          brand: "AeroStyle",
          price: i.price,
          quantity: i.quantity,
          image: i.image_url || "/images/jacket.png",
        })),
        paymentMethod: "Stripe (Card)",
        discount: cart.discount_amount,
        customerName: "Alex Chen",
      });

      setIsProcessing(false);
      setConfirmedOrder(order);
      onConfirmOrder?.();
    }, 1000);
  };

  if (confirmedOrder) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md my-4 bg-white rounded-[24px] p-6 border border-emerald-200 text-center shadow-lg"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
          className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3"
        >
          <CheckCircle2 className="w-7 h-7" />
        </motion.div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          Payment Successful
        </span>
        <h3 className="font-bold text-lg text-zinc-900 mt-2 mb-1">
          Order {confirmedOrder.id}
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          Tracking #: <span className="font-mono font-bold text-zinc-800">{confirmedOrder.trackingNumber}</span> &middot; Delivery {confirmedOrder.estimatedDelivery}
        </p>
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
          <span>Synced with Prism Merchant</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md my-4 bg-[#18181b] rounded-[24px] border border-[#27272a] shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-[#27272a] bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-sm text-white uppercase tracking-wide">
            Express Checkout
          </h3>
        </div>
      </div>

      <div className="p-5">
        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {cart.items.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-3">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-12 h-12 rounded-xl object-cover bg-zinc-900 border border-zinc-800"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-zinc-600" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white line-clamp-1">{item.title}</h4>
                <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
              </div>
              <div className="font-semibold text-white">
                {formatPrice(item.subtotal)}
              </div>
            </div>
          ))}
        </div>

        {/* Shipping Picker */}
        {shipping_options.length > 0 && (
          <div className="mb-6 space-y-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
              Delivery Method
            </span>
            {shipping_options.map((opt, i) => (
              <label
                key={i}
                onClick={() => setSelectedShipping(i)}
                className={`relative flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedShipping === i
                    ? "bg-indigo-500/5 border-indigo-500 text-white"
                    : "bg-transparent border-[#27272a] text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedShipping === i ? 'border-indigo-500' : 'border-zinc-600'}`}>
                    {selectedShipping === i && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                  </div>
                  <div>
                    <span className="font-medium text-sm text-white block">
                      {opt.method}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {opt.estimated_days}
                    </span>
                  </div>
                </div>
                <span className="font-semibold text-sm">
                  {opt.cost === 0 ? "Free" : formatPrice(opt.cost)}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* Breakdown */}
        <div className="space-y-2.5 text-sm text-zinc-400 mb-6">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-white">{formatPrice(cart.subtotal)}</span>
          </div>

          <AnimatePresence>
            {cart.discount_amount > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex justify-between text-emerald-400 font-medium"
              >
                <span className="flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{cart.applied_coupon || "Discount"}</span>
                </span>
                <span>-{formatPrice(cart.discount_amount)}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="text-white">{currentShipping.cost === 0 ? "Free" : formatPrice(currentShipping.cost)}</span>
          </div>

          <div className="flex justify-between">
            <span>Estimated Tax</span>
            <span className="text-white">{formatPrice(estimated_tax)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-end border-t border-[#27272a] pt-4 mb-6">
          <span className="text-sm font-semibold text-zinc-300">Total</span>
          <motion.span 
            key={calculatedFinal}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white tracking-tight"
          >
            ${calculatedFinal}
          </motion.span>
        </div>

        {/* Action CTA */}
        <button
          onClick={handleOrder}
          disabled={isProcessing}
          className="relative w-full h-12 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition-all overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center space-x-2"
              >
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center"
              >
                <span>Pay ${calculatedFinal}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}
