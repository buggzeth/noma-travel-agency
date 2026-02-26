// components/guide/tabs/MoreTab.tsx
import { Ticket, ShieldCheck, ChevronRight } from "lucide-react";

export default function MoreTab() {
    return (
        <div className="h-full w-full overflow-y-auto hide-scrollbar p-8 pb-12 animate-in fade-in duration-500">
            <div className="pt-8 mb-10">
                <span className="text-[10px] tracking-[0.2em] text-primary uppercase font-bold block mb-4">Services</span>
                <h2 className="text-4xl font-serif">Concierge</h2>
            </div>

            <div className="space-y-4">
                <button className="w-full bg-card p-6 border border-border flex items-center justify-between shadow-sm group hover:border-primary transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-background border border-border flex items-center justify-center shrink-0">
                            <Ticket className="w-4 h-4 text-primary" strokeWidth={1.5} />
                        </div>
                        <span className="font-sans text-sm tracking-widest uppercase font-semibold text-foreground">Tickets & Passes</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                <button className="w-full bg-card p-6 border border-border flex items-center justify-between shadow-sm group hover:border-primary transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-background border border-border flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-4 h-4 text-primary" strokeWidth={1.5} />
                        </div>
                        <span className="font-sans text-sm tracking-widest uppercase font-semibold text-foreground">Emergency Info</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
            </div>
        </div>
    );
}