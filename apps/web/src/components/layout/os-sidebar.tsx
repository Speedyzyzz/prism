"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  Compass,
  ImagePlus,
  ArrowLeftRight,
  Heart,
  ShoppingBag,
  PackageCheck,
  Building,
  Settings2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";
import { sidebarTransition } from "@/lib/motion";

export function PrismLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 2 22 22 22" className="text-zinc-900 fill-zinc-900/10" />
      <line x1="12" y1="2" x2="16" y2="22" className="stroke-orange-500" />
      <line x1="12" y1="2" x2="8" y2="22" className="stroke-amber-400" />
    </svg>
  );
}

const navSections = [
  {
    title: "AI & DISCOVERY",
    items: [
      { href: "/workspace", icon: <Sparkles className="w-[18px] h-[18px]" />, label: "AI Workspace" },
      { href: "/discover", icon: <Compass className="w-[18px] h-[18px]" />, label: "Discover" },
      { href: "/visual-search", icon: <ImagePlus className="w-[18px] h-[18px]" />, label: "Visual Search" },
      { href: "/compare", icon: <ArrowLeftRight className="w-[18px] h-[18px]" />, label: "Compare" },
    ],
  },
  {
    title: "SHOPPING",
    items: [
      { href: "/wishlist", icon: <Heart className="w-[18px] h-[18px]" />, label: "Wishlist" },
      { href: "/cart", icon: <ShoppingBag className="w-[18px] h-[18px]" />, label: "Cart", badge: true },
      { href: "/orders", icon: <PackageCheck className="w-[18px] h-[18px]" />, label: "Orders" },
    ],
  },
  {
    title: "MERCHANT",
    items: [
      { href: "/merchant", icon: <Building className="w-[18px] h-[18px]" />, label: "Prism Merchant" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { href: "/settings", icon: <Settings2 className="w-[18px] h-[18px]" />, label: "Settings" },
    ],
  },
];

export function OSSidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const cartItemCount = useCartStore((s) => s.itemCount);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={sidebarTransition}
      className="h-screen bg-white/70 backdrop-blur-2xl border-r border-zinc-200/60 flex flex-col flex-shrink-0 relative z-20 select-none overflow-hidden"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-100 flex-shrink-0">
        <Link href="/workspace" className="flex items-center space-x-3 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center flex-shrink-0 shadow-sm">
            <PrismLogo className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-[16px] tracking-tight text-zinc-900"
            >
              Prism
            </motion.span>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="w-7 h-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors flex-shrink-0"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {sidebarOpen && (
              <p className="px-3 text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-2">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-2xl text-[13px] font-medium transition-all ${
                    isActive
                      ? "bg-zinc-900 text-white shadow-sm font-semibold"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80"
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {sidebarOpen && item.badge && cartItemCount > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-zinc-100 flex-shrink-0">
        <div className="flex items-center space-x-3 px-2 py-2 rounded-2xl hover:bg-zinc-100/80 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 via-amber-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
            JD
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 truncate">John Doe</p>
              <p className="text-[11px] text-zinc-400 truncate">john@prism.ai</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
