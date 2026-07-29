"use client";

import React, { useState, useRef } from "react";
import { ArrowUp, Paperclip, Mic, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface ChatInputProps {
  onSend: (message: string, image?: string) => void;
  isStreaming?: boolean;
}

export function ChatInput({ onSend, isStreaming }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-white transition-all duration-200 shadow-sm",
        isDragOver ? "border-orange-400 ring-2 ring-orange-100" : "border-zinc-200 hover:border-zinc-300",
        isStreaming && "opacity-60 pointer-events-none"
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragOver(false); }}
    >
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about products, compare items, or upload an image..."
        rows={1}
        className="w-full resize-none bg-transparent px-4 pt-3.5 pb-12 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none leading-relaxed"
      />

      {/* Bottom Bar */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
        {/* Left tools */}
        <div className="flex items-center space-x-1">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
            <Paperclip className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* Right: send */}
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isStreaming}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
            input.trim()
              ? "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm"
              : "bg-zinc-100 text-zinc-400"
          )}
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
