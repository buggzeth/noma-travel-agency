// components/plans/BookingInterface.tsx
"use client";

import { useState } from "react";
import { Plane, ChevronDown } from "lucide-react";

export default function BookingInterface({ destination }: { destination: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {/* Main Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-6 bg-secondary/10 border border-primary/30 hover:bg-secondary/20 transition-colors group cursor-pointer ${isOpen ? "border-b-0" : ""
                    }`}
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full group-hover:scale-110 transition-transform border border-primary/20 shrink-0">
                        <Plane className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-serif text-xl md:text-2xl">Book This Journey</h3>
                    </div>
                </div>

                {/* Rotating Chevron Indicator */}
                <div className="flex items-center justify-center w-10 h-10 border border-primary/30 group-hover:bg-primary/5 transition-colors shrink-0">
                    <ChevronDown
                        className={`w-5 h-5 text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                            }`}
                    />
                </div>
            </button>

            {/* Inline Dropdown Panel */}
            <div
                className={`w-full overflow-hidden transition-all duration-500 ease-in-out bg-background  ${isOpen
                    ? "max-h-[600px] border border-t-0 border-primary/30 opacity-100"
                    : "max-h-0 opacity-0 border-x border-b border-transparent"
                    }`}
            >
                <div className="flex flex-col h-full w-full">

                    {/* Iframe Container */}
                    <div className="relative w-full h-[450px]">
                        <iframe
                            src="/flight-search-embed.html"
                            className="absolute inset-0 w-full h-full border-none bg-transparent"
                            title="Flight Search Widget"
                            allow="clipboard-write"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}