"use client";

import React from "react";
import { Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";

interface ComparisonMatrixProps {
  products: any[];
  comparison_matrix?: Record<string, any[]>;
  highlights?: string[];
}

export function ComparisonMatrix({
  products,
  comparison_matrix = {},
  highlights = [],
}: ComparisonMatrixProps) {
  if (!products || products.length === 0) return null;

  const rowKeys = Object.keys(comparison_matrix).filter(
    (key) => key !== "price" && key !== "brand"
  );

  return (
    <div className="w-full mt-4 mb-6">
      <div className="flex items-center space-x-2 mb-4 pl-1">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <h3 className="font-semibold text-[13px] text-zinc-300 tracking-wide uppercase">
          AI Comparison
        </h3>
      </div>

      {/* Highlights */}
      {highlights && highlights.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-[20px] bg-indigo-500/5 border border-indigo-500/20"
        >
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">
            Key Differences
          </span>
          <div className="space-y-2">
            {highlights.map((h, i) => (
              <div key={i} className="text-sm text-zinc-300 flex items-start space-x-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span className="leading-snug">{h}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Comparison Cards instead of Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p, pIndex) => (
          <motion.div
            key={p.id || pIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pIndex * 0.1, duration: 0.3 }}
            className="flex flex-col bg-[#18181b] rounded-[24px] border border-[#27272a] p-5 shadow-lg relative overflow-hidden"
          >
            {/* Top Indicator */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6366f1] to-[#818cf8] opacity-50" />
            
            <div className="mb-4 pb-4 border-b border-[#27272a]">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 mb-2 inline-block">
                Option {pIndex + 1}
              </span>
              <h4 className="font-bold text-base text-white line-clamp-2 leading-tight mb-2">
                {p.title}
              </h4>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-white tracking-tight">
                  {formatPrice(p.price)}
                </span>
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                Brand: <span className="text-zinc-300 font-medium">{p.brand || "—"}</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {rowKeys.map((key) => {
                const val = comparison_matrix[key]?.[pIndex];
                const displayVal = String(val);
                const isPositive = displayVal.toLowerCase() === "yes" || displayVal === "true";
                const isNegative = displayVal.toLowerCase() === "no" || displayVal === "false";

                return (
                  <div key={key} className="flex flex-col">
                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">
                      {key.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center space-x-1.5 text-sm text-zinc-200">
                      {isPositive && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {isNegative && <XCircle className="w-4 h-4 text-red-500" />}
                      <span className="capitalize">{displayVal}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button className="mt-6 w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-semibold transition-colors shadow-sm">
              Select Option {pIndex + 1}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
