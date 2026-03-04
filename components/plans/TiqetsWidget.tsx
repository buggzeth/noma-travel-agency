// components/plans/TiqetsWidget.tsx
"use client";

import { useEffect, useState } from "react";
import { Ticket, Star, MapPin, ArrowRight } from "lucide-react";

interface Props {
    destination: string;
}

export default function TiqetsWidget({ destination }: Props) {
    const [experiences, setExperiences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const PARTNER_ID = "noma-184635";

    useEffect(() => {
        async function fetchExperiences() {
            try {
                const cleanDestination = destination.split(',')[0].trim();
                const res = await fetch(`/api/tiqets?destination=${encodeURIComponent(cleanDestination)}`);

                if (!res.ok) throw new Error("Network response was not ok");
                const data = await res.json();

                if (data.experiences && data.experiences.length > 0) {
                    setExperiences(data.experiences);
                } else {
                    setError(true);
                }
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchExperiences();
    }, [destination]);

    const makeAffiliateLink = (url: string) => {
        if (!url) return "#";
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}partner=${PARTNER_ID}`;
    };

    if (loading) {
        return (
            <section className="mb-12 mt-12 border-y md:border border-border/50 bg-secondary/5 py-6 md:p-8 animate-pulse">
                <div className="h-8 w-64 bg-border/50 mb-6 mx-4 md:mx-0 rounded"></div>
                <div className="flex gap-4 md:gap-6 overflow-hidden px-4 md:px-0">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-[85vw] max-w-[280px] md:max-w-none md:w-[320px] h-72 bg-border/30 rounded border border-border/50 shrink-0"></div>
                    ))}
                </div>
            </section>
        );
    }

    if (error || experiences.length === 0) return null;

    return (
        <section className="mb-12 mt-12 border-y md:border border-border/50 bg-secondary/5 py-6 md:p-8">
            <div className="flex items-center justify-between mb-6 px-4 md:px-0">
                <div className="flex items-center gap-3">
                    <Ticket className="w-6 h-6 text-primary shrink-0" />
                    <h2 className="text-2xl font-serif">Top Local Experiences</h2>
                </div>
                <div className="hidden md:block text-[10px] uppercase tracking-widest text-foreground/50">
                    Swipe to explore →
                </div>
            </div>

            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-6 pt-2 px-4 md:px-0 [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary/50 transition-colors">
                {experiences.map((exp) => {
                    const imgObj = exp.images?.[0];
                    const imageUrl = imgObj?.large || imgObj?.medium || imgObj?.small || "https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=1000&auto=format&fit=crop";

                    return (
                        <div
                            key={exp.id}
                            className="w-[85vw] max-w-[280px] md:max-w-none md:w-[320px] shrink-0 snap-start flex flex-col bg-background border border-border/50 hover:border-foreground/30 transition-colors group shadow-sm hover:shadow-md"
                        >
                            <div className="relative w-full aspect-[4/3] overflow-hidden bg-secondary/20 border-b border-border/50">
                                <img
                                    src={imageUrl}
                                    alt={exp.title}
                                    loading="lazy"
                                    className="object-cover w-full h-full transition-transform duration-700 ease-in-out"
                                />

                                {exp.from_price && (
                                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-background/95 backdrop-blur-md text-foreground px-2 py-1 sm:px-2.5 text-[10px] uppercase tracking-wider font-bold shadow-lg border border-border/50 max-w-[90%] truncate text-right">
                                        From {exp.currency} {exp.from_price}
                                    </div>
                                )}
                            </div>

                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-serif text-lg leading-tight mb-2 line-clamp-2" title={exp.title}>
                                    {exp.title}
                                </h3>

                                {exp.tagline && (
                                    <p className="text-xs text-foreground/70 line-clamp-2 mb-3 leading-relaxed">
                                        {exp.tagline}
                                    </p>
                                )}

                                <div className="flex items-center justify-between mb-5 mt-auto">
                                    {exp.ratings?.average ? (
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-semibold">{exp.ratings.average.toFixed(1)}</span>
                                            <span className="text-[10px] text-foreground/50">({exp.ratings.total})</span>
                                        </div>
                                    ) : (
                                        <div className="text-[10px] uppercase text-foreground/50 tracking-widest">New</div>
                                    )}

                                    {exp.address?.city_name && (
                                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-foreground/60 truncate max-w-[120px]">
                                            <MapPin className="w-3 h-3 shrink-0" />
                                            <span className="truncate">{exp.address.city_name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2 border-t border-border/30">
                                    <a
                                        href={makeAffiliateLink(exp.experience_url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-bold uppercase tracking-widest py-3.5 flex items-center justify-center gap-2 shadow-md transition-all border border-primary/50 group/btn"
                                    >
                                        View Tickets
                                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}