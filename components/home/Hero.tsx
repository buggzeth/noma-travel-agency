// components/home/Hero.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import { STATS } from "@/lib/mock-data";
import AIChatOverlay from "./AIChatOverlay";

export default function Hero() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [heroInput, setHeroInput] = useState("");
  const [initialMessage, setInitialMessage] = useState("");

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroInput.trim()) return;
    
    // Pass the input string to the chat overlay
    setInitialMessage(heroInput);
    setIsChatOpen(true);
    setHeroInput(""); // clear the hero input
  };

  return (
    <>
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 py-20 w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
            alt="Luxury travel destination"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto text-white mt-8 sm:mt-16 px-2 sm:px-0">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif tracking-tight leading-[1.1] mb-6">
            Travel made
            <br />
            <span className="italic text-white/90">extraordinary</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12 font-light px-2 sm:px-0">
            NOMA connects you with expert travel advisors who craft bespoke
            journeys — unlocking VIP perks, insider access, and unforgettable
            experiences.
          </p>

          {/* Central AI Chat Input Box */}
          <form 
            onSubmit={handleHeroSubmit}
            className="w-full max-w-2xl mx-auto flex items-center bg-white/10 backdrop-blur-md border border-white/30 p-1 mb-16 shadow-2xl transition-all focus-within:bg-white/20 focus-within:border-white/60"
          >
            <div className="pl-3 sm:pl-4 pr-2 text-white/70 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={heroInput}
              onChange={(e) => setHeroInput(e.target.value)}
              placeholder="Ask the Concierge where to go next..."
              className="flex-1 min-w-0 w-full bg-transparent px-2 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-light text-white focus:outline-none placeholder:text-white/60 text-ellipsis"
            />
            <button
              type="submit"
              aria-label="Consult Concierge"
              className="flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-white text-black text-xs uppercase tracking-widest hover:bg-white/90 transition-colors font-medium shrink-0"
            >
              <span className="hidden sm:inline">Consult</span>
              <ArrowRight className="h-5 w-5 sm:hidden" />
            </button>
          </form>

          {/* Stats Bar */}
          <div className="flex flex-row justify-center items-start gap-4 sm:gap-8 md:gap-16 pt-8 border-t border-white/20 w-full">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center flex-1 sm:flex-none">
                <p className="text-2xl sm:text-3xl md:text-4xl font-serif">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest text-white/70 mt-1 sm:mt-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Bottom Right Button */}
        <button
          onClick={() => setIsChatOpen(true)}
          className={`fixed bottom-6 right-6 z-40 bg-foreground text-background border border-border/50 shadow-2xl flex items-center gap-3 px-6 py-4 uppercase text-xs tracking-widest hover:bg-foreground/90 transition-transform duration-500 ${
            isChatOpen ? "translate-y-24 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Ask Concierge
        </button>
      </section>

      {/* Full Screen Chat Overlay */}
      <AIChatOverlay
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialMessage={initialMessage}
        clearInitialMessage={() => setInitialMessage("")}
      />
    </>
  );
}