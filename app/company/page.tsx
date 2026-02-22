// app/company/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { TEAM_MEMBERS } from "@/lib/page-data";

export const metadata: Metadata = {
  title: "About NOMA | The Modern Luxury Travel Agency",
  description: "Learn about NOMA's mission to redefine luxury travel. Meet our team of expert advisors dedicated to crafting your perfect journey.",
};

export default function CompanyPage() {
  return (
    <>
      <Header />
      <main className="bg-background">
        
        {/* Story Section */}
        <section className="py-20 md:py-32 px-4 sm:px-8 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-serif mb-8">
            Redefining Modern Luxury Travel
          </h1>
          <div className="space-y-6 text-foreground/80 font-light text-base md:text-lg leading-relaxed text-left md:text-center">
            <p>
              Founded on the belief that time is your most precious asset, NOMA was created to strip away the friction of travel planning. We don&apos;t just book trips; we architect seamless, unforgettable life experiences.
            </p>
            <p>
              In an era of algorithmic recommendations and endless online noise, true luxury is human expertise. Our advisors possess deep, firsthand knowledge of the globe and cultivate personal relationships with hoteliers and guides everywhere.
            </p>
          </div>
        </section>

        {/* Large Aesthetic Break Image */}
        <div className="w-full h-[40vh] md:h-[60vh] relative border-y border-border/50">
          <Image
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop"
            alt="Pristine beach landscape"
            fill
            className="object-cover"
          />
        </div>

        {/* Team Section */}
        <section className="py-24 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Meet the Experts</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto font-light">
              Our global team of advisors are tastemakers and logistics masters.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.name} className="group flex flex-col text-center">
                <div className="relative w-full aspect-[4/5] overflow-hidden mb-6 border border-border/50 bg-muted">
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale hover:grayscale-0"
                  />
                </div>
                <h3 className="font-serif text-2xl mb-1">{member.name}</h3>
                <p className="text-xs uppercase tracking-widest text-primary font-semibold">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-foreground text-background py-24 px-4 sm:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-serif mb-8 max-w-2xl mx-auto">
            Ready to experience the NOMA standard?
          </h2>
          <button className="bg-background text-foreground px-8 py-4 text-xs uppercase tracking-widest hover:bg-muted transition-colors">
            Connect with an Advisor
          </button>
        </section>
      </main>
      <Footer />
    </>
  );
}