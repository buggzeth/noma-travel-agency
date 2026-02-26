// components/guide/tabs/WelcomeTab.tsx
import { Sparkles, MapPin } from "lucide-react";
import { TravelPlan } from "../../home/AITravelPlanOverlay";

export default function WelcomeTab({ plan, onBegin }: { plan: TravelPlan, onBegin: () => void }) {
    return (
        <div className="h-full w-full overflow-y-auto hide-scrollbar p-8 flex flex-col justify-between animate-in fade-in duration-500">
            <div className="pt-16">
                <span className="text-[10px] tracking-[0.2em] text-primary uppercase font-bold block mb-4">
                    Noma Pre-Arrival
                </span>
                <h1 className="text-6xl font-serif text-foreground leading-[1.1] tracking-tight">
                    Welcome to <br />
                    <em className="italic text-primary">{plan.destination}</em>.
                </h1>
                <p className="mt-8 text-foreground/70 leading-relaxed text-lg font-light max-w-md">
                    Your dedicated NOMA AI Guide has crafted your itinerary. When you have arrived at your destination and are ready to begin, press start below.
                </p>
            </div>

            <div className="mt-16 space-y-6">
                <div className="bg-card p-5 border border-border flex items-center gap-5 shadow-sm">
                    <div className="w-12 h-12 bg-background border border-border flex items-center justify-center shrink-0">
                        <MapPin className="text-primary w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground uppercase tracking-widest">Location Required</p>
                        <p className="text-xs text-muted-foreground mt-1">Enable GPS for live contextual guidance.</p>
                    </div>
                </div>

                <button
                    onClick={onBegin}
                    className="w-full bg-foreground text-background py-6 shadow-xl uppercase tracking-[0.2em] text-xs font-bold flex items-center justify-center gap-3 transition-transform active:scale-[0.98] hover:bg-foreground/90"
                >
                    <Sparkles className="w-4 h-4" /> Begin Journey
                </button>
            </div>
        </div>
    );
}