"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore, type ContextPanelType } from "@/stores/chat-store";
import { ProductCarousel } from "@/components/generative-ui/product-carousel";
import { ComparisonMatrix } from "@/components/generative-ui/comparison-matrix";
import { StagedCheckout } from "@/components/generative-ui/staged-checkout";
import { contextPanelTransition, slideRight } from "@/lib/motion";
import { Sparkles, Layers, SlidersHorizontal, Cpu } from "lucide-react";

export function ContextPanel() {
  const contextPanelType = useChatStore((s) => s.contextPanelType);
  const contextPanelData = useChatStore((s) => s.contextPanelData);

  return (
    <div className="h-full overflow-y-auto border-l border-zinc-200/60 bg-white/60 backdrop-blur-xl">
      <AnimatePresence mode="wait">
        {contextPanelType ? (
          <motion.div
            key={contextPanelType}
            variants={slideRight}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={contextPanelTransition}
            className="h-full"
          >
            <PanelContent type={contextPanelType} data={contextPanelData} />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            variants={slideRight}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={contextPanelTransition}
            className="h-full"
          >
            <ContextEmptyState />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PanelContent({ type, data }: { type: ContextPanelType; data: any }) {
  switch (type) {
    case "PRODUCT_CAROUSEL":
      return (
        <div className="p-6 space-y-6">
          <PanelHeader icon={<Sparkles />} title="Recommendations" subtitle={`${data?.products?.length || 0} items matched`} />
          
          {/* Section 1: AI Reasoning & Intelligence Notes */}
          <div className="bg-zinc-900 text-white rounded-2xl p-4 space-y-2 text-xs shadow-sm">
            <div className="flex items-center space-x-2 font-bold text-orange-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Intelligence Notes</span>
            </div>
            <ul className="space-y-1 text-zinc-300 pl-5 list-disc leading-relaxed font-mono text-[11px]">
              <li>SigLIP Embedding Match: 96.4% confidence score</li>
              <li>Filter Constraints: Color (Black) &middot; Material (Leather)</li>
              <li>Ranked by rating, brand affinity, and budget constraints</li>
            </ul>
          </div>

          {/* Section 2: Active Filters */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <SlidersHorizontal className="w-3 h-3" />
              <span>Detected Attributes</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">Color: Black</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">Material: Leather</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">Budget: &lt;$200</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 font-semibold border border-orange-200">Vector Similarity: High</span>
            </div>
          </div>

          {/* Section 3: Product Matches Grid */}
          <ProductCarousel products={data?.products || []} />
        </div>
      );

    case "COMPARISON_MATRIX":
      return (
        <div className="p-6">
          <PanelHeader icon={<Layers />} title="Comparison Matrix" subtitle="Side-by-side analysis" />
          <ComparisonMatrix
            products={data?.products || []}
            comparison_matrix={data?.comparison_matrix}
            highlights={data?.highlights}
          />
        </div>
      );

    case "STAGED_CHECKOUT":
      return (
        <div className="p-6">
          <PanelHeader icon={<Sparkles />} title="Agentic Checkout" subtitle="Staged session review" />
          <StagedCheckout
            cart={data?.cart || { items: [], subtotal: 0, discount_amount: 0, total: 0 }}
            estimated_tax={data?.estimated_tax || 0}
            shipping_options={data?.shipping_options || []}
            final_total={data?.final_total || 0}
          />
        </div>
      );

    default:
      return <ContextEmptyState />;
  }
}

function PanelHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center space-x-3 pb-4 border-b border-zinc-200/80">
      <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-sm">
        {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4 text-orange-400" })}
      </div>
      <div>
        <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
        <p className="text-xs text-zinc-400 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

function ContextEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4 border border-zinc-200">
        <Layers className="w-6 h-6 text-zinc-400" />
      </div>
      <h3 className="text-sm font-bold text-zinc-900 mb-1">Dynamic Context Panel</h3>
      <p className="text-xs text-zinc-400 max-w-[220px] leading-relaxed">
        As you converse, the AI will inject recommendations, side-by-side spec comparisons, and checkout sessions here.
      </p>
    </div>
  );
}
