"use client";

import React from "react";
import { OSSidebar } from "@/components/layout/os-sidebar";
import { OSHeader } from "@/components/layout/os-header";

export default function OSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa] landing-grid-bg text-zinc-900 flex w-full font-sans overflow-hidden selection:bg-orange-500 selection:text-white">
      {/* Noise Overlay */}
      <div className="landing-noise-overlay" />

      {/* Sidebar */}
      <OSSidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden relative z-10">
        <OSHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
