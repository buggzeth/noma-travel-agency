// components/guide/tabs/TodayTab.tsx
import { MapPin, Clock, Utensils } from "lucide-react";
import { TravelPlan } from "../../home/AITravelPlanOverlay";

export default function TodayTab({ plan }: { plan: TravelPlan }) {
    const todayItinerary = plan.itinerary?.[0];

    const isNewFormat = !!(todayItinerary?.activities && todayItinerary?.meals);

    // Build a chronological event list for the new format
    const timelineEvents: any[] = [];
    if (isNewFormat && todayItinerary) {
        if (todayItinerary.meals?.breakfast) {
            timelineEvents.push({ type: 'meal', label: 'Breakfast', desc: todayItinerary.meals.breakfast, meta: todayItinerary.location_metadata?.meals?.breakfast });
        }
        if (todayItinerary.activities?.[0]) {
            timelineEvents.push({ type: 'activity', label: todayItinerary.activities[0].title, desc: todayItinerary.activities[0].description, time: todayItinerary.activities[0].estimatedTime, meta: todayItinerary.location_metadata?.activities?.[0] });
        }
        if (todayItinerary.meals?.lunch) {
            timelineEvents.push({ type: 'meal', label: 'Lunch', desc: todayItinerary.meals.lunch, meta: todayItinerary.location_metadata?.meals?.lunch });
        }
        if (todayItinerary.activities?.[1]) {
            timelineEvents.push({ type: 'activity', label: todayItinerary.activities[1].title, desc: todayItinerary.activities[1].description, time: todayItinerary.activities[1].estimatedTime, meta: todayItinerary.location_metadata?.activities?.[1] });
        }
        if (todayItinerary.activities?.[2]) {
            timelineEvents.push({ type: 'activity', label: todayItinerary.activities[2].title, desc: todayItinerary.activities[2].description, time: todayItinerary.activities[2].estimatedTime, meta: todayItinerary.location_metadata?.activities?.[2] });
        }
        if (todayItinerary.meals?.dinner) {
            timelineEvents.push({ type: 'meal', label: 'Dinner', desc: todayItinerary.meals.dinner, meta: todayItinerary.location_metadata?.meals?.dinner });
        }
    }

    return (
        <div className="h-full w-full overflow-y-auto hide-scrollbar p-8 pb-12 animate-in fade-in duration-500">
            <header className="pt-8 mb-12">
                <span className="bg-foreground text-background text-[9px] px-4 py-1.5 uppercase tracking-[0.2em] font-bold">
                    Active Journey
                </span>
                <h2 className="text-5xl font-serif mt-8 text-foreground">Day {todayItinerary?.day || 1}</h2>
                <p className="text-muted-foreground mt-4 flex items-center gap-2 font-light tracking-wide">
                    <MapPin className="w-4 h-4 text-primary" /> {plan.destination}
                </p>
            </header>

            <div className="relative pl-8 border-l border-primary/20 ml-2 space-y-12">
                {isNewFormat ? (
                    /* Render New Format Timeline */
                    timelineEvents.map((event, idx) => (
                        <div key={idx} className="relative">
                            <div className="absolute -left-[37px] top-1.5 w-2.5 h-2.5 bg-primary rotate-45" />

                            <div className="flex items-center gap-3 mb-3">
                                {event.type === 'activity' ? <Clock className="w-3.5 h-3.5 text-primary" /> : <Utensils className="w-3.5 h-3.5 text-primary" />}
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                                    {event.label} {event.time && `- ${event.time}`}
                                </span>
                            </div>

                            <div className="bg-card border border-border p-6 shadow-sm hover:border-primary/50 transition-colors">
                                <h4 className="font-serif text-xl mb-3 text-foreground">{event.meta?.name || event.label}</h4>
                                <p className="text-sm text-foreground/70 leading-relaxed font-light">
                                    {event.desc || "Unassigned"}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    /* Fallback to Legacy Format */
                    (["morning", "afternoon", "evening"] as const).map((period) => {
                        const data = todayItinerary?.location_metadata?.[period];
                        const activityDescription = todayItinerary?.[period];

                        return (
                            <div key={period} className="relative">
                                <div className="absolute -left-[37px] top-1.5 w-2.5 h-2.5 bg-primary rotate-45" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3 block">
                                    {period}
                                </span>

                                {data || activityDescription ? (
                                    <div className="bg-card border border-border p-6 shadow-sm hover:border-primary/50 transition-colors">
                                        <h4 className="font-serif text-2xl mb-3 text-foreground">{data?.name || "Activity"}</h4>
                                        <p className="text-sm text-foreground/70 leading-relaxed font-light">
                                            {activityDescription || "Experience the local highlights and customized activities."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-background border border-dashed border-border p-6">
                                        <p className="text-sm text-muted-foreground font-light italic">
                                            Free time or unassigned
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}