// components/plans/BookingInterface.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
    Plane,
    ChevronDown,
    Map,
    Car,
    Bed,
    Ticket,
    Shield,
    Ship,
    Train,
    Smartphone // Added Smartphone for eSIM
} from "lucide-react";

function WidgetAccordion({ title, icon: Icon, children, defaultOpen = false }: { title: string, icon: any, children: React.ReactNode, defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="mb-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-6 bg-secondary/10 border border-primary/30 hover:bg-secondary/20 transition-colors group cursor-pointer ${isOpen ? "border-b-0" : ""}`}
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full group-hover:scale-110 transition-transform border border-primary/20 shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-serif text-xl md:text-2xl">{title}</h3>
                    </div>
                </div>

                <div className="flex items-center justify-center w-10 h-10 border border-primary/30 group-hover:bg-primary/5 transition-colors shrink-0">
                    <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </div>
            </button>

            <div className={`w-full overflow-hidden transition-all duration-500 ease-in-out bg-background ${isOpen ? "max-h-[1500px] border border-t-0 border-primary/30 opacity-100" : "max-h-0 opacity-0 border-x border-b border-transparent"}`}>
                <div className="flex flex-col h-full w-full p-2 md:p-6 bg-white/5">
                    {children}
                </div>
            </div>
        </div>
    );
}

function ScriptInjector({ src }: { src: string }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear on re-render to prevent duplicate script executions in strict mode
        containerRef.current.innerHTML = '';

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.charset = 'utf-8';

        containerRef.current.appendChild(script);

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [src]);

    // Replaced `flex justify-center` with `block` to prevent shrink-wrapping. 
    // Added Tailwind variants to forcefully override any inline widths from injected third-party iframes/divs
    return (
        <div
            ref={containerRef}
            className="w-full block min-h-[200px] overflow-hidden [&>div]:!w-full [&>div]:!max-w-none [&_iframe]:!w-full [&_iframe]:!min-w-full"
        />
    );
}

export default function BookingInterface({ destination }: { destination: string }) {
    return (
        <div className="mt-16 w-full pt-8 border-t border-border/50">
            <div className="mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-serif mb-4">Book Your Journey</h2>
                <p className="text-foreground/60 font-light max-w-2xl mx-auto">
                    Secure the best rates on flights, accommodations, and exclusive experiences directly through the NOMA network.
                </p>
            </div>

            <WidgetAccordion title="Flights" icon={Plane} defaultOpen={true}>
                <div className="relative w-full h-[450px]">
                    <iframe
                        src="/flight-search-embed.html"
                        className="absolute inset-0 w-full h-full border-none bg-transparent"
                        title="Flight Search Widget"
                        allow="clipboard-write"
                    />
                </div>
            </WidgetAccordion>

            {/* Changed locale=en to language=en & locale=260932 (New York City ID) as per your screenshot */}
            <WidgetAccordion title="Tours & Activities" icon={Map}>
                <ScriptInjector src="https://tpembd.com/content?currency=USD&trs=504115&shmarker=706512&language=en&locale=260932&layout=horizontal&cards=4&powered_by=true&campaign_id=150&promo_id=4489" />
            </WidgetAccordion>

            <WidgetAccordion title="Airport Transfers" icon={Car}>
                <ScriptInjector src="https://tpembd.com/content?currency=USD&trs=504115&shmarker=706512&language=en&theme=4&powered_by=true&campaign_id=1&promo_id=1486" />
            </WidgetAccordion>

            {/* Fixed Icon from Bed to Car */}
            <WidgetAccordion title="Car & Bike Rental" icon={Car}>
                <ScriptInjector src="https://tp.media/content?campaign_id=222&promo_id=8813&shmarker=706512&trs=504115" />
            </WidgetAccordion>

            {/* Fixed Icon from Car to Shield */}
            <WidgetAccordion title="Flight Compensation" icon={Shield}>
                <ScriptInjector src="https://tpembd.com/content?trs=504115&shmarker=706512&locale=260932&border_radius=5&plain=true&powered_by=true&promo_id=3408&campaign_id=86" />
            </WidgetAccordion>

            <WidgetAccordion title="Train & Bus Tickets" icon={Train}>
                <ScriptInjector src="https://tpembd.com/content?trs=504115&shmarker=706512&locale=260932&powered_by=true&color_button=%23A7E92F&color_icons=%23A7E92F&dark=%23323942&light=%23FFFFFF&secondary=%23016A2B&special=%23a7e92f&color_focused=%23A7E92F&border_radius=30&plain=false&promo_id=8450&campaign_id=371" />
            </WidgetAccordion>

            <WidgetAccordion title="Event Tickets" icon={Ticket}>
                <ScriptInjector src="https://tpembd.com/content?trs=504115&shmarker=706512&bg_color=%23112266&title=Need%20tickets%3F&title_color=%23ffffff&icon_color=%230077ff&search_text=Search%20by%20artist%2C%20team%2C%20event%2C%20etc...&footer_color=%23ffffff&powered_by=true&campaign_id=72&promo_id=8505" />
            </WidgetAccordion>

            {/* Fixed Icon from Ship to Smartphone */}
            <WidgetAccordion title="Travel SIM (eSIM)" icon={Smartphone}>
                <ScriptInjector src="https://tpembd.com/content?trs=504115&shmarker=706512&locale=en&powered_by=true&color_button=%23f2685f&color_focused=%23f2685f&secondary=%23FFFFFF&dark=%2311100f&light=%23FFFFFF&special=%23C4C4C4&border_radius=5&plain=false&no_labels=true&promo_id=8588&campaign_id=541" />
            </WidgetAccordion>

            <WidgetAccordion title="Travel Insurance" icon={Shield}>
                <ScriptInjector src="https://tpembd.com/content?currency=USD&trs=504115&shmarker=706512&locale=en&category=4&amount=3&powered_by=true&campaign_id=137&promo_id=4497" />
            </WidgetAccordion>
        </div>
    );
}