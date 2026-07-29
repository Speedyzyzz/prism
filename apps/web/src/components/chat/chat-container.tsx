"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Compass, CheckCircle2, ChevronRight, LayoutGrid, Bookmark, FileStack, Settings2, FileText, MousePointerClick, MessageSquare, Search } from "lucide-react";
import { ChatInput } from "./chat-input";
import { ThinkingStepper } from "./thinking-stepper";
import { VoiceModal } from "./voice-modal";
import { ProductCarousel } from "../generative-ui/product-carousel";
import { ComparisonMatrix } from "../generative-ui/comparison-matrix";
import { StagedCheckout } from "../generative-ui/staged-checkout";
import { sendChatMessageStream, API_BASE_URL } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  thinkingSteps?: string[];
  generativeUi?: any;
}

interface ChatContainerProps {
  onCartChange?: (count: number) => void;
}

const EmptyStateCards = [
  {
    icon: <LayoutGrid className="w-5 h-5 text-orange-500" />,
    title: "Create short links & bio pages",
    desc: "Create branded short links and professional bio pages in seconds.",
    stats: "♡ 3 ⚡ 5"
  },
  {
    icon: <BarChartIcon />,
    title: "Analyze your link performance",
    desc: "Track clicks, visitors, and engagement with real-time analytics.",
    stats: "♡ 1 ⚡ 4"
  },
  {
    icon: <Sparkles className="w-5 h-5 text-orange-500" />,
    title: "Suggest improvements",
    desc: "Get AI-powered recommendations to improve reach and conversions.",
    stats: "♡ 1 ⚡ 4"
  },
  {
    icon: <MousePointerClick className="w-5 h-5 text-orange-500" />,
    title: "Generate UTM campaigns",
    desc: "Create accurate UTM parameters to track your marketing campaigns.",
    stats: "♡ 1 ⚡ 18"
  }
];

function BarChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-orange-500">
      <path d="M12 20V10"/>
      <path d="M18 20V4"/>
      <path d="M6 20v-4"/>
    </svg>
  );
}

