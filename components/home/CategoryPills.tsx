// components/home/CategoryPills.tsx
"use client";

import { CATEGORIES } from "@/lib/mock-data";
import { useState } from "react";
import Image from "next/image";
import { Bed, Map, Anchor, Binoculars, Heart, Compass, Sparkles, Users, Home, Plane, Ship, Utensils, Snowflake, Mountain } from "lucide-react";
import LogoLoop from "@/components/LogoLoop";

const TOP_HOTELS = [
  { node: <span className="font-serif text-xl tracking-[0.15em] font-semibold text-foreground/70 uppercase">Aman</span> },
  { node: <span className="font-serif text-xl tracking-widest font-light text-foreground/70 uppercase">Four Seasons</span> },
  { node: <span className="font-serif text-xl tracking-[0.2em] font-normal text-foreground/70 uppercase">Rosewood</span> },
  { node: <span className="font-serif text-xl tracking-widest font-medium text-foreground/70 uppercase">Belmond</span> },
  { node: <span className="font-serif text-xl tracking-[0.1em] font-semibold text-foreground/70 uppercase">Ritz-Carlton</span> },
];

const BOTTOM_HOTELS = [
  { node: <span className="font-serif text-xl tracking-[0.15em] font-light text-foreground/70 uppercase">Six Senses</span> },
  { node: <span className="font-serif text-xl tracking-widest font-medium text-foreground/70 uppercase">The Peninsula</span> },
  { node: <span className="font-serif text-xl tracking-[0.1em] font-semibold text-foreground/70 uppercase">Mandarin Oriental</span> },
  { node: <span className="font-serif text-xl tracking-[0.2em] font-normal text-foreground/70 uppercase">St. Regis</span> },
  { node: <span className="font-serif text-xl tracking-widest font-light text-foreground/70 uppercase">Waldorf Astoria</span> },
];

export default function CategoryPills() {
  const [activeIdx, setActiveIdx] = useState(0);

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case "Hotels": return <Bed className="w-5 h-5 opacity-70" />;
      case "Itineraries": return <Map className="w-5 h-5 opacity-70" />;
      case "Cruises": return <Anchor className="w-5 h-5 opacity-70" />;
      case "Safaris": return <Binoculars className="w-5 h-5 opacity-70" />;
      case "Honeymoons": return <Heart className="w-5 h-5 opacity-70" />;
      case "Adventure": return <Compass className="w-5 h-5 opacity-70" />;
      case "Wellness": return <Sparkles className="w-5 h-5 opacity-70" />;
      case "Family": return <Users className="w-5 h-5 opacity-70" />;
      case "Villas": return <Home className="w-5 h-5 opacity-70" />;
      case "Private Jets": return <Plane className="w-5 h-5 opacity-70" />;
      case "Yachts": return <Ship className="w-5 h-5 opacity-70" />;
      case "Culinary": return <Utensils className="w-5 h-5 opacity-70" />;
      case "Skiing": return <Snowflake className="w-5 h-5 opacity-70" />;
      case "Expeditions": return <Mountain className="w-5 h-5 opacity-70" />;
      default: return <Map className="w-5 h-5 opacity-70" />;
    }
  };

  return (
    <section className="py-24 px-4 md:px-8 bg-secondary">
      <h2 className="text-4xl md:text-5xl font-serif mb-12 text-center md:text-left">
        Explore by Category
      </h2>
      
      {/* Container swapped to handle mobile stacking (image first) */}
      <div className="flex flex-col md:grid md:grid-cols-2 gap-0 h-auto md:h-[700px] border border-border/50 bg-background">
        
        {/* Left Panel: Tags & Logos (Shifted below image on mobile) */}
        <div className="order-2 md:order-1 flex flex-col md:border-r border-border/50 h-auto md:h-full overflow-hidden">
          {/* Scrollable Categories Area (Shortened to ~30% height on mobile) */}
          <div className="h-[200px] md:h-auto md:flex-1 flex flex-col overflow-y-auto hide-scrollbar">
            {CATEGORIES.map((category, idx) => (
              <button
                key={category.name}
                onClick={() => setActiveIdx(idx)}
                className={`w-full flex items-center gap-4 px-6 md:px-8 py-5 md:py-6 text-left transition-all border-b border-border/50 last:border-b-0 shrink-0 ${
                  activeIdx === idx
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground hover:bg-muted"
                }`}
              >
                {getCategoryIcon(category.name)}
                <span className={`text-sm uppercase tracking-widest ${activeIdx === idx ? "font-semibold" : "font-normal"}`}>
                  {category.name}
                </span>
              </button>
            ))}
          </div>

          {/* Hotel Partner Logoloops Area */}
          <div className="shrink-0 flex flex-col gap-6 py-6 md:py-8 border-t border-border/50 bg-background z-10">
            <p className="text-[10px] uppercase tracking-widest text-foreground/50 font-bold px-6 md:px-8">Our Preferred Partners</p>
            <div className="flex flex-col gap-5">
              <LogoLoop logos={TOP_HOTELS} direction="left" speed={25} gap={48} logoHeight={24} />
              <LogoLoop logos={BOTTOM_HOTELS} direction="right" speed={25} gap={48} logoHeight={24} />
            </div>
          </div>
        </div>

        {/* Right Panel: Image Viewer (Shifted above tags on mobile) */}
        <div className="order-1 md:order-2 relative h-[300px] sm:h-[400px] md:h-full w-full overflow-hidden bg-muted flex items-center justify-center border-b md:border-b-0 border-border/50">
          {CATEGORIES.map((category, idx) => (
            <div
              key={category.name}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                activeIdx === idx ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {category.imageUrl ? (
                <>
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    priority={idx === 0}
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-10">
                    <h3 className="text-white text-3xl md:text-4xl font-serif tracking-wide">{category.name}</h3>
                  </div>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}