"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, FolderOpen, Bell, Tag } from "lucide-react";
import { fadeUp, standardTransition, staggerContainer } from "@/lib/motion";

export default function WishlistPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="p-8 max-w-5xl mx-auto"
    >
      <motion.div variants={fadeUp} transition={standardTransition} className="flex items-center space-x-3 mb-2">
        <Heart className="w-7 h-7 text-zinc-900" />
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Wishlist</h1>
      </motion.div>
      <motion.p variants={fadeUp} transition={standardTransition} className="text-zinc-500 mb-8">Your saved items and collections.</motion.p>

      {/* Collections */}
      <motion.div variants={fadeUp} transition={standardTransition} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: <FolderOpen />, label: "All Items", count: 12 },
          { icon: <Bell />, label: "Price Drops", count: 3 },
          { icon: <Tag />, label: "AI Picks", count: 5 },
        ].map((col, i) => (
          <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center space-x-4 hover:bg-zinc-50 transition-colors cursor-pointer shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
              {React.cloneElement(col.icon as React.ReactElement, { className: "w-5 h-5" })}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">{col.label}</p>
              <p className="text-xs text-zinc-400">{col.count} items</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Empty state */}
      <motion.div variants={fadeUp} transition={standardTransition} className="bg-white border border-zinc-200 rounded-3xl p-12 flex flex-col items-center text-center shadow-sm">
        <Heart className="w-12 h-12 text-zinc-300 mb-4" />
        <h3 className="text-lg font-bold text-zinc-900 mb-2">No saved items yet</h3>
        <p className="text-zinc-400 text-sm max-w-sm">
          Items you save while browsing or chatting with the AI will appear here.
        </p>
      </motion.div>
    </motion.div>
  );
}
