// components/home/PerksList.tsx
import Image from "next/image";
import { PERKS } from "@/lib/mock-data";
import AnimatedBorder from "@/components/ui/AnimatedBorder";

export default function PerksList() {
  return (
    <section className="py-24 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif text-center mb-4">
          Perks you won&apos;t find anywhere else
        </h2>
        <p className="text-center text-foreground/70 mb-14 max-w-2xl mx-auto font-light">
          Every NOMA booking comes with exclusive benefits that elevate your
          travel experience.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {PERKS.map((perk) => (
            <div
              key={perk.title}
              className="relative group overflow-hidden min-h-[320px] flex flex-col justify-end p-8 border border-border/50"
            >
              <AnimatedBorder />
              
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={perk.imageUrl || "https://images.unsplash.com/photo-1502899576159-f224dc2349fa?w=600&h=400&fit=crop"}
                  alt={perk.title}
                  fill
                  className="object-cover transition-transform duration-700"
                />
                {/* Gradient Overlay for Text Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>
              
              {/* Content on top */}
              <div className="relative z-10 text-white">
                <h3 className="text-2xl font-serif mb-3">{perk.title}</h3>
                <p className="text-white/80 text-sm font-light leading-relaxed">
                  {perk.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}