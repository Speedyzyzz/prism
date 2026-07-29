"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChatStore, type ChatMessage } from "@/stores/chat-store";
import { ChatInput } from "@/components/chat/chat-input";
import { ThinkingStepper } from "@/components/chat/thinking-stepper";
import { EmptyState } from "@/components/workspace/empty-state";
import { messageBubble, fastTransition } from "@/lib/motion";
import { formatRelativeTime } from "@/lib/format";

export function ConversationPanel() {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const isThinking = useChatStore((s) => s.isThinking);
  const streamingText = useChatStore((s) => s.streamingText);
  const thinkingSteps = useChatStore((s) => s.thinkingSteps);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0;

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText, thinkingSteps]);

  const handleSend = (message: string, image?: string) => {
    sendMessage(message, image);
  };

  return (
    <div className="flex flex-col h-full bg-[#fafafa]/50">
      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <EmptyState onSuggestionClick={(text) => handleSend(text)} />
        ) : (
          <div className="max-w-[850px] mx-auto px-6 py-8 space-y-8">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>

            {/* Thinking Timeline (Cursor / Perplexity Style) */}
            {isThinking && thinkingSteps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={fastTransition}
                className="my-4"
              >
                <ThinkingStepper steps={thinkingSteps} />
              </motion.div>
            )}

            {/* Streaming Response */}
            {isStreaming && streamingText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start space-x-4 group"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-zinc-900">Prism AI</span>
                    <span className="text-[10px] text-orange-500 font-semibold uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-full">
                      Generating
                    </span>
                  </div>
                  <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 text-[15px] text-zinc-800 leading-relaxed shadow-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamingText}
                    </ReactMarkdown>
                    <span className="inline-block w-1.5 h-4 bg-orange-500 rounded-full ml-1 animate-pulse" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-zinc-200/60 bg-white/70 backdrop-blur-xl">
        <div className="max-w-[850px] mx-auto px-6 py-4">
          <ChatInput onSend={handleSend} isStreaming={isStreaming} />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      variants={messageBubble}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className={`flex items-start space-x-4 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
        isUser
          ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
          : "bg-zinc-900 text-white"
      }`}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Bubble Content & Timestamp */}
      <div className={`flex flex-col space-y-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div className="flex items-center space-x-2 px-1">
          <span className="text-[11px] font-semibold text-zinc-500">
            {isUser ? "You" : "Prism AI"}
          </span>
          <span className="text-[10px] text-zinc-400">
            {formatRelativeTime(new Date(message.timestamp))}
          </span>
        </div>

        <div className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
          isUser
            ? "bg-zinc-900 text-white rounded-2xl rounded-tr-sm font-medium"
            : "bg-white border border-zinc-200/80 text-zinc-800 rounded-2xl rounded-tl-sm"
        }`}>
          {message.image && (
            <div className="mb-3 rounded-xl overflow-hidden border border-white/10">
              <img src={message.image} alt="Uploaded attachment" className="max-w-full max-h-56 object-cover rounded-xl" />
            </div>
          )}
          {isUser ? (
            message.content
          ) : (
            <div className="prose prose-sm max-w-none text-zinc-800">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
