// app/plans/[slug]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";
import Image from "next/image";
import { DollarSign, Calendar, Check, Sparkles, Clock, Compass, Bed, Home, Ticket, Info } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BookingInterface from "@/components/plans/BookingInterface";
import AccommodationLinks from "@/components/plans/AccommodationLinks";
import TiqetsWidget from "@/components/plans/TiqetsWidget";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?q=80&w=2074&auto=format&fit=crop";

async function getCachedDestinationImage(destination: string) {
  const { data } = await supabase
    .from("destination_images")
    .select("image_url")
    .eq("destination", destination)
    .single();

  if (data?.image_url) return data.image_url;

  if (!process.env.UNSPLASH_ACCESS_KEY) return FALLBACK_IMAGE;

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        destination + " luxury travel landscape"
      )}&client_id=${process.env.UNSPLASH_ACCESS_KEY}&per_page=1&orientation=landscape`
    );

    if (!res.ok) return FALLBACK_IMAGE;

    const resData = await res.json();
    const url = resData.results?.[0]?.urls?.regular || FALLBACK_IMAGE;

    if (url !== FALLBACK_IMAGE) {
      await supabase.from("destination_images").upsert([{ destination, image_url: url }]);
    }

    return url;
  } catch (error) {
    console.error("Unsplash Fetch Error:", error);
    return FALLBACK_IMAGE;
  }
}

function getYouTubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// --- NEW HELPER: Build Dynamic Affiliate Links for Expedia & Vrbo ---
function buildAffiliateLinks(destination: string, departDate: string, returnDate: string) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "" : d.toISOString().split('T')[0];
  };

  const start = formatDate(departDate);
  const end = formatDate(returnDate);

  // Your specific PHG Campaign Reference ID
  const camref = "1011l425432";
  const encodedDest = encodeURIComponent(destination);

  // Construct URLs using standard search endpoints
  const expediaUrl = `https://www.expedia.com/Hotel-Search?destination=${encodedDest}&d1=${start}&startDate=${start}&d2=${end}&endDate=${end}&adults=2&camref=${camref}`;
  const vrboUrl = `https://www.vrbo.com/search?destination=${encodedDest}&d1=${start}&startDate=${start}&d2=${end}&endDate=${end}&adults=2&camref=${camref}`;

  return { expediaUrl, vrboUrl };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { data } = await supabase
    .from("travel_plans")
    .select("destination, plan_data")
    .eq("slug", resolvedParams.slug)
    .single();

  if (!data) return { title: "Plan Not Found | NOMA" };

  return {
    title: `${data.destination} Travel Plan & Itinerary | NOMA`,
    description: data.plan_data.summary,
    openGraph: {
      title: `${data.destination} - Curated NOMA Journey`,
      description: data.plan_data.summary,
      type: "article",
    },
  };
}

// --- NEW HELPER: Build TripAdvisor Search Deep Link ---
function getTripAdvisorLink(itemName: string, destination: string) {
  const query = encodeURIComponent(`${itemName} ${destination}`);
  const cid = "7891276"; // Your TripAdvisor CID
  return `https://www.tripadvisor.com/Search?q=${query}&cid=${cid}`;
}

// --- NEW HELPER: Sanitize & Build Search Strategy for Tiqets ---
function buildTiqetsSearchQueries(activityName: string, destination: string): string[] {
  // 1. Remove punctuation (hyphens, commas, quotes, etc.) and replace with spaces
  let cleanActivity = activityName.replace(/[^\w\s]/gi, ' ');

  // 2. Remove common AI itinerary verbs & stop words that confuse search engines
  // e.g., "Guided tour of the Colosseum" -> "Colosseum"
  const stopWords = /\b(visit|tour|guided|explore|experience|discover|the|a|an|of|in|at|and|to)\b/gi;
  cleanActivity = cleanActivity.replace(stopWords, ' ');

  // 3. Clean up extra spaces
  cleanActivity = cleanActivity.replace(/\s+/g, ' ').trim();

  // 4. Extract just the main destination city name (e.g., "Paris, France" -> "Paris")
  const cleanDestination = destination.split(',')[0].trim();

  // Return an array of query strategies, from most specific to broadest
  // We filter out anything too short to avoid overly generic or empty API queries
  return [
    `${cleanActivity} ${cleanDestination}`, // Attempt 1: e.g., "Louvre Museum Paris"
    cleanActivity,                          // Attempt 2: e.g., "Louvre Museum"
  ].filter(q => q.length > 3);
}

