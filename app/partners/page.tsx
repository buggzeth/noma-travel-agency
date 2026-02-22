// app/partners/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PARTNER_PERKS } from "@/lib/page-data";
import { Star, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Preferred Hotel & Travel Partners | NOMA",
  description: "NOMA partners with the world's most exclusive luxury hotel brands including Aman, Four Seasons, and Rosewood to guarantee VIP perks and upgrades for our clients.",
};

export default function PartnersPage() {
  return (
    <>
      <Header />
      <main className="bg-background pb-24">
        {/* Header */}
        <section className="bg-secondary py-20 px-4 sm:px-8 border-b border-border">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-serif text-foreground mb-6">
              The Company We Keep
            </h1>
            <p className="text-foreground/70 font-light text-base md:text-lg">
              Through our invitation-only memberships with elite hotel programs, NOMA clients are instantly recognized as VIPs across the globe.
            </p>
          </div>
        </section>

        {/* Perks Section */}
        <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">The NOMA Advantage</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto font-light">
              Booking through a NOMA advisor unlocks complimentary amenities that you simply cannot get by booking online.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PARTNER_PERKS.map((perk) => (
              <div key={perk.title} className="p-8 border border-border/50 bg-card hover:bg-muted transition-colors text-center flex flex-col items-center">
                <Star className="w-6 h-6 text-primary mb-4" />
                <h3 className="font-serif text-xl mb-3">{perk.title}</h3>
                <p className="text-sm font-light text-muted-foreground">{perk.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Program Spotlight */}
        <section className="px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="relative overflow-hidden border border-border/50 min-h-[500px] flex items-center">
            <div className="absolute inset-0 z-0 md:w-1/2">
              <Image
                src="https://images.unsplash.com/photo-1733253956603-a417ec11cc77?q=80"
                alt="Luxury resort suite"
                fill
                className="object-cover"
              />
            </div>
            
            {/* Dark overlay for mobile to ensure text readability */}
            <div className="absolute inset-0 bg-black/70 md:hidden z-10" />
            
            <div className="relative z-20 w-full md:w-1/2 md:ml-auto p-8 sm:p-12 lg:p-20 flex flex-col justify-center bg-transparent md:bg-background h-full">
              <h2 className="text-3xl md:text-4xl font-serif text-white md:text-foreground mb-6">
                Virtuoso & Beyond
              </h2>
              <p className="text-white/80 md:text-foreground/70 font-light mb-8 leading-relaxed">
                As an affiliate of the industry&apos;s most prestigious consortia, our influence extends to over 2,000 of the world&apos;s best luxury hotels, cruise lines, and tour operators. Your NOMA advisor is your direct line to general managers worldwide.
              </p>
              <ul className="space-y-4 mb-8">
                {['Four Seasons Preferred Partner', 'Rosewood Elite', 'Belmond Bellini Club', 'Marriott STARS & Luminous'].map(program => (
                  <li key={program} className="flex items-center gap-3 text-white md:text-foreground text-sm font-medium tracking-wide">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> {program}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}