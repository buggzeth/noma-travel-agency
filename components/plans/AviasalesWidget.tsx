// components/plans/AviasalesWidget.tsx
"use client";

import { useEffect, useRef } from "react";

interface AviasalesWidgetProps {
    destination?: string;
}

export default function AviasalesWidget({ destination }: AviasalesWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear container to prevent duplicate scripts on React re-renders
        containerRef.current.innerHTML = "";

        // IMPORTANT: Replace the src URL with the exact script snippet 
        // generated from your Travelpayouts Dashboard -> Programs -> Aviasales -> Tools -> Widgets
        const script = document.createElement("script");
        script.src = "https://tp.media/content?promo_id=4132&shmarker=YOUR_AFFILIATE_MARKER&campaign_id=100&utf8=%E2%9C%93&powered_by=true";
        script.async = true;
        script.charset = "utf-8";

        containerRef.current.appendChild(script);
    }, [destination]);

    return (
        <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif mb-6 flex items-center gap-3 border-b border-border/50 pb-4">
                Book Your Journey to {destination}
            </h2>

            {/* Widget Container */}
            <div
                ref={containerRef}
                className="w-full min-h-[300px] bg-card border border-border/50 rounded-xl overflow-hidden p-2 md:p-4 shadow-sm"
            />
        </section>
    );
}