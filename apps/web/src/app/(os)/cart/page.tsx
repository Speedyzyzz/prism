"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/format";
import Link from "next/link";

export default function CartPage() {
  const { items, subtotal, discount, total, removeItem } = useCartStore();
  const tax = subtotal * 0.08;
  const finalTotal = total + tax;

  return (
    <div className="w-full h-full p-8 max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className="flex flex-col lg:flex-row gap-8"
      >
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-8">
            <ShoppingBag className="w-8 h-8 text-zinc-900" />
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Your Cart</h1>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {items.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border border-zinc-200 rounded-3xl p-12 text-center"
                >
                  <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Your cart is empty</h3>
                  <p className="text-sm text-zinc-500 mb-6">Explore the AI Workspace to find the perfect products.</p>
                  <Link href="/workspace">
                    <button className="px-6 py-2.5 bg-zinc-900 text-white rounded-full text-sm font-bold hover:bg-zinc-800 transition-colors">
                      Start Shopping
                    </button>
                  </Link>
                </motion.div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    key={item.product_id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center p-4 bg-white border border-zinc-200 rounded-3xl shadow-sm relative group"
                  >
                    <div className="w-24 h-24 bg-zinc-50 rounded-2xl border border-zinc-100 mr-6 flex-shrink-0 overflow-hidden">
                      {item.image_url && <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-zinc-900">{item.title}</h3>
                      <p className="text-zinc-500 text-sm mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="flex flex-col items-end mr-4">
                      <div className="text-xl font-bold text-zinc-900">{formatPrice(item.subtotal)}</div>
                      <button 
                        onClick={() => removeItem(item.product_id)}
                        className="mt-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="w-full lg:w-[350px]">
          <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm sticky top-8">
            <h3 className="text-xl font-bold text-zinc-900 mb-6">Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-zinc-500 text-sm">
                <span>Subtotal</span>
                <span className="text-zinc-900 font-medium">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-500 text-sm">
                  <span>Discount</span>
                  <span className="font-medium">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-500 text-sm">
                <span>Shipping</span>
                <span className="text-green-500 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-zinc-500 text-sm">
                <span>Estimated Tax</span>
                <span className="text-zinc-900 font-medium">{formatPrice(tax)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-bold text-zinc-900">Total</span>
                <span className="text-2xl font-bold text-zinc-900">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <Link href={items.length > 0 ? "/checkout" : "#"}>
              <button 
                disabled={items.length === 0}
                className="w-full bg-orange-500 disabled:bg-zinc-300 disabled:shadow-none text-white rounded-full py-4 font-bold flex items-center justify-center space-x-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 active:scale-[0.98]"
              >
                <span>Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
