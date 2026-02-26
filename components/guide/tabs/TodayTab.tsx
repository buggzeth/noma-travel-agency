// components/guide/tabs/TodayTab.tsx
import { MapPin } from "lucide-react";
import { TravelPlan } from "../../home/AITravelPlanOverlay";

export default function TodayTab({ plan }: { plan: TravelPlan }) {
    const todayItinerary = plan.itinerary?.[0];

    return (
        <div className="h-full w-full overflow-y-auto hide-scrollbar p-8 pb-12 animate-in fade-in duration-500">
            <header className="pt-8 mb-12">
                <span className="bg-foreground text-background text-[9px] px-4 py-1.5 uppercase tracking-[0.2em] font-bold">
                    Active Journey
                </span>
                <h2 className="text-5xl font-serif mt-8 text-foreground">Day 1</h2>
                <p className="text-muted-foreground mt-4 flex items-center gap-2 font-light tracking-wide">
                    <MapPin className="w-4 h-4 text-primary" /> {plan.destination}
                </p>
            </header>

            <div className="relative pl-8 border-l border-primary/20 ml-2 space-y-14">
                {(["morning", "afternoon", "evening"] as const).map((period) => {
                    const data = todayItinerary?.location_metadata?.[period];
                    const activityDescription = todayItinerary?.[period];

                    return (
                        <div key={period} className="relative">
                            <div className="absolute -left-[37px] top-1.5 w-2.5 h-2.5 bg-primary rotate-45" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3 block">
                                {period}
                            </span>

                            {data ? (
                                <div className="bg-card border border-border p-6 shadow-sm hover:border-primary/50 transition-colors">
                                    <h4 className="font-serif text-2xl mb-3 text-foreground">{data.name}</h4>
                                    <p className="text-sm text-foreground/70 leading-relaxed font-light">
                                        {activityDescription || "Experience the local highlights and customized activities."}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-background border border-dashed border-border p-6">
                                    <p className="text-sm text-muted-foreground font-light italic">
                                        {activityDescription || "Free time or unassigned"}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}