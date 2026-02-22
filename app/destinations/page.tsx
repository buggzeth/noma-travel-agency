// app/destinations/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnimatedBorder from "@/components/ui/AnimatedBorder";
import { REGIONS } from "@/lib/page-data";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Luxury Travel Destinations | NOMA Travel Agency",
  description: "Explore NOMA's curated luxury travel destinations across Europe, Asia, Africa, and the Americas. Discover bespoke journeys crafted for the modern traveler.",
};

export default function DestinationsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pb-24">
        {/* Page Hero */}
        <section className="relative h-[50vh] min-h-[400px] w-full flex flex-col justify-center items-center text-center px-4 sm:px-8">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?q=80&w=2074&auto=format&fit=crop"
              alt="Beautiful coastal destination"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="text-white/80 uppercase tracking-widest text-xs font-semibold mb-4 block">
              Where to next?
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">
              Discover the World&apos;s Most Extraordinary Places
            </h1>
            <p className="text-white/80 font-light text-sm md:text-base max-w-xl mx-auto">
              From the untouched wilds of Patagonia to the sun-drenched coasts of the Mediterranean, find the perfect canvas for your next adventure.
            </p>
          </div>
        </section>

        {/* Regions Grid */}
        <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            {REGIONS.map((region) => (
              <article key={region.id} className="group relative overflow-hidden flex flex-col min-h-[450px] border border-border/50">
                <AnimatedBorder />
                <div className="absolute inset-0 z-0">
                  <Image
                    src={region.imageUrl}
                    alt={`${region.name} luxury travel`}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                
                <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-10">
                  <h2 className="text-3xl md:text-4xl font-serif text-white mb-3">
                    {region.name}
                  </h2>
                  <p className="text-white/80 font-light mb-6 text-sm md:text-base leading-relaxed">
                    {region.description}
                  </p>
                  <Link 
                    href={`/destinations/${region.id}`}
                    className="inline-flex items-center gap-2 text-white text-xs uppercase tracking-widest hover:gap-4 transition-all w-fit"
                  >
                    Explore Region <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}