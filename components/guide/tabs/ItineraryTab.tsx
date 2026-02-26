// components/guide/tabs/ItineraryTab.tsx
import { ChevronRight } from "lucide-react";
import { TravelPlan } from "../../home/AITravelPlanOverlay";

export default function ItineraryTab({ plan }: { plan: TravelPlan }) {
    return (
        <div className="h-full w-full overflow-y-auto hide-scrollbar p-8 pb-12 animate-in fade-in duration-500">
            <div className="pt-8 mb-10">
                <span className="text-[10px] tracking-[0.2em] text-primary uppercase font-bold block mb-4">Overview</span>
                <h2 className="text-4xl font-serif">Full Itinerary</h2>
            </div>

            <div className="space-y-4">
                {plan.itinerary?.map((day, idx) => (
                    <div key={idx} className="bg-card border border-border p-6 shadow-sm flex items-center justify-between group cursor-pointer hover:border-primary transition-colors">
                        <div>
                            <span className="text-[9px] uppercase tracking-[0.2em] text-primary font-bold block mb-2">
                                Day {day.day || idx + 1}
                            </span>
                            <h3 className="font-serif text-xl text-foreground">{day.title || "Exploration"}</h3>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
                    </div>
                ))}
            </div>
        </div>
    );
}