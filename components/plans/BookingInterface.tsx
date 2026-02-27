// components/plans/BookingInterface.tsx
"use client";

import { useState, useEffect } from "react";
import { Plane, X, ArrowRight } from "lucide-react";

export default function BookingInterface({ destination }: { destination: string }) {
    const [isOpen, setIsOpen] = useState(false);

    // Prevent the main background from scrolling when the modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    return (
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {/* Main Page Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-between p-6 bg-secondary/10 border border-primary/30 hover:bg-secondary/20 transition-colors group cursor-pointer"
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
                <div className="flex items-center justify-center w-10 h-10 border border-primary/30 group-hover:bg-primary/5 transition-colors">
                    <ArrowRight className="w-5 h-5 text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
                </div>
            </button>

            {/* Fullscreen Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-0 py-0 sm:px-6 sm:py-6 md:p-12">
                    {/* Dark Backdrop */}
                    <div
                        className="absolute inset-0 bg-[#2A2B27]/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Window */}
                    <div className="relative w-full h-[80vh] max-w-6xl bg-card border border-border/50 shadow-2xl flex flex-col sm:h-[70vh] overflow-hidden animate-in zoom-in-95 fade-in duration-300">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-8 border-b border-border/50 bg-secondary/10 shrink-0">
                            <div>
                                <h3 className="font-serif text-xl md:text-2xl">Flight Search</h3>
                                <p className="text-[10px] uppercase tracking-widest text-foreground/50 mt-2 font-semibold">
                                    Powered by NOMA & Aviasales
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-black/5 transition-colors border border-transparent hover:border-border/50"
                                aria-label="Close modal"
                            >
                                <X className="w-6 h-6 text-foreground/70" />
                            </button>
                        </div>

                        {/* Modal Body (Iframe) */}
                        <div className="flex-1 w-full relative bg-card overflow-hidden">
                            <iframe
                                src="/flight-search-embed.html"
                                className="absolute inset-0 w-full h-full border-none bg-transparent"
                                title="Flight Search Widget"
                                allow="clipboard-write"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}