export function ChatContainer({ onCartChange }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [sessionId] = useState(() => `sess_${Math.random().toString(36).substring(7)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string, imageUrl?: string) => {
    const userMsgId = `usr_${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      content: text,
      imageUrl,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const assistantMsgId = `ast_${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      thinkingSteps: [],
    };

    setMessages((prev) => [...prev, assistantMessage]);

    let textBuffer = "";
    let thinkingBuffer: string[] = [];
    let uiBuffer: any = null;

    await sendChatMessageStream(text, sessionId, imageUrl, (event) => {
      if (event.type === "thinking") {
        if (event.data?.step) {
          thinkingBuffer = [...thinkingBuffer, event.data.step];
        }
      } else if (event.type === "text") {
        if (event.data?.token) {
          textBuffer += event.data.token;
        }
      } else if (event.type === "generative_ui") {
        uiBuffer = event.data;
        if (uiBuffer?.type === "STAGED_CHECKOUT") {
          onCartChange?.(1);
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content: textBuffer,
                thinkingSteps: thinkingBuffer,
                generativeUi: uiBuffer,
              }
            : msg
        )
      );
    });

    setIsLoading(false);
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full w-full bg-white relative overflow-y-auto">
        {/* Top Spacer */}
        <div className="h-12" />

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center w-full px-4 mb-8">
          <div className="animated-logo mb-10 mt-6">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium text-zinc-900 tracking-tight mb-2">
            <strong>Hello,</strong> How can I help?
          </h1>
        </div>

        {/* Chat Composer */}
        <div className="w-full px-4 mb-8 z-10">
          <ChatInput
            onSend={(text: string) => handleSend(text)}
            isStreaming={isLoading}
          />
        </div>

        {/* Suggestion Cards Container */}
        <div className="max-w-[900px] mx-auto w-full px-4 pb-20">
          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-between mb-6 border-b border-zinc-100 pb-2 gap-4">
            <div className="flex items-center space-x-6 text-sm font-semibold">
              <button className="text-zinc-900 border-b-2 border-zinc-900 pb-2 -mb-[9px]">All Items</button>
              <button className="text-zinc-400 hover:text-zinc-900 pb-2 -mb-[9px] transition-colors">Saved Items</button>
              <button className="text-zinc-400 hover:text-zinc-900 pb-2 -mb-[9px] transition-colors">My Templates</button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-zinc-50">
                <Search className="w-3.5 h-3.5" />
              </button>
              <button className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-zinc-50">
                <Settings2 className="w-3.5 h-3.5" />
              </button>
              <button className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-zinc-50">
                <span className="mb-2">...</span>
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EmptyStateCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.4 }}
                className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between min-h-[160px]"
                onClick={() => handleSend(card.title)}
              >
                <div>
                  <div className="mb-3">
                    {card.icon}
                  </div>
                  <h3 className="font-bold text-sm text-zinc-900 mb-1 leading-tight">{card.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{card.desc}</p>
                </div>
                <div className="mt-4 text-[10px] font-medium text-zinc-400">
                  {card.stats}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] max-w-[900px] mx-auto w-full px-4 sm:px-8 py-6 bg-white">
      {/* Scrollable Message List */}
      <div className="flex-1 overflow-y-auto space-y-8 pr-2 no-scrollbar pb-10">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`flex items-start space-x-4 ${
                msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                  msg.role === "user"
                    ? "bg-zinc-100 border-zinc-200 text-zinc-600"
                    : "bg-orange-500 border-orange-400 text-white shadow-sm"
                }`}
              >
                {msg.role === "user" ? (
                  <span className="text-xs font-bold font-mono">YOU</span>
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              {/* Content Bubble */}
              <div
                className={`max-w-[85%] rounded-3xl p-5 text-[15px] leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-tr-sm"
                    : "bg-transparent text-zinc-800 rounded-tl-sm border border-transparent"
                }`}
              >
                {/* User Attached Image */}
                {msg.imageUrl && (
                  <div className="mb-4 max-w-sm rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
                    <img
                      src={msg.imageUrl}
                      alt="Uploaded Inspiration"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                {/* Thinking Stepper */}
                {msg.thinkingSteps && msg.thinkingSteps.length > 0 && (
                  <ThinkingStepper steps={msg.thinkingSteps} />
                )}

                {/* Text Output with Markdown */}
                {msg.content && (
                  <div className="prose prose-zinc prose-p:leading-relaxed prose-pre:bg-zinc-50 prose-pre:border prose-pre:border-zinc-200 prose-pre:rounded-xl max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Generative UI Components */}
                {msg.generativeUi && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="mt-6"
                  >
                    {msg.generativeUi.type === "PRODUCT_CAROUSEL" && (
                      <ProductCarousel
                        products={msg.generativeUi.data?.products || []}
                        onAddToCart={(p) =>
                          handleSend(
                            `Add ${p.title} to cart and apply loyalty discount`
                          )
                        }
                        onCompareSelect={(p) =>
                          handleSend(`Compare ${p.title} with option 2`)
                        }
                      />
                    )}

                    {msg.generativeUi.type === "COMPARISON_MATRIX" && (
                      <ComparisonMatrix
                        products={msg.generativeUi.data?.products || []}
                        comparison_matrix={
                          msg.generativeUi.data?.comparison_matrix
                        }
                        highlights={msg.generativeUi.data?.highlights}
                      />
                    )}

                    {msg.generativeUi.type === "STAGED_CHECKOUT" && (
                      <StagedCheckout
                        cart={msg.generativeUi.data?.cart}
                        estimated_tax={msg.generativeUi.data?.estimated_tax}
                        shipping_options={
                          msg.generativeUi.data?.shipping_options
                        }
                        final_total={msg.generativeUi.data?.final_total}
                        onConfirmOrder={() => onCartChange?.(0)}
                      />
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Bar */}
      <div className="pt-2 pb-6 w-full">
        <ChatInput
          onSend={(text: string) => handleSend(text)}
          isStreaming={isLoading}
        />
      </div>

      {/* Voice Modal */}
      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onTranscript={(text) => handleSend(text)}
      />
    </div>
  );
}
