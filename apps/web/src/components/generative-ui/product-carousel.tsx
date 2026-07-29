"use client";

import React from "react";
import { Star, ShoppingBag, ArrowLeftRight, Check } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cart-store";

interface Product {
  product_id?: string;
  id?: string;
  title: string;
  brand?: string;
  price: number;
  original_price?: number;
  rating_avg?: number;
  rating_count?: number;
  images?: string[];
  attributes?: Record<string, any>;
  recommendation_reasons?: string[];
}

interface ProductCarouselProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  onCompareSelect?: (product: Product) => void;
}

export function ProductCarousel({
  products,
  onAddToCart,
  onCompareSelect,
}: ProductCarouselProps) {
  const addItem = useCartStore((s) => s.addItem);

  if (!products || products.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Matched Catalog Items ({products.length})
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {products.map((product, idx) => {
          const pid = product.product_id || product.id || `p-${idx}`;
          const imgUrl =
            product.images && product.images[0]
              ? product.images[0]
              : "/images/jacket.png";

          const hasDiscount =
            product.original_price && product.original_price > product.price;

          const handleAdd = () => {
            if (onAddToCart) {
              onAddToCart(product);
            } else {
              addItem(pid);
            }
          };

          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              key={pid}
              className="group bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5"
            >
              {/* Product Thumbnail */}
              <div className="relative w-full sm:w-36 h-36 rounded-2xl bg-zinc-50 border border-zinc-100 flex-shrink-0 flex items-center justify-center p-3 overflow-hidden">
                <img
                  src={imgUrl}
                  alt={product.title}
                  onError={(e) => {
                    // Fallback to local asset if external CDN URL fails
                    const target = e.currentTarget;
                    if (target.src.includes("shoes") || product.title.toLowerCase().includes("shoe") || product.title.toLowerCase().includes("sneaker")) {
                      target.src = "/images/shoes.png";
                    } else if (target.src.includes("bag") || product.title.toLowerCase().includes("bag") || product.title.toLowerCase().includes("tote")) {
                      target.src = "/images/bag.png";
                    } else {
                      target.src = "/images/jacket.png";
                    }
                  }}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
                {product.brand && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-white shadow-sm z-10">
                    {product.brand}
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-base text-zinc-900 leading-snug group-hover:text-orange-600 transition-colors">
                      {product.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 mt-1 mb-3 text-xs text-zinc-500 font-medium">
                    <div className="flex items-center text-zinc-800 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                      <span>{product.rating_avg || 4.7}</span>
                      <span className="text-zinc-400 ml-1">({product.rating_count || 128})</span>
                    </div>
                    <span>&middot;</span>
                    <span className="capitalize">{product.attributes?.color || "Black"}</span>
                  </div>

                  {/* Personal Reasoning Checkmarks */}
                  <div className="space-y-1 my-2">
                    {(product.recommendation_reasons || [
                      "Matches your style preferences",
                      "Fits within your budget",
                    ]).map((reason, rIdx) => (
                      <div key={rIdx} className="flex items-center space-x-1.5 text-xs text-emerald-700 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-2">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-lg font-bold text-zinc-900 tracking-tight">
                      {formatPrice(product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-zinc-400 line-through">
                        {formatPrice(product.original_price!)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {onCompareSelect && (
                      <button
                        onClick={() => onCompareSelect(product)}
                        className="py-2 px-3 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-colors flex items-center space-x-1"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        <span>Compare</span>
                      </button>
                    )}
                    <button
                      onClick={handleAdd}
                      className="py-2 px-4 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
