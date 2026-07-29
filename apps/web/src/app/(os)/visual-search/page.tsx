"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ImagePlus, Sparkles, ArrowRight } from "lucide-react";
import { useChatStore } from "@/stores/chat-store";
import { useRouter } from "next/navigation";

const sampleImages = [
  { label: "Biker Jacket", src: "/images/jacket.png" },
  { label: "Runner Sneaker", src: "/images/shoes.png" },
  { label: "Leather Tote", src: "/images/bag.png" },
  { label: "ANC Headphones", src: "/images/headphones.png" },
  { label: "Smart Watch", src: "/images/watch.png" },
  { label: "Sunglasses", src: "/images/sunglasses.png" },
];

export default function VisualSearchPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const router = useRouter();

  const handleSearchWithImage = (src: string) => {
    setSelectedImage(src);
    setTimeout(() => {
      sendMessage("Find products visually similar to this image", src);
      router.push("/workspace");
    }, 600);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleSearchWithImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full h-full p-8 flex flex-col items-center justify-center max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        className="w-full flex flex-col items-center justify-center"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-3">Visual Search</h1>
          <p className="text-zinc-500 text-base max-w-md mx-auto">
            Powered by Prism Vision & SigLIP embeddings. Drag & drop an image or select a preset to search the catalog visually.
          </p>
        </div>

        {/* Hidden HTML File Input */}
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileSelect} 
        />

        {/* Drag & Drop Zone */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          className={`w-full h-[320px] rounded-[2.5rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden mb-8 shadow-sm ${
            isDragging
              ? "border-orange-500 bg-orange-50/50 scale-[1.01]"
              : "border-zinc-300 bg-white/60 backdrop-blur-md hover:bg-zinc-50 hover:border-zinc-400"
          }`}
        >
          {selectedImage ? (
            <div className="flex flex-col items-center justify-center">
              <img src={selectedImage} alt="Selected" className="w-40 h-40 object-contain mb-4 animate-pulse" />
              <span className="text-sm font-bold text-orange-500 flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Analyzing Prism Vision Embeddings...</span>
              </span>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                <ImagePlus className="w-7 h-7 text-zinc-400" />
              </div>
              <span className="text-lg font-semibold text-zinc-900">Drag & Drop an image</span>
              <span className="text-xs text-zinc-400 mt-1">or click to browse local files</span>
            </>
          )}
        </div>

        {/* Preset Sample Images */}
        <div className="w-full">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4 text-center">
            Or try a demo product image
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {sampleImages.map((img, i) => (
              <div
                key={i}
                onClick={() => handleSearchWithImage(img.src)}
                className="bg-white border border-zinc-200 rounded-2xl p-3 flex flex-col items-center hover:border-orange-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <img src={img.src} alt={img.label} className="w-16 h-16 object-contain mb-2 group-hover:scale-105 transition-transform" />
                <span className="text-[11px] font-semibold text-zinc-800 truncate w-full text-center">{img.label}</span>
                <span className="text-[9px] text-orange-500 font-medium flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Search</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
