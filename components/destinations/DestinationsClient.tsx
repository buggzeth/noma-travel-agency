// app/destinations/DestinationsClient.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, CalendarDays, Wallet, Search, X } from "lucide-react";

const ITEMS_PER_PAGE = 25;

// Helper to extract the max cost from strings like "$3,800 - $5,500 per person"
const extractMaxCost = (costStr: string) => {
    if (!costStr) return Infinity;
    const matches = costStr.match(/[\d,]+/g);

    if (matches && matches.length >= 2) {
        // Return the upper bound (the second number found)
        return parseInt(matches[1].replace(/,/g, ""), 10);
    } else if (matches && matches.length === 1) {
        // Return the only number found
        return parseInt(matches[0].replace(/,/g, ""), 10);
    }
    return Infinity;
};

export default function DestinationsClient({ plans }: { plans: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLength, setSelectedLength] = useState<number | null>(null);
    const [selectedCost, setSelectedCost] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to page 1 whenever any filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedLength, selectedCost]);

    const filteredPlans = useMemo(() => {
        return plans.filter((plan) => {
            const pd = plan.plan_data;
            const daysCount = pd?.itinerary?.length || 0;
            const costStr = pd?.estimatedCost || "";
            const maxCost = extractMaxCost(costStr);

            // 1. Search Query Match
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                !searchQuery ||
                plan.destination.toLowerCase().includes(searchLower) ||
                (pd?.summary && pd.summary.toLowerCase().includes(searchLower));

            // 2. Length Match (less than or equal)
            const matchesLength = !selectedLength || daysCount <= selectedLength;

            // 3. Cost Match (less than or equal)
            const matchesCost = !selectedCost || maxCost <= selectedCost;

            return matchesSearch && matchesLength && matchesCost;
        });
    }, [plans, searchQuery, selectedLength, selectedCost]);

    // Calculate Pagination
    const totalPages = Math.ceil(filteredPlans.length / ITEMS_PER_PAGE);
    const paginatedPlans = filteredPlans.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div>
            {/* Search & Filters Section */}
            <div className="mb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Search Bar */}
                <div className="relative max-w-3xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search destinations or experiences..."
                        className="w-full pl-12 pr-12 py-4 bg-background border border-border/60 focus:border-primary outline-none transition-colors shadow-sm text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Tag Filters */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Trip Length Tags */}
                    <div className="flex flex-col gap-3">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                            Filter by Duration
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {[5, 10, 14].map((days) => (
                                <button
                                    key={`days-${days}`}
                                    onClick={() => setSelectedLength(selectedLength === days ? null : days)}
                                    className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors border ${selectedLength === days
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-transparent border-border/60 text-foreground hover:border-primary/50"
                                        }`}
                                >
                                    &lt; {days} Days
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Budget Tags */}
                    <div className="flex flex-col gap-3">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                            Filter by Max Budget (PP)
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {[2500, 5000, 10000].map((cost) => (
                                <button
                                    key={`cost-${cost}`}
                                    onClick={() => setSelectedCost(selectedCost === cost ? null : cost)}
                                    className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors border ${selectedCost === cost
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-transparent border-border/60 text-foreground hover:border-primary/50"
                                        }`}
                                >
                                    &lt; ${cost.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Count Summary */}
            <div className="mb-6 text-sm text-muted-foreground font-medium">
                Showing {paginatedPlans.length} of {filteredPlans.length} {filteredPlans.length === 1 ? "journey" : "journeys"}
            </div>

            {/* Render Filtered Grid */}
            {filteredPlans.length === 0 ? (
                <div className="text-center py-24 border border-border/50 bg-card max-w-2xl mx-auto">
                    <h2 className="text-2xl font-serif mb-4">No Matches Found</h2>
                    <p className="text-foreground/60 font-light mb-8 max-w-md mx-auto">
                        Try adjusting your search criteria or removing filters to see more curated journeys.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedLength(null);
                            setSelectedCost(null);
                        }}
                        className="inline-flex bg-primary text-primary-foreground px-8 py-3 uppercase tracking-widest text-xs font-medium hover:bg-primary/90 transition-colors shadow-md"
                    >
                        Clear All Filters
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {paginatedPlans.map((plan) => {
                            const pd = plan.plan_data;
                            const daysCount = pd?.itinerary?.length || 0;

                            return (
                                <Link
                                    key={plan.slug}
                                    href={`/plans/${plan.slug}`}
                                    className="group relative flex flex-col aspect-[4/5] md:aspect-square overflow-hidden border border-border/50 bg-black shadow-sm hover:shadow-2xl transition-all duration-500"
                                >
                                    {/* Background Image */}
                                    <div className="absolute inset-0 z-0">
                                        <Image
                                            src={plan.imageUrl}
                                            alt={`${plan.destination} travel plan`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-1000 opacity-90"
                                        />
                                        {/* Pure Black Film Grain Overlay */}
                                        <div
                                            className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none z-10"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                            }}
                                        />
                                        {/* Dual-layer dark gradient for perfect text readability */}
                                        <div className="absolute inset-0 z-20 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />
                                        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/95 via-black/1 to-black/0" />
                                    </div>

                                    {/* Content Layer */}
                                    <div className="relative z-10 flex flex-col h-full p-6 md:p-8 text-white justify-end">
                                        {/* Top Badges */}
                                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                                            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold bg-white/10 text-white border border-white/20 px-3 py-1.5 backdrop-blur-md">
                                                <MapPin className="w-3 h-3 text-white/80" />
                                                {plan.destination}
                                            </span>
                                        </div>

                                        <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                                            <h2 className="text-2xl md:text-3xl font-serif mb-3 line-clamp-2 leading-tight drop-shadow-md">
                                                {plan.destination} Escape
                                            </h2>

                                            <p className="text-white/80 font-light mb-6 text-sm leading-relaxed line-clamp-2 md:line-clamp-3">
                                                {pd?.summary}
                                            </p>

                                            {/* Footer Info Row */}
                                            <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 mb-2">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] text-white/60 uppercase tracking-widest font-semibold flex items-center gap-1">
                                                        <Wallet className="w-3 h-3" /> Budget
                                                    </span>
                                                    <span className="text-sm font-medium truncate drop-shadow-sm">
                                                        {pd?.estimatedCost || "Moderate"}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col gap-1 text-right items-end">
                                                    <span className="text-[10px] text-white/60 uppercase tracking-widest font-semibold flex items-center gap-1">
                                                        <CalendarDays className="w-3 h-3" /> Duration
                                                    </span>
                                                    <span className="text-sm font-medium drop-shadow-sm">
                                                        {daysCount} Days
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Call to action arrow */}
                                        <div className="mt-4 flex items-center justify-between text-white/90 text-xs uppercase tracking-widest font-semibold overflow-hidden">
                                            <span className="opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
                                                Explore Plan
                                            </span>
                                            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-16 flex items-center justify-center gap-6">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-6 py-3 border border-border/60 text-xs font-medium uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                            >
                                Previous
                            </button>

                            <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-6 py-3 border border-border/60 text-xs font-medium uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}