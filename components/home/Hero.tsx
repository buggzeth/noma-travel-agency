// components/home/Hero.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, MessageSquare, ArrowRight, MapPin, Video } from "lucide-react";
import { STATS } from "@/lib/mock-data";
import AIChatOverlay from "./AIChatOverlay";
import AITravelPlanOverlay from "./AITravelPlanOverlay";

export default function Hero() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");

  const [isPlanOverlayOpen, setIsPlanOverlayOpen] = useState(false);
  const [destinationInput, setDestinationInput] = useState("");
  const [submittedDestination, setSubmittedDestination] = useState("");

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationInput.trim()) return;

    setSubmittedDestination(destinationInput);
    setIsPlanOverlayOpen(true);
    setDestinationInput("");
  };

  return (
    <>
      {/* 
        Updates: 
        1. Changed min-h-[90vh] to h-[100dvh] sm:min-h-[90vh] to fit mobile viewports exactly.
        2. Reduced py-20 to py-8 sm:py-20 to reduce outer spacing on mobile.
      */}
      <section className="relative h-[100dvh] sm:min-h-[90vh] sm:h-auto flex flex-col items-center justify-center text-center px-4 sm:px-6 py-8 sm:py-20 w-full overflow-hidden">

        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
            className="w-full h-full object-cover"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto text-white px-2 sm:px-0 flex flex-col justify-center h-full sm:block">

          {/* 
            Updates: 
            1. text-4xl on mobile (was 5xl).
            2. mb-3 on mobile (was mb-6).
          */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif tracking-tight leading-[1.1] mb-3 sm:mb-6">
            Travel made
            <br />
            <span className="italic text-white/90">extraordinary</span>
          </h1>

          {/* 
            Updates:
            1. mb-6 on mobile (was mb-12).
          */}
          <p className="text-sm sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-6 sm:mb-12 font-light px-2 sm:px-0">
            NOMA connects you with expert travel advisors who craft bespoke
            journeys
          </p>

          {/* Central AI Plan Builder Input Box */}
          {/* Updates: mb-4 kept, padding inside form adjusted slightly */}
          <form
            onSubmit={handlePlanSubmit}
            className="w-full max-w-2xl mx-auto flex items-center bg-white/10 backdrop-blur-md border border-white/30 p-1 mb-4 shadow-2xl transition-all focus-within:bg-white/20 focus-within:border-white/60"
          >
            <div className="pl-1 sm:pl-2 pr-0 text-white/70 shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            {/* Updates: py-2.5 on mobile (was py-3) */}
            <input
              type="text"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              placeholder="Where to? (e.g. Kyoto, Japan)"
              className="flex-1 min-w-0 w-full bg-transparent px-2 py-2.5 sm:py-4 text-sm sm:text-base md:text-lg font-light text-white focus:outline-none placeholder:text-white/60 text-ellipsis"
            />
            <button
              type="submit"
              aria-label="Design Journey"
              className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-4 bg-white text-black text-xs uppercase tracking-widest hover:bg-white/90 transition-colors font-medium shrink-0"
            >
              <span className="hidden sm:inline">Design Journey</span>
              <ArrowRight className="h-5 w-5 sm:hidden" />
            </button>
          </form>

          {/* Action Buttons Below Input */}
          {/* 
            Updates: 
            1. mb-6 on mobile (was mb-16). 
            2. py-3 on mobile buttons (was py-4).
            3. Added 'VLOG AI' button.
          */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mb-6 sm:mb-16 w-full max-w-3xl mx-auto">
            <button
              onClick={() => setIsPlanOverlayOpen(true)}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 px-6 py-3 sm:py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 shadow-xl uppercase text-xs tracking-widest hover:bg-white/20 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Plan Trip
            </button>

            <Link
              href="/video-journey"
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 px-6 py-3 sm:py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 shadow-xl uppercase text-xs tracking-widest hover:bg-white/20 transition-colors"
            >
              <Video className="h-4 w-4" />
              VLOG AI
            </Link>

            <button
              onClick={() => setIsChatOpen(true)}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 px-6 py-3 sm:py-4 bg-white text-black border border-white shadow-xl uppercase text-xs tracking-widest hover:bg-white/90 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Ask Concierge
            </button>
          </div>

          {/* Stats Bar */}
          {/* Updates: pt-4 on mobile (was pt-8) */}
          <div className="flex flex-row justify-center items-start gap-4 sm:gap-8 md:gap-16 pt-4 sm:pt-8 border-t border-white/20 w-full">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center flex-1 sm:flex-none">
                <p className="text-xl sm:text-3xl md:text-4xl font-serif">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest text-white/70 mt-1 sm:mt-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Structured Travel Plan Generator Overlay */}
      <AITravelPlanOverlay
        isOpen={isPlanOverlayOpen}
        onClose={() => setIsPlanOverlayOpen(false)}
        initialDestination={submittedDestination}
        clearInitialDestination={() => setSubmittedDestination("")}
      />

      {/* Classic Chat Overlay */}
      <AIChatOverlay
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialMessage={initialMessage}
        clearInitialMessage={() => setInitialMessage("")}
      />
    </>
  );
}