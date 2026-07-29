"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Compass, ShoppingBag, BarChart3, TrendingUp, Image } from "lucide-react";
import { fadeUp, standardTransition } from "@/lib/motion";

const suggestions = [
  { icon: <Sparkles className="w-4 h-4" />, text: "Find me a leather jacket under $200" },
  { icon: <Image className="w-4 h-4" />, text: "Search by uploading an image" },
  { icon: <ShoppingBag className="w-4 h-4" />, text: "What's trending right now?" },
  { icon: <BarChart3 className="w-4 h-4" />, text: "Compare the top wireless earbuds" },
];

const trendingItems = [
  { title: "Minimalist Leather Bag", price: "$189", tag: "Trending", image: "/images/bag.png" },
  { title: "Eco Running Shoes", price: "$149", tag: "New", image: "/images/shoes.png" },
  { title: "Biker Leather Jacket", price: "$289", tag: "AI Pick", image: "/images/jacket.png" },
];

export function EmptyState({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={standardTransition}
      className="flex flex-col items-center justify-center h-full px-6 py-16"
    >
      {/* Gradient Orb */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 via-amber-300 to-orange-600 opacity-80 blur-xl absolute inset-0" />
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 via-amber-300 to-orange-600 flex items-center justify-center relative">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">
        What are you shopping for today?
      </h2>
      <p className="text-zinc-500 text-[15px] mb-10 text-center max-w-md">
        Describe what you want, upload an image, or ask me to compare products. I'll handle the rest.
      </p>

      {/* Suggestion Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mb-12">
        {suggestions.map((s, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            onClick={() => onSuggestionClick(s.text)}
            className="flex items-center space-x-3 px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-left text-[13px] text-zinc-700 font-medium hover:bg-zinc-50 hover:border-zinc-300 transition-all group shadow-sm"
          >
            <span className="text-zinc-400 group-hover:text-orange-500 transition-colors">{s.icon}</span>
            <span>{s.text}</span>
          </motion.button>
        ))}
      </div>

      {/* Trending */}
      <div className="w-full max-w-lg">
        <p className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Trending Now</span>
        </p>
        <div className="space-y-2">
          {trendingItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.08, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              onClick={() => onSuggestionClick(`Find me ${item.title}`)}
              className="flex items-center justify-between px-4 py-3 bg-white border border-zinc-100 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover bg-zinc-100 border border-zinc-200/50" />
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                  <p className="text-xs text-zinc-400">{item.price}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                {item.tag}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
