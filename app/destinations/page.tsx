// app/destinations/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowRight, MapPin, CalendarDays, Wallet } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Curated Journeys | NOMA Travel Agency",
  description: "Explore a dynamic catalogue of bespoke luxury travel itineraries crafted by NOMA's AI Journey Architect.",
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?q=80&w=2074&auto=format&fit=crop";

async function fetchImageFromUnsplash(destination: string) {
  if (!process.env.UNSPLASH_ACCESS_KEY) return FALLBACK_IMAGE;

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        destination + " luxury travel landscape"
      )}&client_id=${process.env.UNSPLASH_ACCESS_KEY}&per_page=1&orientation=landscape`
    );

    if (!res.ok) return FALLBACK_IMAGE;

    const data = await res.json();
    return data.results?.[0]?.urls?.regular || FALLBACK_IMAGE;
  } catch (error) {
    console.error("Unsplash Fetch Error:", error);
    return FALLBACK_IMAGE;
  }
}

export default async function DestinationsPage() {
  const { data: plans, error } = await supabase
    .from("travel_plans")
    .select("slug, destination, plan_data, created_at")
    .order("created_at", { ascending: false });

  let plansWithImages: any[] = [];

  if (plans && plans.length > 0) {
    const uniqueDestinations = Array.from(new Set(plans.map((p) => p.destination)));

    const { data: cachedImages } = await supabase
      .from("destination_images")
      .select("destination, image_url")
      .in("destination", uniqueDestinations);

    const imageMap = new Map(cachedImages?.map((c) => [c.destination, c.image_url]));
    const missingDestinations = uniqueDestinations.filter((d) => !imageMap.has(d));

    if (missingDestinations.length > 0) {
      const newImageRecords = await Promise.all(
        missingDestinations.map(async (dest) => {
          const url = await fetchImageFromUnsplash(dest);
          return { destination: dest, image_url: url };
        })
      );

      if (newImageRecords.length > 0) {
        await supabase.from("destination_images").upsert(newImageRecords);
        newImageRecords.forEach((record) => imageMap.set(record.destination, record.image_url));
      }
    }

    plansWithImages = plans.map((plan) => ({
      ...plan,
      imageUrl: imageMap.get(plan.destination) || FALLBACK_IMAGE,
    }));
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pb-24">
        {/* Page Hero */}
        <section className="relative h-[50vh] min-h-[400px] w-full flex flex-col justify-center items-center text-center px-4 sm:px-8">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
              alt="Discover the world"
              fill
              className="object-cover"
              priority
            />
            {/* Pure Black Film Grain Overlay */}
            <div
              className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none z-10"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />
            <div className="absolute inset-0 z-20 bg-black/50" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto mt-12">
            <span className="text-white/80 uppercase tracking-widest text-xs font-semibold mb-4 block animate-in fade-in slide-in-from-bottom-4 duration-700">
              The NOMA Anthology
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Curated Escapes
            </h1>
            <p className="text-white/80 font-light text-sm md:text-base max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
              Browse our gallery of bespoke itineraries. Each journey below was uniquely crafted by our AI concierge, tailored for the modern luxury traveler.
            </p>
          </div>
        </section>

        {/* Dynamic Catalogue Grid */}
        <section className="py-20 px-4 sm:px-8 max-w-[90rem] mx-auto">
          {error || plansWithImages.length === 0 ? (
            <div className="text-center py-24 border border-border/50 bg-card max-w-2xl mx-auto">
              <h2 className="text-2xl font-serif mb-4">No Journeys Found</h2>
              <p className="text-foreground/60 font-light mb-8 max-w-md mx-auto">
                Our archive is currently empty. Be the first to generate a stunning luxury itinerary using our Journey Architect.
              </p>
              <Link
                href="/"
                className="inline-flex bg-primary text-primary-foreground px-8 py-3 uppercase tracking-widest text-xs font-medium hover:bg-primary/90 transition-colors shadow-md"
              >
                Start Crafting
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {plansWithImages.map((plan) => {
                const pd = plan.plan_data;
                const daysCount = pd?.itinerary?.length || 0;

                return (
                  <Link
                    key={plan.slug}
                    href={`/plans/${plan.slug}`}
                    className="group relative flex flex-col aspect-[4/5] md:aspect-square overflow-hidden border border-border/50 bg-black shadow-sm hover:shadow-2xl transition-all duration-500"
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={plan.imageUrl}
                        alt={`${plan.destination} travel plan`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-1000 opacity-90"
                      />
                      {/* Pure Black Film Grain Overlay */}
                      <div
                        className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none z-10"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                      />
                      {/* Dual-layer dark gradient for perfect text readability */}
                      <div className="absolute inset-0 z-20 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />
                      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/95 via-black/1 to-black/0" />
                    </div>

                    {/* Content Layer */}
                    <div className="relative z-10 flex flex-col h-full p-6 md:p-8 text-white justify-end">

                      {/* Top Badges */}
                      <div className="absolute top-6 left-6 flex flex-col gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold bg-white/10 text-white border border-white/20 px-3 py-1.5 backdrop-blur-md">
                          <MapPin className="w-3 h-3 text-white/80" />
                          {plan.destination}
                        </span>
                      </div>

                      <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                        <h2 className="text-2xl md:text-3xl font-serif mb-3 line-clamp-2 leading-tight drop-shadow-md">
                          {plan.destination} Escape
                        </h2>

                        <p className="text-white/80 font-light mb-6 text-sm leading-relaxed line-clamp-2 md:line-clamp-3">
                          {pd?.summary}
                        </p>

                        {/* Footer Info Row */}
                        <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 mb-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-white/60 uppercase tracking-widest font-semibold flex items-center gap-1">
                              <Wallet className="w-3 h-3" /> Budget
                            </span>
                            <span className="text-sm font-medium truncate drop-shadow-sm">
                              {pd?.estimatedCost || "Moderate"}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1 text-right items-end">
                            <span className="text-[10px] text-white/60 uppercase tracking-widest font-semibold flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" /> Duration
                            </span>
                            <span className="text-sm font-medium drop-shadow-sm">
                              {daysCount} Days
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Call to action arrow */}
                      <div className="mt-4 flex items-center justify-between text-white/90 text-xs uppercase tracking-widest font-semibold overflow-hidden">
                        <span className="opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
                          Explore Plan
                        </span>
                        <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </div>

                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}