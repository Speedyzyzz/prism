"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, PanelLeft, Cpu } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { CommandPalette } from "@/components/layout/command-palette";

const routeNames: Record<string, string> = {
  "/workspace": "AI Workspace",
  "/discover": "Discover",
  "/visual-search": "Visual Search",
  "/compare": "Compare",
  "/cart": "Cart",
  "/checkout": "Checkout",
  "/orders": "Orders",
  "/wishlist": "Wishlist",
  "/merchant": "Prism Merchant",
  "/settings": "Settings",
  "/profile": "Profile",
};

export function OSHeader() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);

  const currentRoute = routeNames[pathname] || "Prism";

  return (
    <>
      <header className="h-14 flex-shrink-0 flex items-center justify-between px-5 border-b border-zinc-200/60 bg-white/60 backdrop-blur-xl relative z-10">
        {/* Left: breadcrumbs */}
        <div className="flex items-center space-x-3">
          {!sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors mr-1"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
          <nav className="flex items-center text-sm">
            <span className="text-zinc-400 font-medium">Home</span>
            <span className="text-zinc-300 mx-2">/</span>
            <span className="text-zinc-900 font-semibold">{currentRoute}</span>
          </nav>
        </div>

        {/* Center: search & ⌘K trigger */}
        <button
          onClick={toggleCommandPalette}
          className="hidden md:flex items-center space-x-3 px-4 py-2 bg-zinc-100/80 border border-zinc-200/50 rounded-full text-zinc-400 text-[13px] font-medium hover:bg-zinc-100 transition-colors min-w-[280px]"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1 text-left">Search anything...</span>
          <kbd className="text-[10px] bg-white border border-zinc-200 rounded px-1.5 py-0.5 font-mono text-zinc-400">⌘K</kbd>
        </button>

        {/* Right: AI Engine Status & Avatar */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LangGraph Agentic Engine &middot; Active</span>
          </div>

          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full" />
          </button>
          
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer shadow-sm">
            JD
          </div>
        </div>
      </header>

      {/* ⌘K Command Palette Modal */}
      <CommandPalette />
    </>
  );
}
