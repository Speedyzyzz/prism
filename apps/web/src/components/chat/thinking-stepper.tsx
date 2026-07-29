"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, Camera, Search, Puzzle, Sparkles, CheckCircle2 } from "lucide-react";
import { typography } from "@/theme/typography";
import { colors } from "@/theme/colors";

interface ThinkingStepperProps {
  steps: string[];
}

export function ThinkingStepper({ steps }: ThinkingStepperProps) {
  if (!steps || steps.length === 0) return null;

  const getStepIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("image") || lower.includes("siglip") || lower.includes("vision")) return Camera;
    if (lower.includes("search") || lower.includes("qdrant") || lower.includes("vector")) return Search;
    if (lower.includes("compar") || lower.includes("rank") || lower.includes("fusion")) return Puzzle;
    if (lower.includes("generat") || lower.includes("prepar")) return Sparkles;
    return Brain;
  };

  return (
    <div className="w-full max-w-lg my-4 rounded-xl bg-[#18181b]/50 border border-[#27272a] p-4 text-sm font-sans shadow-lg">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } },
        }}
        className="flex flex-col space-y-3 relative"
      >
        {/* Subtle connecting line */}
        <div className="absolute left-[11px] top-4 bottom-4 w-px bg-zinc-800" />
        
        {steps.map((step, idx) => {
          const Icon = getStepIcon(step);
          const isLast = idx === steps.length - 1;
          
          return (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, x: -10, filter: "blur(4px)" },
                visible: { opacity: 1, x: 0, filter: "blur(0px)" },
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-start space-x-4 relative z-10"
            >
              <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-[#09090b] ${isLast ? 'border-indigo-500 text-indigo-400' : 'border-emerald-500 text-emerald-400'}`}>
                {isLast ? (
                  <Icon className="w-3 h-3 animate-pulse" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
              </div>
              <div className="flex-1 text-zinc-400 font-medium pt-1 leading-snug tracking-tight">
                {step}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