// --- UPDATED HELPER COMPONENT: Fetch specific activity from Tiqets ---
async function TiqetsActivityLink({ activityName, destination }: { activityName: string, destination: string }) {
  const PARTNER_ID = "noma-184635";
  const queries = buildTiqetsSearchQueries(activityName, destination);

  if (queries.length === 0) return null;

  try {
    let matchedProduct = null;

    // Execute our cascading search strategy
    for (const query of queries) {
      const res = await fetch(
        `https://api.tiqets.com/v2/products?query=${encodeURIComponent(query)}&page_size=1`,
        {
          headers: {
            "Authorization": `Token ${process.env.TIQETS_API_KEY}`,
            "User-Agent": "NOMA-Travel-App/1.0"
          },
          next: { revalidate: 86400 } // Cache results for 24h
        }
      );

      if (!res.ok) continue;

      const data = await res.json();

      if (data.products && data.products.length > 0) {
        matchedProduct = data.products[0];
        break; // Match found! Stop the loop
      }
    }

    if (!matchedProduct) return null;

    // Start with the product URL as our safe fallback
    let finalUrl = matchedProduct.product_url;

    // Attempt to "upgrade" to the parent Experience URL using venue.id
    if (matchedProduct.venue && matchedProduct.venue.id) {
      try {
        const expRes = await fetch(
          `https://api.tiqets.com/v2/experiences/${matchedProduct.venue.id}`,
          {
            headers: {
              "Authorization": `Token ${process.env.TIQETS_API_KEY}`,
              "User-Agent": "NOMA-Travel-App/1.0"
            },
            next: { revalidate: 86400 } // Cache results for 24h
          }
        );

        if (expRes.ok) {
          const expData = await expRes.json();
          if (expData.experience && expData.experience.experience_url) {
            finalUrl = expData.experience.experience_url;
          }
        }
      } catch (err) {
        // Silently ignore experience fetch errors; we'll just use the product_url fallback
        console.error("Failed to upgrade to experience URL:", err);
      }
    }

    // Safety check just in case the API returned nothing at all
    if (!finalUrl) return null;

    const separator = finalUrl.includes("?") ? "&" : "?";
    const affiliateUrl = `${finalUrl}${separator}partner=${PARTNER_ID}`;

    return (
      <div className="flex items-center gap-1.5">
        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-semibold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          Tickets ↗
        </a>

        {/* Tooltip Container */}
        <div className="relative group/tiqets-info flex items-center justify-center">
          <Info className="w-3.5 h-3.5 text-foreground/40 hover:text-primary transition-colors cursor-help" />

          {/* Tooltip Content */}
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-foreground text-background text-[10px] font-medium leading-relaxed p-2 rounded opacity-0 invisible group-hover/tiqets-info:opacity-100 group-hover/tiqets-info:visible transition-all duration-200 shadow-xl z-50 text-center pointer-events-none">
            Verify the activity details and location before booking

            {/* Tooltip Arrow pointing down */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-foreground" />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return null;
  }
}

export default async function TravelPlanPage({ params }: PageProps) {
  const resolvedParams = await params;

  const { data, error } = await supabase
    .from("travel_plans")
    .select("*")
    .eq("slug", resolvedParams.slug)
    .single();

  if (error || !data) {
    notFound();
  }

  const plan = data.plan_data;
  const imageUrl = await getCachedDestinationImage(plan.destination);
  const videoId = plan.youtubeUrl ? getYouTubeId(plan.youtubeUrl) : null;

  const writeDate = new Date(data.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { expediaUrl, vrboUrl } = buildAffiliateLinks(plan.destination, plan.departDate, plan.returnDate);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">

        <section className="relative h-[65vh] min-h-[500px] w-full flex flex-col justify-center items-center text-center px-4 md:px-6 pt-20 pb-20 mb-16">
          <div className="absolute inset-0 z-0">
            <Image
              src={imageUrl}
              alt={`${plan.destination} background`}
              fill
              className="object-cover"
              priority
            />
            <div
              className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none z-10"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />
            <div className="absolute inset-0 z-20 bg-black/40" />
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-background via-black/40 to-black/20" />
          </div>

          <div className="relative z-10 max-w-4xl w-full mx-auto flex flex-col items-center mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 text-white">
            <span className="text-[10px] font-semibold uppercase tracking-widest mb-4 block border border-white/30 px-3 py-1 bg-black/20 backdrop-blur-sm">
              Curated by NOMA AI
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif mb-4 md:mb-6 drop-shadow-lg line-clamp-2 md:line-clamp-none w-full px-2">
              {plan.destination}
            </h1>

            <p className="text-sm sm:text-base md:text-xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed mb-6 drop-shadow-md line-clamp-3 sm:line-clamp-4 md:line-clamp-none px-2">
              {plan.summary}
            </p>

            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-white/60 font-medium mb-6 md:mb-8">
              Crafted on: <time dateTime={data.created_at}>{writeDate}</time>
            </p>

            <div className="flex flex-wrap justify-center gap-3 md:gap-4 w-full px-4">
              <div className="flex items-center gap-1.5 md:gap-2 bg-black/30 backdrop-blur-md px-3 py-2 md:px-5 md:py-2.5 border border-white/20 max-w-full">
                <DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4 text-white shrink-0" />
                <span className="text-xs md:text-sm tracking-wide font-medium truncate">
                  {plan.estimatedCost}
                </span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 bg-black/30 backdrop-blur-md px-3 py-2 md:px-5 md:py-2.5 border border-white/20 max-w-full">
                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-white shrink-0" />
                <span className="text-xs md:text-sm tracking-wide font-medium truncate">
                  {plan.departDate && plan.returnDate
                    ? `${plan.departDate} — ${plan.returnDate}`
                    : `Ideal: ${plan.bestTimeToVisit}`}
                </span>
              </div>
            </div>

            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row w-full justify-center gap-4 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <a
                href={`/guide/${resolvedParams.slug}`}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 px-6 md:px-8 py-3 md:py-4 text-xs md:text-sm font-semibold uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl border border-primary/50"
              >
                <Compass className="w-5 h-5 shrink-0" />
                Open Interactive Guide
              </a>
            </div>
          </div>
        </section>

        <article className="max-w-4xl mx-auto px-6 relative z-20">

          {videoId && (
            <section className="mb-12 mt-8">
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-border/50 shadow-lg">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Source YouTube Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </section>
          )}

          {/* Accommodations */}
          <section className="mb-16 mt-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8 border-b border-border/50 pb-4">
              <h2 className="text-2xl md:text-3xl font-serif flex items-center gap-3">
                Where to Drop Your Bags
              </h2>

              <AccommodationLinks
                destination={plan.destination}
                departDate={plan.departDate}
                returnDate={plan.returnDate}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plan.accommodations.map((acc: any, idx: number) => (
                <div key={idx} className="border border-border/50 p-6 bg-background hover:border-foreground/30 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-3">
                    <h3 className="text-xl font-serif pr-4 line-clamp-2">{acc.tier || acc.name}</h3>
                    <span className="text-[10px] sm:text-xs bg-foreground text-background px-2 py-1 uppercase tracking-wider whitespace-nowrap shrink-0">
                      {acc.estimatedPricePerNight || acc.pricePerNight} / NIGHT
                    </span>
                  </div>
                  <p className="text-sm font-light text-foreground/70 mb-6 leading-relaxed line-clamp-4 md:line-clamp-none">
                    {acc.description}
                  </p>
                  {acc.amenities && acc.amenities.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-widest font-semibold text-foreground/50">Standout Perks</p>
                      <div className="flex flex-col gap-2">
                        {acc.amenities.map((amenity: string, i: number) => (
                          <span key={i} className="text-sm font-light text-foreground/90 flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{amenity}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </article>

        {/* TIQETS WIDGET BREAKOUT */}
        <div className="max-w-4xl mx-auto md:px-6 relative z-20">
          <TiqetsWidget destination={plan.destination} />
        </div>

        {/* Re-open article wrapper to restore padding for remaining content */}
        <article className="max-w-4xl mx-auto px-6 relative z-20">

          {/* Itinerary */}
          <section className="mb-16 mt-4">
            <h2 className="text-2xl md:text-3xl font-serif mb-8 border-b border-border/50 pb-4">The Agenda</h2>
            <div className="space-y-8">
              {plan.itinerary.map((day: any) => (
                <div key={day.day} className="flex flex-col md:flex-row gap-4 md:gap-12 relative group">
                  <div className="md:w-32 shrink-0 pt-1">
                    <span className="text-sm font-semibold uppercase tracking-widest text-primary">Day {day.day}</span>
                  </div>
                  <div className="flex-1 pb-8 border-b border-border/50 group-last:border-0 group-last:pb-0">
                    <h3 className="text-xl md:text-2xl font-serif mb-5 line-clamp-2">{day.title}</h3>

                    {day.activities && day.meals ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ACTIVITIES */}
                        <div className="lg:col-span-2 space-y-4">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 block">Activities</span>
                          <div className="space-y-4">
                            {day.activities.map((act: any, i: number) => (
                              <div key={i} className="bg-secondary/10 p-4 border border-border/30 group/act relative">
                                <div className="flex justify-between items-start gap-4 mb-2">
                                  <span className="font-serif text-lg leading-tight">{act.title}</span>
                                  <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-1 uppercase tracking-wider whitespace-nowrap shrink-0 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {act.estimatedTime}
                                  </span>
                                </div>
                                <p className="text-sm font-light leading-relaxed mb-3">{act.description}</p>

                                {/* Activity External Links */}
                                <div className="flex flex-wrap items-center gap-4 mt-1">
                                  <a
                                    href={getTripAdvisorLink(act.title, plan.destination)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors flex items-center gap-1"
                                  >
                                    TripAdvisor ↗
                                  </a>

                                  {/* Using Suspense allows NextJS to seamlessly stream in the Tiqets widget links once they load */}
                                  <Suspense fallback={<div className="w-20 h-3 animate-pulse bg-primary/10 rounded"></div>}>
                                    <TiqetsActivityLink activityName={act.title} destination={plan.destination} />
                                  </Suspense>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* DINING */}
                        <div className="space-y-4">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 block">Dining</span>
                          <div className="bg-secondary/10 p-4 border border-border/30 space-y-5">

                            <div>
                              <span className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 block mb-1">Breakfast</span>
                              <p className="text-sm font-light mb-1.5">{day.meals.breakfast}</p>
                              <a
                                href={getTripAdvisorLink(day.meals.breakfast, plan.destination)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50 hover:text-primary transition-colors flex items-center gap-1"
                              >
                                Read Reviews ↗
                              </a>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 block mb-1">Lunch</span>
                              <p className="text-sm font-light mb-1.5">{day.meals.lunch}</p>
                              <a
                                href={getTripAdvisorLink(day.meals.lunch, plan.destination)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50 hover:text-primary transition-colors flex items-center gap-1"
                              >
                                Read Reviews ↗
                              </a>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 block mb-1">Dinner</span>
                              <p className="text-sm font-light mb-1.5">{day.meals.dinner}</p>
                              <a
                                href={getTripAdvisorLink(day.meals.dinner, plan.destination)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50 hover:text-primary transition-colors flex items-center gap-1"
                              >
                                Read Reviews ↗
                              </a>
                            </div>

                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-secondary/10 p-4 border border-border/30">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 block mb-2">Morning</span>
                          <p className="text-sm font-light leading-relaxed">{day.morning}</p>
                        </div>
                        <div className="bg-secondary/10 p-4 border border-border/30">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 block mb-2">Afternoon</span>
                          <p className="text-sm font-light leading-relaxed">{day.afternoon}</p>
                        </div>
                        <div className="bg-secondary/10 p-4 border border-border/30">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 block mb-2">Evening</span>
                          <p className="text-sm font-light leading-relaxed">{day.evening}</p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Insider Tips */}
          <section className="bg-primary/5 border border-primary/20 p-8 md:p-10 mb-12">
            <h2 className="text-2xl font-serif mb-6 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary shrink-0" />
              Local Cheat Codes
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plan.insiderTips.map((tip: string, idx: number) => (
                <li key={idx} className="flex flex-col gap-2">
                  <div className="h-1 w-8 bg-primary/50 rounded-full mb-2 shrink-0" />
                  <span className="text-sm font-light leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </section>

        </article>
      </main>
      <Footer />
    </>
  );
}