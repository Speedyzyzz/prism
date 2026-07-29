"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, X, Sparkles } from "lucide-react";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
}

export function VoiceModal({ isOpen, onClose, onTranscript }: VoiceModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsListening(true);
      setTranscriptText("Listening to voice prompt...");

      const timer1 = setTimeout(() => {
        setTranscriptText('"Find me a vegan leather jacket under $200"');
      }, 1500);

      const timer2 = setTimeout(() => {
        setIsListening(false);
      }, 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    onTranscript(transcriptText.replace(/"/g, ""));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="glass-card max-w-md w-full rounded-3xl p-6 border border-[#6366f1]/40 text-center relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#818cf8] p-1 mx-auto mb-4 shadow-xl shadow-indigo-500/30 relative">
          <div className="w-full h-full bg-[#09090b] rounded-full flex items-center justify-center">
            {isListening ? (
              <Mic className="w-8 h-8 text-[#818cf8] animate-pulse" />
            ) : (
              <MicOff className="w-8 h-8 text-zinc-400" />
            )}
          </div>
          {isListening && (
            <span className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" />
          )}
        </div>

        <h3 className="font-bold text-lg text-white mb-1">
          {isListening ? "Listening to Voice..." : "Voice Stream Captured"}
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Real-Time Multimodal Voice Pipeline
        </p>

        {/* Live Audio Waves Simulation */}
        {isListening && (
          <div className="flex items-center justify-center space-x-1 my-4 h-8">
            {[40, 80, 60, 100, 50, 90, 30, 70, 40].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-[#6366f1] rounded-full animate-bounce"
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-indigo-300 mb-5 min-h-[50px] flex items-center justify-center">
          {transcriptText}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-1/2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={handleSend}
            disabled={isListening}
            className="w-1/2 py-2.5 rounded-xl bg-[#6366f1] hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Send Voice Intent</span>
          </button>
        </div>
      </div>
    </div>
  );
}
