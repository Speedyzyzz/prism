/** OmniShop OS — Chat Store (Zustand)
 *
 * Manages conversation state, streaming, thinking steps, and the
 * context panel type that drives the workspace paradigm.
 */
import { create } from "zustand";
import { sendChatMessageStream, type StreamEvent } from "@/lib/api-client";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  image?: string;
}

export type ContextPanelType =
  | "PRODUCT_CAROUSEL"
  | "PRODUCT_CARD"
  | "COMPARISON_MATRIX"
  | "STAGED_CHECKOUT"
  | "REASONING_BADGE"
  | "ORDER_TRACKER"
  | "SIZE_GUIDE"
  | null;

interface ChatStore {
  // Messages
  messages: ChatMessage[];
  activeSessionId: string;

  // Streaming state
  isStreaming: boolean;
  streamingText: string;

  // Thinking
  thinkingSteps: string[];
  isThinking: boolean;

  // Context Panel (the key innovation)
  contextPanelType: ContextPanelType;
  contextPanelData: any;

  // Tool calls
  toolCalls: any[];

  // Actions
  sendMessage: (message: string, image?: string) => void;
  setContextPanel: (type: ContextPanelType, data: any) => void;
  clearContextPanel: () => void;
  clearConversation: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  activeSessionId: typeof crypto !== "undefined" ? crypto.randomUUID() : "session-1",
  isStreaming: false,
  streamingText: "",
  thinkingSteps: [],
  isThinking: false,
  contextPanelType: null,
  contextPanelData: null,
  toolCalls: [],

  sendMessage: (message, image) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      timestamp: Date.now(),
      image,
    };

    set((s) => ({
      messages: [...s.messages, userMessage],
      isStreaming: true,
      isThinking: true,
      streamingText: "",
      thinkingSteps: [],
      toolCalls: [],
    }));

    let accumulatedText = "";

    sendChatMessageStream(
      message,
      get().activeSessionId,
      image,
      (event: StreamEvent) => {
        switch (event.type) {
          case "thinking":
            set((s) => ({
              thinkingSteps: [...s.thinkingSteps, event.data.step],
            }));
            break;

          case "text":
            accumulatedText += event.data.token;
            set({ streamingText: accumulatedText });
            break;

          case "generative_ui":
            set({
              contextPanelType: event.data.type as ContextPanelType,
              contextPanelData: event.data.data,
            });
            break;

          case "tool_call":
            set((s) => ({
              toolCalls: [...s.toolCalls, event.data],
            }));
            break;

          case "done":
            const assistantMessage: ChatMessage = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: accumulatedText,
              timestamp: Date.now(),
            };
            set((s) => ({
              messages: [...s.messages, assistantMessage],
              isStreaming: false,
              isThinking: false,
              streamingText: "",
            }));
            break;

          case "error":
            set({ isStreaming: false, isThinking: false });
            break;
        }
      }
    );
  },

  setContextPanel: (type, data) => set({ contextPanelType: type, contextPanelData: data }),
  clearContextPanel: () => set({ contextPanelType: null, contextPanelData: null }),
  clearConversation: () =>
    set({
      messages: [],
      thinkingSteps: [],
      streamingText: "",
      contextPanelType: null,
      contextPanelData: null,
      toolCalls: [],
      activeSessionId: crypto.randomUUID(),
    }),
}));
