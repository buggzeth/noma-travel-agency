// components/guide/tabs/ItineraryTab.tsx
import { useState } from "react";
import { ChevronRight, ChevronDown, Clock, Utensils } from "lucide-react";
import { TravelPlan } from "../../home/AITravelPlanOverlay";

export default function ItineraryTab({ plan }: { plan: TravelPlan }) {
    const [expandedDay, setExpandedDay] = useState<number | null>(0);

    const toggleDay = (idx: number) => {
        setExpandedDay(expandedDay === idx ? null : idx);
    };

    return (
        <div className="h-full w-full overflow-y-auto hide-scrollbar p-8 pb-12 animate-in fade-in duration-500">
            <div className="pt-8 mb-10">
                <span className="text-[10px] tracking-[0.2em] text-primary uppercase font-bold block mb-4">Overview</span>
                <h2 className="text-4xl font-serif">Full Itinerary</h2>
            </div>

            <div className="space-y-4">
                {plan.itinerary?.map((day, idx) => {
                    const isExpanded = expandedDay === idx;
                    const isNewFormat = !!(day.activities && day.meals);

                    return (
                        <div key={idx} className={`bg-card border transition-colors ${isExpanded ? 'border-primary/50' : 'border-border hover:border-primary/30'}`}>
                            <div
                                onClick={() => toggleDay(idx)}
                                className="p-6 flex items-center justify-between cursor-pointer group"
                            >
                                <div>
                                    <span className="text-[9px] uppercase tracking-[0.2em] text-primary font-bold block mb-2">
                                        Day {day.day || idx + 1}
                                    </span>
                                    <h3 className="font-serif text-xl text-foreground">{day.title || "Exploration"}</h3>
                                </div>
                                {isExpanded ? (
                                    <ChevronDown className="w-5 h-5 text-primary transition-colors" strokeWidth={1.5} />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
                                )}
                            </div>

                            {isExpanded && (
                                <div className="px-6 pb-6 pt-2 border-t border-border/30 animate-in slide-in-from-top-2 fade-in duration-300">
                                    {isNewFormat ? (
                                        <div className="space-y-6 mt-4">
                                            {day.activities && day.activities.length > 0 && (
                                                <div className="space-y-4">
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-2 block">Activities</span>
                                                    {day.activities.map((act, i) => (
                                                        <div key={i} className="pl-4 border-l border-primary/20">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className="font-serif text-lg">{act.title}</h4>
                                                                <span className="text-[10px] uppercase font-light bg-primary/10 text-primary px-2 py-0.5 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" /> {act.estimatedTime}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-light text-foreground/70">{act.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {day.meals && (
                                                <div className="space-y-4">
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-2 flex items-center gap-2">
                                                        <Utensils className="w-3 h-3" /> Dining
                                                    </span>
                                                    <div className="bg-secondary/10 p-4 space-y-3 text-sm font-light">
                                                        <p><strong className="uppercase text-[10px] tracking-widest mr-2">Breakfast:</strong> <span className="text-foreground/80">{day.meals.breakfast}</span></p>
                                                        <p><strong className="uppercase text-[10px] tracking-widest mr-2">Lunch:</strong> <span className="text-foreground/80">{day.meals.lunch}</span></p>
                                                        <p><strong className="uppercase text-[10px] tracking-widest mr-2">Dinner:</strong> <span className="text-foreground/80">{day.meals.dinner}</span></p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Legacy format fallback */
                                        <div className="space-y-4 mt-4 text-sm font-light">
                                            <div><strong className="uppercase text-[10px] tracking-widest block text-primary/70 mb-1">Morning</strong><p>{day.morning}</p></div>
                                            <div><strong className="uppercase text-[10px] tracking-widest block text-primary/70 mb-1">Afternoon</strong><p>{day.afternoon}</p></div>
                                            <div><strong className="uppercase text-[10px] tracking-widest block text-primary/70 mb-1">Evening</strong><p>{day.evening}</p></div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}