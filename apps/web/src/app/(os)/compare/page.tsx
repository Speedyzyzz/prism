"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, Check, X, Sparkles, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

const presetComparisons = {
  outerwear: {
    title: "Outerwear Comparison",
    products: [
      {
        id: "p1",
        title: "Minimalist Leather Biker Jacket",
        brand: "AeroStyle",
        price: "$179.99",
        rating: "4.7★ (128)",
        image: "/images/jacket.png",
        features: { material: "Vegan Leather", fit: "Slim", weather: "Water Resistant", warranty: "2 Years" },
      },
      {
        id: "p2",
        title: "Heritage Wool Blend Overcoat",
        brand: "UrbanCraft",
        price: "$289.99",
        rating: "4.5★ (67)",
        image: "/images/jacket.png",
        features: { material: "Wool-Cashmere", fit: "Regular", weather: "Insulated Heavy", warranty: "3 Years" },
      },
    ],
  },
  tech: {
    title: "Tech & Audio Comparison",
    products: [
      {
        id: "p3",
        title: "ProAudio ANC Headphones",
        brand: "SonicPro",
        price: "$199.99",
        rating: "4.8★ (450)",
        image: "/images/headphones.png",
        features: { material: "Matte Aluminum", battery: "40 Hours", anc: "Hybrid Active ANC", warranty: "2 Years" },
      },
      {
        id: "p4",
        title: "AeroChron Smart Watch",
        brand: "TechCraft",
        price: "$249.99",
        rating: "4.9★ (180)",
        image: "/images/watch.png",
        features: { material: "Aluminum / OLED", battery: "18 Hours", anc: "N/A (Fitness GPS)", warranty: "2 Years" },
      },
    ],
  },
  accessories: {
    title: "Style Accessories Comparison",
    products: [
      {
        id: "p5",
        title: "Aurélie Luxury Leather Tote",
        brand: "Aurélie",
        price: "$289.99",
        rating: "4.9★ (312)",
        image: "/images/bag.png",
        features: { material: "Italian Leather", size: "15-inch Laptop", strap: "Adjustable", warranty: "Lifetime" },
      },
      {
        id: "p6",
        title: "Luxura Matte Sunglasses",
        brand: "Luxura",
        price: "$119.99",
        rating: "4.6★ (92)",
        image: "/images/sunglasses.png",
        features: { material: "Acetate", size: "Universal Fit", strap: "Hard Case Included", warranty: "1 Year" },
      },
    ],
  },
};

export default function ComparePage() {
  const [activeCategory, setActiveCategory] = useState<keyof typeof presetComparisons>("outerwear");
  const addItem = useCartStore((s) => s.addItem);

  const selected = presetComparisons[activeCategory];

  return (
    <div className="w-full h-full p-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className="flex flex-col space-y-8"
      >
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Compare</h1>
          <p className="text-zinc-500 text-lg">Prism Side-by-side spec comparison matrix.</p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center space-x-3 bg-zinc-100/80 p-1.5 rounded-2xl w-fit border border-zinc-200/60">
          <button
            onClick={() => setActiveCategory("outerwear")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === "outerwear" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Jackets & Overcoats
          </button>
          <button
            onClick={() => setActiveCategory("tech")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === "tech" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Audio & Smart Devices
          </button>
          <button
            onClick={() => setActiveCategory("accessories")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === "accessories" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Bags & Accessories
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {selected.products.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-full h-56 bg-zinc-50 rounded-2xl p-4 flex items-center justify-center mb-6">
                  <img src={p.image} alt={p.title} className="w-full h-full object-contain" />
                </div>
                
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-500">{p.brand}</span>
                <h3 className="text-xl font-bold text-zinc-900 mt-1 mb-2">{p.title}</h3>
                
                <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                  <span className="text-zinc-400 text-xs font-medium">Price</span>
                  <span className="text-xl font-bold text-zinc-900">{p.price}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                  <span className="text-zinc-400 text-xs font-medium">Rating</span>
                  <span className="text-sm font-semibold text-zinc-800">{p.rating}</span>
                </div>

                {Object.entries(p.features).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-3 border-b border-zinc-100">
                    <span className="text-zinc-400 text-xs capitalize font-medium">{k}</span>
                    <span className="text-xs font-semibold text-zinc-800">{v}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addItem(p.id)}
                className="w-full mt-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-xs font-bold transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add {p.title} to Cart</span>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
