"use client";

import React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Search, 
  ImagePlus,
  ArrowLeftRight, 
  ShoppingBag, 
  Building,
  Settings2,
  LifeBuoy,
  FileText,
  Briefcase
} from "lucide-react";

export function WorkspaceSidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: any) => void }) {
  // Ideally activeTab should be managed via next/navigation usePathname
  // but keeping props signature for compatibility with other layout consumers if any.

  return (
    <Sidebar className="border-r border-zinc-200 bg-white/70 backdrop-blur-xl">
      <SidebarHeader className="p-5 flex flex-row items-center space-x-3 border-b border-transparent">
        <div className="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center">
          <LayoutDashboard className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg text-zinc-900 tracking-tight">
          OmniShop OS
        </span>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {/* Ask AI Agent */}
        <div className="mt-4 mb-2">
          <Link href="/workspace">
            <button 
              className={`w-full flex items-center p-3 rounded-xl transition-all font-semibold text-sm shadow-sm border ${
                activeTab === "customer" 
                  ? "bg-white border-zinc-200 text-zinc-900" 
                  : "bg-transparent border-transparent text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center mr-3 ${activeTab === 'customer' ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                <SparklesIcon />
              </div>
              AI Workspace
            </button>
          </Link>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-400 text-xs font-semibold px-2 mb-1">Shopping Ecosystem</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <MenuItem href="/discover" icon={<Search />} label="Discover" />
              <MenuItem href="/visual-search" icon={<ImagePlus />} label="Visual Search" />
              <MenuItem href="/compare" icon={<ArrowLeftRight />} label="Compare" />
              <MenuItem href="/cart" icon={<ShoppingBag />} label="Cart" />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-400 text-xs font-semibold px-2 mt-4 mb-1 flex items-center justify-between">
            <span>Merchant & Admin</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <MenuItem href="/merchant" icon={<Building />} label="Prism Merchant" />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-400 text-xs font-semibold px-2 mt-4 mb-1 flex items-center justify-between">
            <span>System</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <MenuItem href="/settings" icon={<Settings2 />} label="Settings" />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 shadow-sm">
          <div className="text-xs font-bold text-zinc-900 mb-3 flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-white border border-zinc-200 flex items-center justify-center">
              <span className="text-[10px]">💡</span>
            </div>
            <span>Need Help?</span>
          </div>
          <div className="space-y-1">
            <ResourceItem icon={<LifeBuoy />} label="Help Center" />
            <ResourceItem icon={<FileText />} label="Documentation" />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function MenuItem({ href, icon, label, isActive }: { href: string, icon: React.ReactNode, label: string, isActive?: boolean }) {
  return (
    <SidebarMenuItem>
      <Link href={href} className="w-full">
        <SidebarMenuButton 
          isActive={isActive}
          className={`hover:bg-zinc-100 hover:text-zinc-900 text-zinc-600 transition-colors h-9 px-3 rounded-lg flex items-center font-medium text-[13px] ${
            isActive ? "bg-zinc-100 text-zinc-900 font-semibold" : ""
          }`}
        >
          {React.cloneElement(icon as React.ReactElement, { className: "w-[18px] h-[18px] mr-2 opacity-70" })}
          <span>{label}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}

function ResourceItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center space-x-2 text-[13px] text-zinc-600 hover:text-zinc-900 cursor-pointer p-1.5 rounded-lg hover:bg-white transition-colors font-medium">
      {React.cloneElement(icon as React.ReactElement, { className: "w-[15px] h-[15px]" })}
      <span>{label}</span>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}
