"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Compass, ImagePlus, ArrowLeftRight, ShoppingBag, Heart, Settings2, Building, Command } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { useRouter } from "next/navigation";

const commandItems = [
  { href: "/workspace", icon: <Sparkles />, label: "AI Workspace", desc: "Interactive conversational shopping" },
  { href: "/discover", icon: <Compass />, label: "Discover", desc: "AI-curated product feeds & masonry grid" },
  { href: "/visual-search", icon: <ImagePlus />, label: "Visual Search", desc: "Search catalog by uploading photo" },
  { href: "/compare", icon: <ArrowLeftRight />, label: "Compare", desc: "Side-by-side spec & feature comparison" },
  { href: "/cart", icon: <ShoppingBag />, label: "Cart & Staged Checkout", desc: "Review items and stage checkout" },
  { href: "/wishlist", icon: <Heart />, label: "Wishlist", desc: "Saved collections & price alerts" },
  { href: "/merchant", icon: <Building />, label: "Prism Merchant", desc: "Fraud center & review authenticity shield" },
  { href: "/settings", icon: <Settings2 />, label: "Settings", desc: "Preferences, brand choices & AI settings" },
];

export function CommandPalette() {
  const isOpen = useUIStore((s) => s.commandPaletteOpen);
  const toggle = useUIStore((s) => s.toggleCommandPalette);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Listen for ⌘K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && isOpen) {
        toggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, toggle]);

  const filteredItems = commandItems.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    toggle();
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="w-full max-w-xl bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Search Header */}
          <div className="flex items-center space-x-3 px-5 py-4 border-b border-zinc-100">
            <Search className="w-5 h-5 text-zinc-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands, pages, or ask AI..."
              className="flex-1 text-base bg-transparent border-none outline-none placeholder:text-zinc-400 text-zinc-900"
            />
            <kbd className="text-[10px] font-mono bg-zinc-100 text-zinc-400 px-2 py-1 rounded-md border border-zinc-200">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-[380px] overflow-y-auto p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Navigation & Workspaces
            </div>
            {filteredItems.map((item) => (
              <div
                key={item.href}
                onClick={() => handleSelect(item.href)}
                className="flex items-center space-x-3.5 px-3.5 py-3 rounded-2xl hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-zinc-100 group-hover:bg-white/10 flex items-center justify-center text-zinc-600 group-hover:text-white transition-colors">
                  {React.cloneElement(item.icon, { className: "w-4 h-4" })}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.label}</p>
                  <p className="text-xs text-zinc-400 group-hover:text-zinc-300 truncate">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400 font-medium">
            <div className="flex items-center space-x-2">
              <Command className="w-3.5 h-3.5" />
              <span>Prism Command Palette</span>
            </div>
            <span>Use ↑↓ to navigate, Enter to select</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
