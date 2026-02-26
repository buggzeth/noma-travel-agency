// components/plans/BookingInterface.tsx
"use client";

import { useState } from "react";
import { Plane, Bed, ChevronDown, ChevronUp, Loader2, ArrowRight } from "lucide-react";

export default function BookingInterface({ destination }: { destination: string }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [results, setResults] = useState<{ flights: any[]; stays: any[] } | null>(null);

    const [formData, setFormData] = useState({
        originIata: "",
        destinationIata: "",
        departureDate: "",
        returnDate: "",
        adults: "2",
        rooms: "1",
    });

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setResults(null);

        try {
            const res = await fetch("/api/aviasales-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, destinationCity: destination }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to search availability");
            }

            const data = await res.json();

            // LOG FRONTEND DATA TO BROWSER CONSOLE
            console.log("=== FRONTEND RECEIVED DATA ===", data);

            setResults(data);
        } catch (err: any) {
            console.error("Frontend Fetch Error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
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
                            Check live pricing for flights
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
                    <form onSubmit={handleSearch} className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                            <div className="space-y-2 col-span-2 md:col-span-2">
                                <label className="text-[10px] uppercase tracking-widest font-semibold text-foreground/70">Origin (IATA)</label>
                                <input
                                    type="text"
                                    maxLength={3}
                                    required
                                    placeholder="e.g. JFK"
                                    value={formData.originIata}
                                    onChange={(e) => setFormData({ ...formData, originIata: e.target.value.toUpperCase() })}
                                    className="w-full bg-secondary/10 border-b border-border/50 px-0 py-2 focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/30 font-light"
                                />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-2">
                                <label className="text-[10px] uppercase tracking-widest font-semibold text-foreground/70">Destination (IATA)</label>
                                <input
                                    type="text"
                                    maxLength={3}
                                    required
                                    placeholder="e.g. LHR"
                                    value={formData.destinationIata}
                                    onChange={(e) => setFormData({ ...formData, destinationIata: e.target.value.toUpperCase() })}
                                    className="w-full bg-secondary/10 border-b border-border/50 px-0 py-2 focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/30 font-light"
                                />
                            </div>
                            <div className="space-y-2 col-span-1 md:col-span-1">
                                <label className="text-[10px] uppercase tracking-widest font-semibold text-foreground/70">Travelers</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={formData.adults}
                                    onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
                                    className="w-full bg-secondary/10 border-b border-border/50 px-0 py-2 focus:outline-none focus:border-foreground transition-colors font-light"
                                />
                            </div>
                            <div className="space-y-2 col-span-1 md:col-span-1">
                                <label className="text-[10px] uppercase tracking-widest font-semibold text-foreground/70">Rooms</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={formData.rooms}
                                    onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                                    className="w-full bg-secondary/10 border-b border-border/50 px-0 py-2 focus:outline-none focus:border-foreground transition-colors font-light"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-semibold text-foreground/70">Outbound Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.departureDate}
                                    onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                                    className="w-full bg-secondary/10 border-b border-border/50 px-0 py-2 focus:outline-none focus:border-foreground transition-colors font-light"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-semibold text-foreground/70">Return Date</label>
                                <input
                                    type="date"
                                    value={formData.returnDate}
                                    onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                                    className="w-full bg-secondary/10 border-b border-border/50 px-0 py-2 focus:outline-none focus:border-foreground transition-colors font-light"
                                />
                            </div>
                        </div>

                        {error && <p className="text-destructive text-sm font-medium mt-4 bg-destructive/10 p-3">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-8 w-full bg-foreground text-background py-4 text-xs tracking-widest uppercase font-medium hover:bg-foreground/90 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLoading ? "Consulting Aviasales API..." : "Search Live Availability"}
                        </button>
                    </form>

                    {/* Results Grid */}
                    {results && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 mt-8 border-t border-border/50 animate-in fade-in duration-500">

                            {/* Flights Block */}
                            <div>
                                <h4 className="text-xl font-serif mb-6 flex items-center gap-3">
                                    <Plane className="w-5 h-5 text-primary" /> Available Flights
                                </h4>
                                {results.flights.length > 0 ? (
                                    <div className="space-y-4">
                                        {results.flights.slice(0, 5).map((flight, i) => (
                                            <div key={i} className="p-4 border border-border/50 bg-secondary/5 flex justify-between items-center group hover:border-primary/50 transition-colors">
                                                <div>
                                                    <p className="font-medium">Airline: {flight?.airline || "Unknown"}</p>
                                                    <p className="text-xs text-foreground/60 flex items-center gap-1 mt-1">
                                                        {flight?.origin_airport || formData.originIata} <ArrowRight className="w-3 h-3" /> {flight?.destination_airport || formData.destinationIata}
                                                        {flight?.transfers > 0 && <span className="ml-1 opacity-70">({flight.transfers} stops)</span>}
                                                    </p>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <p className="font-semibold text-lg">
                                                        ${flight?.price} USD
                                                    </p>
                                                    <a
                                                        href={`https://www.aviasales.com${flight?.link || ""}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] uppercase tracking-widest bg-primary text-primary-foreground px-3 py-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Check Live Price
                                                    </a>
                                                </div>
                                                {/* Add this little helper text under the destination */}
                                                <p className="text-[10px] text-foreground/40 mt-1">
                                                    Found for: {new Date(flight.departure_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm font-light text-foreground/50 italic border border-dashed border-border/50 p-6 text-center">
                                        No flights found in cache for this exact route and date. Try modifying your dates or routing.
                                    </p>
                                )}
                            </div>

                            {/* Stays Block */}
                            <div>
                                <h4 className="text-xl font-serif mb-6 flex items-center gap-3">
                                    <Bed className="w-5 h-5 text-primary" /> Curated Stays
                                </h4>
                                {results.stays.length > 0 ? (
                                    <div className="space-y-4">
                                        {results.stays.slice(0, 5).map((stay, i) => (
                                            <div key={i} className="p-4 border border-border/50 bg-secondary/5 flex justify-between items-center group hover:border-primary/50 transition-colors">
                                                <div className="pr-4">
                                                    <p className="font-medium truncate max-w-[200px]">{stay?.accommodation?.name || "Hotel"}</p>
                                                    <p className="text-xs text-foreground/60 mt-1">
                                                        {stay?.accommodation?.rating ? `${stay.accommodation.rating} Stars` : "Boutique"}
                                                    </p>
                                                </div>
                                                <div className="text-right flex flex-col items-end shrink-0">
                                                    <p className="font-semibold text-lg">
                                                        {stay?.cheapest_rate_total_amount} {stay?.cheapest_rate_total_currency}
                                                    </p>
                                                    <button className="text-[10px] uppercase tracking-widest bg-primary text-primary-foreground px-3 py-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Select
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm font-light text-foreground/50 italic border border-dashed border-border/50 p-6 text-center flex flex-col gap-1 items-center">
                                        <span>No live availability fetched.</span>
                                        <span className="text-xs">(Integration coming soon)</span>
                                    </p>
                                )}
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}