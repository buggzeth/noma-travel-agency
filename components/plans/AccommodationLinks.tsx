// components/plans/AccommodationLinks.tsx
"use client";

import { useState, useEffect } from "react";
import { Bed, Home, Building2, HelpCircle, MapPin } from "lucide-react";

interface Props {
    destination: string;
    departDate: string;
    returnDate: string;
}

export default function AccommodationLinks({ destination, departDate, returnDate }: Props) {
    const [isBusiness, setIsBusiness] = useState(false);
    const [includeFlights, setIncludeFlights] = useState(false);
    const [origin, setOrigin] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Load Open-Meteo Geocoding Autocomplete
    useEffect(() => {
        if (origin.length > 2 && showSuggestions) {
            const timer = setTimeout(async () => {
                try {
                    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(origin)}&count=5&language=en&format=json`);
                    const data = await res.json();
                    if (data.results) {
                        setSuggestions(data.results.map((r: any) => [r.name, r.admin1, r.country].filter(Boolean).join(", ")));
                    } else {
                        setSuggestions([]);
                    }
                } catch (err) {
                    setSuggestions([]);
                }
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setSuggestions([]);
        }
    }, [origin, showSuggestions]);

    const [activeTooltip, setActiveTooltip] = useState<'flights' | 'business' | null>(null);

    // Close tooltip when clicking/tapping anywhere else on the page
    useEffect(() => {
        if (!activeTooltip) return;
        const handleClickOutside = () => setActiveTooltip(null);

        document.addEventListener("click", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [activeTooltip]);

    // Date Formatter
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? "" : d.toISOString().split('T')[0];
    };

    const start = formatDate(departDate);
    const end = formatDate(returnDate);

    // Shared Affiliate Data
    const camref = "1011l425432";
    const encodedDest = encodeURIComponent(destination);

    // URL Modifiers
    const businessParam = isBusiness ? "&travelPurpose=BUSINESS" : "";
    const flightParams = includeFlights && origin
        ? `&packageType=fh&origin=${encodeURIComponent(origin)}&tripType=ROUND_TRIP`
        : "";

    // Dynamic URLs
    const expediaUrl = `https://www.expedia.com/Hotel-Search?destination=${encodedDest}&d1=${start}&startDate=${start}&d2=${end}&endDate=${end}&adults=2&camref=${camref}${flightParams}`;
    const vrboUrl = `https://www.vrbo.com/search?destination=${encodedDest}&d1=${start}&startDate=${start}&d2=${end}&endDate=${end}&adults=2&camref=${camref}${businessParam}`;
    const hotelsUrl = `https://www.hotels.com/Hotel-Search?destination=${encodedDest}&d1=${start}&startDate=${start}&d2=${end}&endDate=${end}&adults=2&camref=${camref}${businessParam}`;

    if (!departDate || !returnDate) return null;

    return (
        <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-start justify-end gap-3">

                {/* Expedia Composite Button (Link + Checkbox + Origin Input) */}
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-stretch bg-[#00355f] text-white shadow-lg border border-[#00355f]/50 transition-all duration-300 hover:bg-[#002847]">
                        <a
                            href={expediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-widest"
                        >
                            <Bed className="w-4 h-4 shrink-0" /> Expedia
                        </a>

                        {/* Checkbox Section */}
                        <div className="flex items-center gap-1.5 px-3 border-l border-white/20">
                            <input
                                type="checkbox"
                                checked={includeFlights}
                                onChange={(e) => setIncludeFlights(e.target.checked)}
                                className="accent-white w-3.5 h-3.5 cursor-pointer"
                                aria-label="Search flights too"
                            />

                            <div className="relative group flex items-center">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setActiveTooltip(activeTooltip === 'flights' ? null : 'flights');
                                    }}
                                    className="focus:outline-none"
                                >
                                    <HelpCircle className="w-4 h-4 text-white/80 hover:text-white cursor-help" />
                                </button>
                                <div className={`absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-max px-2 py-1 bg-background text-foreground border border-border/50 text-[10px] uppercase tracking-wider font-semibold shadow-lg transition-opacity pointer-events-none z-10 ${activeTooltip === 'flights' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    Search flights too
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conditional Origin Input with Autocomplete */}
                    {includeFlights && (
                        <div className="relative w-full max-w-[200px] animate-in fade-in slide-in-from-top-2">
                            <input
                                type="text"
                                placeholder="Origin city or airport..."
                                value={origin}
                                onChange={(e) => {
                                    setOrigin(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setShowSuggestions(false)}
                                className="text-xs px-3 py-2 w-full border border-border/50 bg-background text-foreground outline-none focus:border-primary placeholder:text-foreground/40 shadow-sm"
                            />

                            {/* Autocomplete Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute top-full right-0 w-full mt-1 bg-background border border-border/50 shadow-xl z-50 overflow-hidden">
                                    {suggestions.map((s, i) => (
                                        <li
                                            key={i}
                                            // Use onMouseDown instead of onClick so it fires before the input's onBlur event
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                setOrigin(s);
                                                setShowSuggestions(false);
                                            }}
                                            className="px-3 py-2.5 text-xs hover:bg-secondary cursor-pointer border-b border-border/10 last:border-0 truncate flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors"
                                        >
                                            <MapPin className="w-3 h-3 shrink-0 text-primary/70" />
                                            <span className="truncate">{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* Vrbo Button */}
                <a
                    href={vrboUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#002B49] text-white hover:bg-[#001f35] transition-all duration-300 px-4 py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg border border-[#002B49]/50 h-[38px] md:h-[40px]"
                >
                    <Home className="w-4 h-4 shrink-0" /> Vrbo
                </a>

                {/* Hotels.com Composite Button */}
                <div className="flex items-stretch bg-[#D32F2F] text-white shadow-lg border border-[#D32F2F]/50 transition-all duration-300 hover:bg-[#B71C1C] h-[38px] md:h-[40px]">
                    <a
                        href={hotelsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-widest"
                    >
                        <Building2 className="w-4 h-4 shrink-0" /> Hotels.com
                    </a>

                    <div className="flex items-center gap-1.5 px-3 border-l border-white/20">
                        <input
                            type="checkbox"
                            checked={isBusiness}
                            onChange={(e) => setIsBusiness(e.target.checked)}
                            className="accent-white w-3.5 h-3.5 cursor-pointer"
                            aria-label="Travel as business"
                        />

                        <div className="relative group flex items-center">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActiveTooltip(activeTooltip === 'business' ? null : 'business');
                                }}
                                className="focus:outline-none"
                            >
                                <HelpCircle className="w-4 h-4 text-white/80 hover:text-white cursor-help" />
                            </button>
                            <div className={`absolute bottom-full right-9 sm:right-1/2 translate-x-1/2 mb-2 w-max px-2 py-1 bg-background text-foreground border border-border/50 text-[10px] uppercase tracking-wider font-semibold shadow-lg transition-opacity pointer-events-none z-10 ${activeTooltip === 'business' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                Travel as business
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}