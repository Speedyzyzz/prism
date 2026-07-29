"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Download,
  Package,
  ShoppingBag,
  Cpu,
  Smartphone,
  Wallet,
  Building2,
} from "lucide-react";
import { formatPrice } from "@/lib/format";
import { activePaymentEngine } from "@/lib/payment-provider";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useOrderStore } from "@/stores/order-store";

const checkoutItems = [
  {
    id: "p1",
    title: "Minimalist Vegan Leather Biker Jacket",
    brand: "AeroStyle",
    price: 179.99,
    quantity: 1,
    image: "/images/jacket.png",
  },
];

const processingSteps = [
  "Verifying 256-bit SSL encryption...",
  "Contacting bank authorization gateway...",
  "Applying LOYALTY20 discount ($36.00)...",
  "Confirming inventory allocation...",
  "Payment Authorized & Order Created 🎉",
];

export default function CheckoutPage() {
  const createOrderFromCart = useOrderStore((s) => s.createOrderFromCart);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple_pay" | "google_pay" | "paypal" | "upi">("card");
  const [cardName, setCardName] = useState("Alex Chen");
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [cardExp, setCardExp] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("•••");

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [orderConfirmed, setOrderConfirmed] = useState<any | null>(null);

  const subtotal = 179.99;
  const discount = 36.0;
  const tax = 11.52;
  const shipping = 0.0;
  const total = subtotal - discount + tax + shipping;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setCurrentStepIndex(0);

    // Animate processing steps
    for (let i = 0; i < processingSteps.length - 1; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCurrentStepIndex(i + 1);
    }

    // Create real Order in unified orderStore
    const newOrder = createOrderFromCart({
      items: checkoutItems,
      paymentMethod: paymentMethod === "card" ? "Stripe (Card)" : paymentMethod.toUpperCase(),
      discount,
      customerName: cardName,
    });

    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsProcessing(false);
    setOrderConfirmed(newOrder);
  };

  return (
    <div className="w-full h-full p-8 max-w-6xl mx-auto">
      <AnimatePresence mode="wait">
        {orderConfirmed ? (
          /* ── ORDER CONFIRMATION VIEW ────────────────────────────────────── */
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="bg-white border border-zinc-200/80 rounded-3xl p-10 shadow-lg text-center max-w-2xl mx-auto my-12"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Payment Successful
            </span>

            <h1 className="text-3xl font-bold text-zinc-900 mt-4 mb-2 tracking-tight">
              Order {orderConfirmed.id}
            </h1>
            <p className="text-zinc-500 text-sm mb-8">
              Thank you! Your order has been placed and is being prepared for shipment.
            </p>

            {/* Receipt Summary */}
            <div className="bg-zinc-50 border border-zinc-200/60 rounded-2xl p-6 text-left space-y-3 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 font-medium">Estimated Delivery</span>
                <span className="font-bold text-zinc-900">{orderConfirmed.estimatedDelivery}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 font-medium">Tracking Number</span>
                <span className="font-mono text-xs font-semibold text-zinc-700">{orderConfirmed.trackingNumber}</span>
              </div>
              <div className="flex justify-between text-sm pt-3 border-t border-zinc-200/60 font-bold">
                <span className="text-zinc-900">Total Paid</span>
                <span className="text-zinc-900">{formatPrice(orderConfirmed.totalAmount)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/orders" className="w-full sm:w-auto">
                <button className="w-full px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-xs font-semibold transition-all flex items-center justify-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Track Order</span>
                </button>
              </Link>

              <button 
                onClick={() => alert("Invoice PDF downloaded successfully.")}
                className="w-full sm:w-auto px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-full text-xs font-semibold transition-all flex items-center justify-center space-x-2 border border-zinc-200"
              >
                <Download className="w-4 h-4" />
                <span>Download Invoice</span>
              </button>

              <Link href="/workspace" className="w-full sm:w-auto">
                <button className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs font-semibold transition-all flex items-center justify-center space-x-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </button>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* ── CHECKOUT FORM VIEW ────────────────────────────────────────── */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200/80 pb-5">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center space-x-3">
                  <span>Prism Secure Checkout</span>
                  <Lock className="w-5 h-5 text-orange-500" />
                </h1>
                <p className="text-zinc-500 text-sm mt-1">Provider-agnostic 256-bit SSL encrypted checkout engine.</p>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>PCI DSS Level 1 Compliant</span>
              </div>
            </div>

            {/* AI Assistant Guidance Banner */}
            <div className="bg-zinc-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Prism AI Transaction Assistant</p>
                  <p className="text-xs text-zinc-400">Your session is protected with end-to-end encryption. You've saved $36.00 using LOYALTY20.</p>
                </div>
              </div>
              <span className="hidden md:inline-block text-[10px] font-mono text-orange-400 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                Mock Provider Active
              </span>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Payment Options & Form (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Payment Methods Tabs */}
                <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                    Select Payment Method
                  </h3>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                        paymentMethod === "card"
                          ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mb-1" />
                      <span>Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("apple_pay")}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                        paymentMethod === "apple_pay"
                          ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                      }`}
                    >
                      <Smartphone className="w-4 h-4 mb-1" />
                      <span>Apple Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("google_pay")}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                        paymentMethod === "google_pay"
                          ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                      }`}
                    >
                      <Wallet className="w-4 h-4 mb-1" />
                      <span>GPay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paypal")}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                        paymentMethod === "paypal"
                          ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                      }`}
                    >
                      <Building2 className="w-4 h-4 mb-1" />
                      <span>PayPal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                        paymentMethod === "upi"
                          ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                      }`}
                    >
                      <Cpu className="w-4 h-4 mb-1" />
                      <span>UPI</span>
                    </button>
                  </div>

                  {/* Card Form */}
                  <form onSubmit={handlePay} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1">Card Number</label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          required
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-4 pr-10 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono"
                        />
                        <CreditCard className="w-4 h-4 text-zinc-400 absolute right-3" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-zinc-700 block mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExp}
                          onChange={(e) => setCardExp(e.target.value)}
                          required
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-zinc-700 block mb-1">CVC / CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          required
                          maxLength={4}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white rounded-full text-sm font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-2 mt-6"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Pay {formatPrice(total)} Securely</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Order Summary & Security Shield (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Order Summary Box */}
                <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-3">
                    Order Summary ({checkoutItems.length} Item)
                  </h3>

                  {checkoutItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 py-2">
                      <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-contain bg-zinc-50 border border-zinc-100 p-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate">{item.title}</p>
                        <p className="text-[11px] text-zinc-400">{item.brand} &middot; Qty {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-zinc-900">{formatPrice(item.price)}</span>
                    </div>
                  ))}

                  <div className="space-y-2 pt-4 border-t border-zinc-100 text-xs">
                    <div className="flex justify-between text-zinc-500">
                      <span>Subtotal</span>
                      <span className="font-semibold text-zinc-800">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Loyalty Discount (LOYALTY20)</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Estimated Tax</span>
                      <span className="font-semibold text-zinc-800">{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Shipping</span>
                      <span className="font-semibold text-emerald-600">FREE 2-Day</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-zinc-900 pt-3 border-t border-zinc-100">
                      <span>Total Amount</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Security Trust Panel */}
                <div className="bg-zinc-50 border border-zinc-200/60 rounded-3xl p-6 space-y-3 text-xs">
                  <div className="flex items-center space-x-2 font-bold text-zinc-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Prism Security Shield</span>
                  </div>
                  <ul className="space-y-2 text-zinc-600 pl-6 list-disc">
                    <li>256-bit SSL End-to-End Encryption</li>
                    <li>PCI DSS Level 1 Certified Infrastructure</li>
                    <li>AI Real-time Fraud & Anomaly Detection</li>
                    <li>Provider-Agnostic Abstraction (Stripe/PayPal/Razorpay Ready)</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Animation Modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 text-white border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-orange-400 animate-spin" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-1">Processing Prism Checkout</h3>
              <p className="text-xs text-zinc-400">Communicating with payment gateway provider...</p>
            </div>

            {/* Stepper Display */}
            <div className="space-y-3 text-left bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
              {processingSteps.map((step, idx) => {
                const isDone = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={idx} className="flex items-center space-x-3 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isDone
                        ? "bg-emerald-500 text-black"
                        : isCurrent
                        ? "bg-orange-500 text-white animate-pulse"
                        : "bg-zinc-800 text-zinc-500"
                    }`}>
                      {isDone ? "✓" : idx + 1}
                    </div>
                    <span className={`font-medium ${
                      isDone ? "text-emerald-400" : isCurrent ? "text-white font-semibold" : "text-zinc-600"
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
