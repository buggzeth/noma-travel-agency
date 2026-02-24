// app/plans/[slug]/page.tsx
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";
import { DollarSign, Calendar, Check, Sparkles, MapPin } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. Dynamically Generate SEO Metadata
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

// 2. Main Page Component
export default async function TravelPlanPage({ params }: PageProps) {
  const resolvedParams = await params;
  
  // Fetch data from Supabase
  const { data, error } = await supabase
    .from("travel_plans")
    .select("*")
    .eq("slug", resolvedParams.slug)
    .single();

  if (error || !data) {
    notFound();
  }

  const plan = data.plan_data;
  
  // Format the creation date
  const writeDate = new Date(data.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-24 pb-20">
        <article className="max-w-4xl mx-auto px-6">
          
          {/* Top Article Metadata */}
          <div className="flex flex-col items-center justify-center text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-4 block border border-primary/30 px-3 py-1 bg-primary/5">
              Curated by NOMA AI
            </span>
            <h1 className="text-5xl md:text-6xl font-serif mb-6">{plan.destination}</h1>
            <p className="text-lg md:text-xl font-light text-foreground/80 max-w-2xl mx-auto leading-relaxed mb-6">
              {plan.summary}
            </p>
            
            {/* Written Date */}
            <p className="text-xs uppercase tracking-widest text-foreground/50 font-medium mb-8">
              Article written on: <time dateTime={data.created_at}>{writeDate}</time>
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-secondary/30 px-5 py-2.5 border border-border/50">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm tracking-wide font-medium">{plan.estimatedCost}</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary/30 px-5 py-2.5 border border-border/50">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm tracking-wide font-medium">Ideal Time: {plan.bestTimeToVisit}</span>
              </div>
            </div>
          </div>

          {/* Accommodations */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif mb-8 flex items-center gap-3 border-b border-border/50 pb-4">
              Where to Drop Your Bags
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plan.accommodations.map((acc: any, idx: number) => (
                <div key={idx} className="border border-border/50 p-6 bg-card hover:border-foreground/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-serif pr-4">{acc.name}</h3>
                    <span className="text-xs bg-foreground text-background px-2 py-1 uppercase tracking-wider whitespace-nowrap">{acc.pricePerNight}</span>
                  </div>
                  <p className="text-sm font-light text-foreground/70 mb-6 leading-relaxed">{acc.description}</p>
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-foreground/50">Standout Perks</p>
                    <div className="flex flex-col gap-2">
                      {acc.amenities.map((amenity: string, i: number) => (
                        <span key={i} className="text-sm font-light text-foreground/90 flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5"/> 
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Itinerary */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif mb-8 border-b border-border/50 pb-4">The Agenda</h2>
            <div className="space-y-8">
              {plan.itinerary.map((day: any) => (
                <div key={day.day} className="flex flex-col md:flex-row gap-4 md:gap-12 relative group">
                  <div className="md:w-32 shrink-0 pt-1">
                    <span className="text-sm font-semibold uppercase tracking-widest text-primary">Day {day.day}</span>
                  </div>
                  <div className="flex-1 pb-8 border-b border-border/50 group-last:border-0 group-last:pb-0">
                    <h3 className="text-xl md:text-2xl font-serif mb-5">{day.title}</h3>
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
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Insider Tips */}
          <section className="bg-primary/5 border border-primary/20 p-8 md:p-10">
            <h2 className="text-2xl font-serif mb-6 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              Local Cheat Codes
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plan.insiderTips.map((tip: string, idx: number) => (
                <li key={idx} className="flex flex-col gap-2">
                  <div className="h-1 w-8 bg-primary/50 rounded-full mb-2" />
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