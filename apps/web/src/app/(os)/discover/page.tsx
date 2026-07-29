"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Heart, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

// Top 6 Featured AI Curation Products
const featuredProducts = [
  {
    id: "p1",
    title: "Minimalist Leather Biker Jacket",
    brand: "AeroStyle",
    price: "$179.99",
    category: "Outerwear",
    image: "/images/jacket.png",
  },
  {
    id: "p2",
    title: "Aurélie Luxury Leather Tote Bag",
    brand: "Aurélie",
    price: "$289.99",
    category: "Bags",
    image: "/images/bag.png",
  },
  {
    id: "p3",
    title: "Nova AeroStride Running Shoes",
    brand: "VeloCity",
    price: "$149.99",
    category: "Footwear",
    image: "/images/shoes.png",
  },
  {
    id: "p4",
    title: "ProAudio ANC Wireless Headphones",
    brand: "SonicPro",
    price: "$199.99",
    category: "Audio & Tech",
    image: "/images/headphones.png",
  },
  {
    id: "p5",
    title: "AeroChron Smart Watch Series 5",
    brand: "TechCraft",
    price: "$249.99",
    category: "Wearables",
    image: "/images/watch.png",
  },
  {
    id: "p6",
    title: "Luxura Matte Black Sunglasses",
    brand: "Luxura",
    price: "$119.99",
    category: "Accessories",
    image: "/images/sunglasses.png",
  },
];

// Top 6 Trending Drops Products (Based on Google E-Commerce Research)
const trendingDropsProducts = [
  {
    id: "t1",
    title: "ProAudio ANC Wireless Headphones",
    brand: "SonicPro",
    price: "$199.99",
    category: "Trending #1 in Audio",
    image: "/images/headphones.png",
  },
  {
    id: "t2",
    title: "AeroChron Smart Watch Series 5",
    brand: "TechCraft",
    price: "$249.99",
    category: "Trending #2 in Wearables",
    image: "/images/watch.png",
  },
  {
    id: "t3",
    title: "Luxura Matte Black Sunglasses",
    brand: "Luxura",
    price: "$119.99",
    category: "Trending #3 in Style",
    image: "/images/sunglasses.png",
  },
  {
    id: "t4",
    title: "Nova AeroStride Running Shoes",
    brand: "VeloCity",
    price: "$149.99",
    category: "Trending #4 in Footwear",
    image: "/images/shoes.png",
  },
  {
    id: "t5",
    title: "Aurélie Luxury Leather Tote Bag",
    brand: "Aurélie",
    price: "$289.99",
    category: "Trending #5 in Bags",
    image: "/images/bag.png",
  },
  {
    id: "t6",
    title: "Minimalist Leather Biker Jacket",
    brand: "AeroStyle",
    price: "$179.99",
    category: "Trending #6 in Outerwear",
    image: "/images/jacket.png",
  },
];

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<"curation" | "trending">("curation");
  const addItem = useCartStore((s) => s.addItem);

  const displayProducts = activeTab === "curation" ? featuredProducts : trendingDropsProducts;

  return (
    <div className="w-full h-full p-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className="flex flex-col space-y-8"
      >
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Discover</h1>
          <p className="text-zinc-500 text-lg">Prism Curation Engine. High-performance commerce discovery.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-6 border-b border-zinc-200/80 pb-4">
          <button 
            onClick={() => setActiveTab("curation")}
            className={`flex items-center space-x-2 font-semibold pb-4 -mb-[17px] transition-all ${
              activeTab === "curation"
                ? "text-zinc-900 border-b-2 border-zinc-900"
                : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Curation</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("trending")}
            className={`flex items-center space-x-2 font-semibold pb-4 -mb-[17px] transition-all ${
              activeTab === "trending"
                ? "text-zinc-900 border-b-2 border-zinc-900"
                : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Trending Drops</span>
          </button>
        </div>

        {/* Masonry Product Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"
          >
            {displayProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden group shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Product Image Container */}
                <div className="relative overflow-hidden bg-zinc-50 p-6 flex items-center justify-center h-64">
                  <img 
                    src={p.image} 
                    alt={p.title} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                  />
                  <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-red-500 transition-colors shadow-sm">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-orange-500">{p.category}</span>
                    <h3 className="text-base font-semibold text-zinc-900 mt-1">{p.title}</h3>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100">
                    <span className="text-lg font-bold text-zinc-900">{p.price}</span>
                    <button 
                      onClick={() => addItem(p.id)}
                      className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
