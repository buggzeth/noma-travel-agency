// components/plans/BookingInterface.tsx
"use client";

import { useState } from "react";
import { Plane, ChevronDown, ChevronUp } from "lucide-react";
import Script from "next/script";

export default function BookingInterface({ destination }: { destination: string }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {/* Inject the Travelpayouts Whitelabel script safely using Next.js Script */}
            <Script
                id="tp-whitelabel-script"
                strategy="lazyOnload"
                dangerouslySetInnerHTML={{
                    __html: `
                        (function () {
                            var script = document.createElement("script");
                            script.async = 1;
                            script.type = "module";
                            script.src = "https://tpembd.com/wl_web/main.js?wl_id=13524";
                            document.head.appendChild(script);
                        })();
                    `
                }}
            />

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-6 bg-secondary/10 border border-primary/30 hover:bg-secondary/20 transition-colors group"
            >
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full group-hover:scale-110 transition-transform border border-primary/20">
                        <Plane className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-serif text-xl md:text-2xl">Book This Journey</h3>
                        <p className="text-sm font-light text-foreground/60 tracking-wide mt-1">
                            Search live pricing for flights to {destination}
                        </p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-primary shrink-0" />
                ) : (
                    <ChevronDown className="w-6 h-6 text-primary shrink-0" />
                )}
            </button>

            <div
                className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${isExpanded ? "max-h-[3000px] opacity-100 border-x border-b border-primary/30 bg-card" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="p-6 md:p-8 border-t border-border/30">
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-foreground/70 mb-6 text-center">
                        Real-time flight search powered by NOMA & Aviasales
                    </p>

                    {/* Travelpayouts Whitelabel Metasearch Containers */}
                    <div className="w-full flex flex-col gap-6">
                        {/* 1. Search Form Widget */}
                        <div id="tpwl-search"></div>

                        {/* 2. Results Tickets Widget */}
                        <div id="tpwl-tickets"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}