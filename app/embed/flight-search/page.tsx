// app/embed/flight-search/page.tsx
"use client";

import Script from "next/script";

export default function FlightSearchEmbed() {
    return (
        <div className="min-h-screen bg-[#FCFBF9] text-[#2A2B27]">
            {/* 1. Safely inject the script into this isolated page */}
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

            <div className="w-full flex flex-col gap-6 p-4 md:p-8">
                {/* 2. The Search Form Widget */}
                <div id="tpwl-search"></div>

                {/* 3. The Search Results Widget */}
                <div id="tpwl-tickets"></div>
            </div>
        </div>
    );
}