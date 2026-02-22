// components/home/AdvisorCarousel.tsx
"use client";

import Image from "next/image";
import { Quote } from "lucide-react";
import { ADVISOR_STORIES } from "@/lib/mock-data";
import AnimatedBorder from "@/components/ui/AnimatedBorder";

export default function AdvisorCarousel() {
  return (
    <section className="py-24">
      <h2 className="text-4xl md:text-5xl font-serif mb-8 px-8">
        Discover the power of an Advisor
      </h2>
      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 px-8 pb-4">
        {ADVISOR_STORIES.map((story) => (
          <div
            key={story.id}
            className="w-[85vw] max-w-[400px] h-[500px] snap-center md:snap-start flex-shrink-0 relative overflow-hidden group border border-border/50"
          >
            <AnimatedBorder />
            <Image
              src={story.imageUrl}
              alt={`Story from ${story.advisorName}`}
              fill
              className="object-cover transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="absolute inset-0 flex flex-col justify-between p-8">
              <div>
                <Quote className="h-8 w-8 text-white/40 mb-4" />
                <p className="text-white leading-relaxed font-light text-lg">
                  &ldquo;{story.text}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Image
                  src={story.avatarUrl}
                  alt={story.advisorName}
                  width={40}
                  height={40}
                  className="rounded-full object-cover border border-white/20"
                />
                <div>
                  <p className="font-semibold text-white tracking-wide">{story.advisorName}</p>
                  <p className="text-xs text-white/60 uppercase tracking-wider">NOMA Advisor</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}