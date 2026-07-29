"use client";

import React, { useState } from "react";
import { Info, Sparkles, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReasoningBadgeProps {
  reasons: string[];
}

export function ReasoningBadge({ reasons }: ReasoningBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  if (!reasons || reasons.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl bg-[#18181b] border border-[#27272a] p-3 text-xs transition-all hover:border-emerald-500/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-zinc-300 hover:text-white font-medium text-left group"
      >
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>AI Reasoning Match</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
            {reasons.length} {reasons.length > 1 ? "matches" : "match"}
          </span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-[#27272a] space-y-2">
              {reasons.map((reason, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start space-x-2 text-[12px] text-zinc-400"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{reason}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
