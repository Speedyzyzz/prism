"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Database, Layers, Sparkles, ImagePlus, ShoppingBag, Fingerprint } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PrismLogo } from "@/components/layout/os-sidebar";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const container = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    gsap.from(".nav-pill", { y: -50, opacity: 0, duration: 1, ease: "power4.out", delay: 0.2 });
    gsap.from(".hero-text", { y: 60, opacity: 0, duration: 1.2, stagger: 0.15, ease: "power4.out", delay: 0.4 });
    gsap.from(".hero-btn", { y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: "power4.out", delay: 0.8 });
    gsap.from(".trusted-by", { y: 40, opacity: 0, duration: 1.2, ease: "power4.out", delay: 1 });

    gsap.from(".feature-card", {
      scrollTrigger: { trigger: ".features-section", start: "top 75%" },
      y: 50, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power3.out"
    });

    gsap.from(".visual-search-text", {
      scrollTrigger: { trigger: ".visual-search-section", start: "top 70%" },
      x: -50, opacity: 0, duration: 1, ease: "power3.out"
    });

    gsap.from(".visual-search-image", {
      scrollTrigger: { trigger: ".visual-search-section", start: "top 70%" },
      x: 50, opacity: 0, duration: 1, ease: "power3.out"
    });

    gsap.from(".bottom-cta", {
      scrollTrigger: { trigger: ".bottom-cta-section", start: "top 80%" },
      scale: 0.9, opacity: 0, duration: 1, ease: "power4.out"
    });
  }, { scope: container });

  return (
    <div ref={container} className="relative bg-[#fafafa] landing-grid-bg font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white overflow-x-clip min-h-screen">
      {/* Noise Overlay */}
      <div className="landing-noise-overlay" />

      {/* Fluid Island Navbar */}
      <nav className="nav-pill fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-3 py-2 bg-white/70 backdrop-blur-2xl border border-zinc-200/50 shadow-sm rounded-full w-[90%] max-w-[900px]">
        <div className="flex items-center space-x-2 pl-4 pr-6">
          <div className="w-7 h-7 rounded-xl bg-zinc-900 flex items-center justify-center">
            <PrismLogo className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[16px] tracking-tight text-zinc-900">Prism</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-[13px] font-semibold text-zinc-500">
          <a href="#features" className="hover:text-zinc-900 transition-colors">Features</a>
          <a href="#visual-search" className="hover:text-zinc-900 transition-colors">Visual Search</a>
          <a href="#" className="hover:text-zinc-900 transition-colors">Pricing</a>
        </div>
        <div className="flex-shrink-0">
          <Link href="/workspace">
            <button className="bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-semibold px-5 py-2.5 rounded-full transition-colors shadow-sm">
              Launch Prism
            </button>
          </Link>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="relative pt-[22vh] pb-32 px-4 flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-[1000px] text-center mb-8 relative z-10">
          <span className="hero-text text-xs font-bold uppercase tracking-[0.25em] text-orange-500 bg-orange-50 border border-orange-200/60 px-4 py-1.5 rounded-full mb-6 inline-block">
            Introducing Prism AI
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight leading-[1.05] text-zinc-900 hero-text">
            Shopping, Reimagined <br className="hidden md:block" />
            Through Intelligence<span className="text-orange-500">.</span>
          </h1>
        </div>
        <p className="hero-text max-w-[620px] text-center text-[17px] leading-relaxed text-zinc-500 font-medium mb-12 relative z-10">
          Describe what you want, upload an image, compare products, and complete checkout—all through one intelligent conversation.
        </p>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 relative z-10">
          <Link href="/workspace">
            <button className="hero-btn group relative flex items-center justify-center bg-zinc-900 text-white font-semibold text-[15px] pl-6 pr-2 py-2 rounded-full hover:scale-[0.98] transition-all duration-300 shadow-xl shadow-zinc-900/20 active:scale-[0.95]">
              <span className="mr-4">Enter Prism Workspace</span>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="w-4 h-4 text-white" />
              </div>
            </button>
          </Link>
        </div>
      </main>

      {/* Trusted By Banner */}
      <section className="trusted-by w-full py-16 bg-white/50 backdrop-blur-sm border-y border-zinc-200/50 flex flex-col items-center justify-center relative z-10">
        <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400 mb-8">
          Trusted By Industry Leaders
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 px-4 opacity-70 grayscale">
          <div className="flex items-center space-x-2"><Database className="w-6 h-6 text-zinc-700" /><span className="text-xl font-bold tracking-tight text-zinc-700">Galileo</span></div>
          <div className="flex items-center space-x-2"><Layers className="w-6 h-6 text-zinc-700" /><span className="text-xl font-bold tracking-tight text-zinc-700">Layers</span></div>
          <div className="flex items-center space-x-2"><Sparkles className="w-6 h-6 text-zinc-700" /><span className="text-xl font-bold tracking-tight text-zinc-700">Capsule</span></div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="features-section relative w-full max-w-6xl mx-auto px-6 py-32 z-10">
        <div className="text-left mb-24 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 mb-6 leading-[1.1]">Where conversation becomes commerce.</h2>
          <p className="text-lg text-zinc-500">Stop clicking through disconnected pages. Prism is the interface, dynamically generating the exact UI you need, when you need it.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
          <div className="feature-card">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center mb-6">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-[17px] font-semibold tracking-tight text-zinc-900 mb-3">Generative UI</h3>
            <p className="text-zinc-500 leading-relaxed text-[15px]">Product cards, comparisons, and checkout flows are generated on the fly inside your conversation.</p>
          </div>
          
          <div className="feature-card">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center mb-6">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-[17px] font-semibold tracking-tight text-zinc-900 mb-3">Agentic Checkout</h3>
            <p className="text-zinc-500 leading-relaxed text-[15px]">Say "buy it" and Prism stages your cart, calculates tax, and prepares shipping options instantly.</p>
          </div>

          <div className="feature-card">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center mb-6">
              <Fingerprint className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-[17px] font-semibold tracking-tight text-zinc-900 mb-3">Prism Merchant Shield</h3>
            <p className="text-zinc-500 leading-relaxed text-[15px]">Built-in AI models analyze return fraud risks and verify review authenticity automatically.</p>
          </div>
        </div>
      </section>

      {/* Visual Search Section */}
      <section id="visual-search" className="visual-search-section relative w-full overflow-hidden bg-zinc-900 text-white py-32 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="visual-search-text flex-1">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <ImagePlus className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">See it. Snap it. Buy it.</h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8 max-w-md">
              Powered by SigLIP vector embeddings. Upload any photo, and Prism Vision will extract style, color, and fit to find matching items.
            </p>
          </div>
          <div className="visual-search-image flex-1 relative">
            <div className="aspect-[4/3] bg-zinc-800 rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl p-8">
              <div className="w-full h-full border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center bg-white/5">
                <ImagePlus className="w-10 h-10 text-white/40 mb-3" />
                <span className="text-sm font-medium text-white/60">Drop image here to search with Prism Vision</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bottom-cta-section relative w-full py-40 flex items-center justify-center z-10 px-4">
        <div className="bottom-cta text-center">
          <h2 className="text-5xl font-medium tracking-tight text-zinc-900 mb-8">Ready to upgrade?</h2>
          <Link href="/workspace">
            <button className="bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold px-8 py-4 rounded-full transition-all shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 flex items-center mx-auto">
              <span className="mr-2">Enter Prism Workspace</span>
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200/50 bg-white/50 backdrop-blur-md py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center">
              <PrismLogo className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-zinc-900">Prism</span>
          </div>
          <p className="text-xs text-zinc-400 font-medium">Powered by Prism AI Intelligence</p>
        </div>
      </footer>
    </div>
  );
}
