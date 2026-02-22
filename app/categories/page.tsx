// app/categories/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnimatedBorder from "@/components/ui/AnimatedBorder";
import { TRAVEL_STYLES } from "@/lib/page-data";

export const metadata: Metadata = {
  title: "Luxury Travel Styles & Categories | NOMA",
  description: "Browse NOMA's exclusive travel categories including private villas, yacht charters, wellness retreats, and epic expeditions tailored to your pace.",
};

export default function CategoriesPage() {
  return (
    <>
      <Header />
      <main className="bg-background">
        {/* Intro Section */}
        <section className="py-20 md:py-32 px-4 sm:px-8 text-center max-w-4xl mx-auto">
          <span className="text-primary uppercase tracking-widest text-xs font-bold mb-4 block">
            Curated Experiences
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-foreground mb-8">
            Travel tailored to your rhythm
          </h1>
          <p className="text-foreground/70 font-light text-base md:text-lg leading-relaxed">
            Whether you seek the absolute privacy of a secluded estate, the thrill of an uncharted expedition, or the restorative peace of a holistic wellness retreat, our advisors match you with experiences that resonate with your personal style.
          </p>
        </section>

        {/* Styles Grid - Alternating Layout for Desktop, Stacked for Mobile */}
        <section className="pb-24 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-8 md:gap-16">
          {TRAVEL_STYLES.map((style, index) => (
            <article 
              key={style.title} 
              className={`flex flex-col ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} bg-card border border-border/50 overflow-hidden group`}
            >
              {/* Image Container */}
              <div className="relative w-full md:w-1/2 min-h-[300px] md:min-h-[500px]">
                <AnimatedBorder />
                <Image
                  src={style.imageUrl}
                  alt={style.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Content Container */}
              <div className="w-full md:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
                <span className="text-muted-foreground text-xs uppercase tracking-widest mb-4">
                  Collection {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">
                  {style.title}
                </h2>
                <p className="text-foreground/70 font-light text-sm md:text-base leading-relaxed mb-8">
                  {style.description} Our deep industry connections ensure that you experience the very pinnacle of {style.title.toLowerCase()}, with exclusive access and VIP amenities.
                </p>
                <button className="bg-foreground text-background px-8 py-4 text-xs uppercase tracking-widest hover:bg-foreground/80 transition-colors w-fit">
                  View Collection
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}