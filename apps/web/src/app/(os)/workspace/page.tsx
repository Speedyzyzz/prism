"use client";

import React from "react";
import { ConversationPanel } from "@/components/workspace/conversation-panel";
import { ContextPanel } from "@/components/workspace/context-panel";
import { useChatStore } from "@/stores/chat-store";

/**
 * AI Workspace — The main product surface.
 *
 * Split layout:
 * - Left: Conversation Panel (chat, thinking, input)
 * - Right: Context Panel (morphs based on AI intent)
 *
 * When no generative UI is active, the conversation panel expands
 * to fill the workspace. When the AI returns products/comparisons/checkout,
 * the context panel slides in from the right.
 */
export default function WorkspacePage() {
  const contextPanelType = useChatStore((s) => s.contextPanelType);
  const hasContextPanel = contextPanelType !== null;

  return (
    <div className="flex h-full">
      {/* Conversation Panel — always present */}
      <div className={`flex-1 min-w-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        hasContextPanel ? "max-w-[55%]" : "max-w-full"
      }`}>
        <ConversationPanel />
      </div>

      {/* Context Panel — morphs based on intent */}
      {hasContextPanel && (
        <div className="w-[45%] flex-shrink-0">
          <ContextPanel />
        </div>
      )}
    </div>
  );
}
