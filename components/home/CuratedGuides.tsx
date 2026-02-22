// components/home/CuratedGuides.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { GUIDES } from "@/lib/mock-data";
import { useState, useMemo } from "react";
import { Compass, MapPin, Palmtree, Leaf, Heart, Sunrise } from "lucide-react";
import AnimatedBorder from "@/components/ui/AnimatedBorder";

export default function CuratedGuides() {
  const [activeTag, setActiveTag] = useState<string>("All");

  const tags = useMemo(() => {
    const allTags = Array.from(new Set(GUIDES.map((g) => g.tag)));
    return ["All", ...allTags];
  }, []);

  const filteredGuides = useMemo(() => {
    if (activeTag === "All") return GUIDES;
    return GUIDES.filter((g) => g.tag === activeTag);
  }, [activeTag]);

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case "All": return <Compass className="w-3.5 h-3.5" />;
      case "Beaches": return <Palmtree className="w-3.5 h-3.5" />;
      case "Nature Getaway": return <Leaf className="w-3.5 h-3.5" />;
      case "Honeymoons": return <Heart className="w-3.5 h-3.5" />;
      case "Arts and Culture": return <Sunrise className="w-3.5 h-3.5" />;
      default: return <MapPin className="w-3.5 h-3.5" />;
    }
  };

  return (
    <section className="py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 px-8 gap-8">
        <h2 className="text-4xl md:text-5xl font-serif tracking-tight">
          Curated Guides
        </h2>
        
        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-6 py-2 text-xs uppercase tracking-widest transition-colors border flex items-center gap-2 ${
                activeTag === tag
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-foreground border-border hover:bg-muted"
              }`}
            >
              {getTagIcon(tag)}
              <span>{tag}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-8 px-8 pb-4 min-h-[600px]">
        {filteredGuides.map((guide) => (
          <Link href={`/guides/${guide.slug}`} key={guide.id} className="group block w-[85vw] max-w-[400px] flex-shrink-0 snap-center md:snap-start">
            <article className="h-full flex flex-col">
              <div className="aspect-[4/5] w-full relative overflow-hidden mb-6 border border-border/50">
                <AnimatedBorder />
                <Image
                  src={guide.imageUrl}
                  alt={guide.title}
                  fill
                  className="object-cover transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-4 left-4 z-30">
                  <span className="bg-background/95 backdrop-blur-sm text-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 border border-border/20 shadow-sm flex items-center gap-1.5">
                    {getTagIcon(guide.tag)}
                    <span>{guide.tag}</span>
                  </span>
                </div>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                By {guide.author}
              </p>
              <h3 className="text-2xl font-serif group-hover:text-primary transition-colors">
                {guide.title}
              </h3>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}