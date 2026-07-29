"use client";

import React from "react";
import { Search, Bell, Sun, Moon, UserPlus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { HoverMember } from "@/components/v1/skiper6";

interface WorkspaceHeaderProps {
  cartCount: number;
  backendConnected: boolean;
}

const teamMembers = [
  { name: "Azmir", image: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
];

export function WorkspaceHeader({
  cartCount,
  backendConnected,
}: WorkspaceHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white px-4 py-3 flex items-center justify-between">
      {/* Left side: Trigger & Breadcrumbs */}
      <div className="flex items-center space-x-4 flex-1">
        <SidebarTrigger className="text-zinc-500 hover:text-zinc-900" />
        
        <div className="hidden md:flex items-center space-x-2 text-sm font-medium">
          <span className="text-zinc-400">Home</span>
          <span className="text-zinc-300">/</span>
          <span className="text-zinc-900 font-bold">Ask AI Agent</span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full bg-zinc-50 border-zinc-200 pl-9 pr-12 text-sm text-zinc-900 focus-visible:ring-orange-500 rounded-full h-9 shadow-sm"
          />
          <div className="absolute right-3 top-2.5 flex items-center text-zinc-400 text-xs font-mono">
            ⌘/
          </div>
        </div>
      </div>

      {/* Right Side: Actions */}
      <div className="flex items-center space-x-3 flex-1 justify-end">
        
        {/* Invite Button */}
        <button className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 shadow-sm transition-colors">
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite</span>
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 transition-colors relative">
          <Bell className="w-4 h-4 fill-current" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 border-2 border-white"></span>
        </button>

        {/* Theme Toggle */}
        <div className="flex items-center space-x-1 bg-zinc-50 p-1 rounded-full border border-zinc-200">
          <button className="p-1 rounded-full bg-white shadow-sm text-zinc-900">
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 transition-colors">
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Profile (using user's Skiper6 snippet style) */}
        <div className="pl-1">
          <HoverMember teamMembers={teamMembers} />
        </div>
      </div>
    </header>
  );
}
