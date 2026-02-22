// components/home/Hero.tsx
import Link from "next/link";
import Image from "next/image";
import { STATS } from "@/lib/mock-data";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center text-center px-4 sm:px-6 py-20 w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
          alt="Luxury travel destination"
          fill
          className="object-cover"
          priority
        />
        {/* Dark gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto text-white mt-8 sm:mt-16 px-2 sm:px-0">
        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif tracking-tight leading-[1.1] mb-6">
          Travel made
          <br />
          <span className="italic text-white/90">extraordinary</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 font-light px-2 sm:px-0">
          NOMA connects you with expert travel advisors who craft bespoke
          journeys — unlocking VIP perks, insider access, and unforgettable
          experiences.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-xs sm:max-w-none mx-auto">
          <Link
            href="#"
            className="w-full sm:w-auto text-center bg-primary text-primary-foreground px-6 py-4 sm:px-8 text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
          >
            Plan Your Trip
          </Link>
          <Link
            href="#"
            className="w-full sm:w-auto text-center border border-white/50 bg-black/20 backdrop-blur-sm text-white px-6 py-4 sm:px-8 text-sm uppercase tracking-widest hover:bg-white/10 transition-colors"
          >
            Meet Advisors
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-row justify-center items-start gap-4 sm:gap-8 md:gap-16 mt-16 sm:mt-20 pt-8 border-t border-white/20 w-full">
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
    </section>
  );
}