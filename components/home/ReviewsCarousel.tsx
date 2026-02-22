// components/home/ReviewsCarousel.tsx
"use client";

import { REVIEWS } from "@/lib/mock-data";
import { MapPin, Quote } from "lucide-react";
import Image from "next/image";
import AnimatedBorder from "@/components/ui/AnimatedBorder";

export default function ReviewsCarousel() {
  return (
    <section className="py-24 bg-card">
      <h2 className="text-4xl md:text-5xl font-serif mb-4 px-8">
        What travelers are saying
      </h2>
      <p className="text-muted-foreground mb-10 px-8 max-w-2xl">
        Real stories from real travelers who booked with NOMA advisors.
      </p>
      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 px-8 pb-4">
        {REVIEWS.map((review) => (
          <div
            key={review.id}
            className="w-[85vw] max-w-[400px] h-[500px] snap-center md:snap-start flex-shrink-0 relative overflow-hidden group border border-border/50"
          >
            <AnimatedBorder />
            <Image
              src={review.imageUrl}
              alt={`Review from ${review.clientName}`}
              fill
              className="object-cover transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="absolute inset-0 flex flex-col justify-between p-8">
              <div>
                <Quote className="h-8 w-8 text-white/40 mb-4" />
                <p className="text-white leading-relaxed font-light text-lg">
                  "{review.quote}"
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-white/80 mb-2 uppercase tracking-wider">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{review.destination}</span>
                </div>
                <p className="font-semibold text-white tracking-wide">{review.clientName}</p>
                <p className="text-sm text-white/60 mt-1 font-light">
                  Advisor: {review.advisorName}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}