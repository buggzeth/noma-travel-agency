// components/plans/GetYourGuideWidget.tsx
"use client";

import Script from "next/script";
import { Compass } from "lucide-react";

interface Props {
    destination: string;
}

export default function GetYourGuideWidget({ destination }: Props) {
    return (
        <section className="mb-12 mt-12 border border-border/50 bg-secondary/5 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <Compass className="w-6 h-6 text-primary shrink-0" />
                <h2 className="text-2xl font-serif">Top Rated Experiences in {destination}</h2>
            </div>

            <div className="w-full relative min-h-[300px] flex items-center justify-center">
                {/* Next.js Script injection for GetYourGuide Analytics & Widget loader */}
                <Script
                    src="https://widget.getyourguide.com/dist/pa.umd.production.min.js"
                    strategy="lazyOnload"
                    data-gyg-partner-id="6GDHA5H"
                />

                {/* We use the "search" widget instead of "city" so we can pass the string destination directly */}
                <div
                    data-gyg-href="https://widget.getyourguide.com/default/search.frame"
                    data-gyg-locale-code="en-US"
                    data-gyg-widget="search"
                    data-gyg-partner-id="6GDHA5H"
                    data-gyg-q={destination}
                    className="w-full"
                >
                    {/* Fallback loading state while widget injects iframe */}
                    <div className="text-xs uppercase tracking-widest text-foreground/50 animate-pulse text-center w-full py-10">
                        Loading local experiences...
                    </div>
                </div>
            </div>
        </section>
    );
}