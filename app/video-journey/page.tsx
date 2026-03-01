// app/video-journey/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Youtube, Sparkles, Loader2, Video, FileText, X, MapPin, Calendar, Users, Check, Plus, DollarSign, ArrowUpRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const QUIZ_QUESTIONS = [
    { id: "hiddenGems", label: "Do you prefer off-the-beaten-path hidden gems?" },
    { id: "wellness", label: "Should we incorporate wellness & spa days?" },
    { id: "culinary", label: "Is fine dining and gastronomy a main priority?" },
    { id: "adventure", label: "Are you looking for high-adrenaline adventure?" },
    { id: "nightlife", label: "Do you want to experience the local nightlife scene?" },
    { id: "sustainability", label: "Is eco-friendly & sustainable travel important?" },
    { id: "culture", label: "Are deep cultural & historical dives a must?" },
] as const;

type QuizKeys = typeof QUIZ_QUESTIONS[number]["id"];

function getYouTubeId(url: string) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export default function VideoJourneyPage() {
    const router = useRouter();
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [status, setStatus] = useState<"idle" | "extracting" | "form" | "generating" | "redirecting" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [extractedTranscript, setExtractedTranscript] = useState("");
    const videoId = getYouTubeId(youtubeUrl);

    // --- FORM STATE ---
    const [formData, setFormData] = useState({
        departDate: "",
        returnDate: "",
        days: "5",
        adults: "2",
        children: "0",
        tripType: "Leisure / Vacation",
        pace: "Balanced & Flexible",
        budget: "Moderate / Mid-Range",
        accommodation: "Boutique Hotel",
        dietary: [] as string[],
        accessibility: [] as string[],
        showOtherDietary: false,
        otherDietary: "",
        showOtherAccessibility: false,
        otherAccessibility: "",
        additionalRequests: "",
    });

    const [quizAnswers, setQuizAnswers] = useState<Record<QuizKeys, boolean | null>>({
        hiddenGems: null, wellness: null, culinary: null, adventure: null,
        nightlife: null, sustainability: null, culture: null,
    });

    const updateDates = (field: "departDate" | "returnDate", value: string) => {
        const newFormData = { ...formData, [field]: value };
        if (newFormData.departDate && newFormData.returnDate) {
            const start = new Date(newFormData.departDate);
            const end = new Date(newFormData.returnDate);
            const diff = end.getTime() - start.getTime();
            const calculatedDays = Math.ceil(diff / (1000 * 3600 * 24)) + 1;
            newFormData.days = calculatedDays > 0 ? calculatedDays.toString() : "1";
        }
        setFormData(newFormData);
    };

    const setQuizValue = (key: QuizKeys, value: boolean) => {
        setQuizAnswers(prev => ({ ...prev, [key]: value }));
    };

    // --- STEP 1: EXTRACT URL TRANSCRIPT ---
    const handleExtract = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!youtubeUrl.trim() || !youtubeUrl.includes("youtu")) return;

        setStatus("extracting");
        setErrorMessage("");

        try {
            // Hit the main generation endpoint, but flag it to STOP after extraction
            const response = await fetch("/api/generate-from-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ youtubeUrl, action: "extract" }),
            });

            // Prevent crash if server accidentally returns an HTML page (like a 404 or a 500 block)
            const textResponse = await response.text();
            let data;
            try {
                data = JSON.parse(textResponse);
            } catch (err) {
                console.error("Non-JSON Server Response:", textResponse.substring(0, 200));
                throw new Error("Received an unexpected HTML response from the server. Check console.");
            }

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch video transcript");
            }

            if (!data.transcript) {
                throw new Error("Transcript returned empty.");
            }

            setExtractedTranscript(data.transcript);
            setStatus("form"); // Move to Personalization Step
        } catch (error: any) {
            console.error(error);
            setStatus("error");
            setErrorMessage(error.message || "We had trouble analyzing that video. Ensure the video has closed captions/subtitles available.");
        }
    };

    // --- STEP 2: GENERATE PLAN WITH PREFERENCES ---
    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("generating");

        try {
            const payload = {
                youtubeUrl,
                transcript: extractedTranscript,
                ...formData,
                dietary: [
                    ...formData.dietary,
                    formData.showOtherDietary ? formData.otherDietary.trim() : ""
                ].filter(Boolean).join(", "),
                accessibility: [
                    ...formData.accessibility,
                    formData.showOtherAccessibility ? formData.otherAccessibility.trim() : ""
                ].filter(Boolean).join(", "),
                quiz: quizAnswers
            };

            const response = await fetch("/api/generate-from-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to generate plan");
            }

            const planData = await response.json();

            if (planData.slug) {
                setStatus("redirecting");
                router.push(`/plans/${planData.slug}`);
            } else {
                throw new Error("No URL generated for this plan.");
            }
        } catch (error: any) {
            console.error(error);
            setStatus("error");
            setErrorMessage(error.message || "Something went wrong generating your trip.");
        }
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center pt-24 pb-20 px-6">

                {status !== "form" && (
                    <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center justify-center h-16 w-16 bg-secondary/30 rounded-full mb-8 border border-border/50">
                            <Video className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-4 block border border-primary/30 px-3 py-1 bg-primary/5">
                            Video to Itinerary
                        </span>
                        <h1 className="text-4xl md:text-5xl font-serif mb-6 text-center">Turn Inspiration into Reality</h1>
                        <p className="text-base md:text-lg font-light text-foreground/80 text-center max-w-xl mb-12 leading-relaxed">
                            Found the perfect travel vlog? Drop the YouTube link below, and our AI will extract the hidden gems into a personalized NOMA journey.
                        </p>

                        <form onSubmit={handleExtract} className="w-full flex flex-col gap-4">
                            <div className="relative flex items-center bg-secondary/10 border border-border/50 focus-within:border-foreground/50 transition-colors p-1">
                                <div className="pl-4 pr-2 text-foreground/50">
                                    <Youtube className="w-5 h-5" />
                                </div>
                                <input
                                    type="url"
                                    required
                                    disabled={status !== "idle" && status !== "error"}
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    placeholder="Paste YouTube video URL here..."
                                    className="flex-1 bg-transparent px-2 py-4 text-base font-light text-foreground focus:outline-none placeholder:text-foreground/40"
                                />
                            </div>

                            {status === "error" && (
                                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 text-sm font-light">
                                    {errorMessage}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                <button
                                    type="submit"
                                    disabled={(status !== "idle" && status !== "error") || !youtubeUrl}
                                    className="flex-1 flex items-center justify-center gap-3 px-6 py-5 bg-foreground text-background uppercase text-xs tracking-widest font-medium hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {status === "idle" || status === "error" ? (
                                        <><Sparkles className="w-4 h-4" /> Extract Journey</>
                                    ) : status === "extracting" ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Video...</>
                                    ) : status === "generating" ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Curating Vibe...</>
                                    ) : (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {status === "form" && (
                    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="text-center mb-12">
                            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">Video Analyzed</span>
                            <h1 className="text-4xl md:text-5xl font-serif mb-4">Personalize the Escape</h1>
                            <p className="text-foreground/60 font-light mb-8">
                                We've extracted the video details. Now adjust the logistics to fit your specific style and budget.
                            </p>

                            {/* NEW: Compact YouTube Video Embed */}
                            {videoId && (
                                <div className="w-full max-w-sm mx-auto aspect-video rounded-lg overflow-hidden border border-border/50 shadow-sm mb-4">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${videoId}`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleGenerate} className="space-y-10">
                            <div className="bg-secondary/20 p-6 md:p-8 border border-border/50 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Depart</label>
                                        <input required type="date" value={formData.departDate} onChange={e => updateDates("departDate", e.target.value)} className="w-full bg-transparent border-b border-border/50 px-0 py-2 text-lg focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/30 font-light" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Return</label>
                                        <input required type="date" value={formData.returnDate} onChange={e => updateDates("returnDate", e.target.value)} className="w-full bg-transparent border-b border-border/50 px-0 py-2 text-lg focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/30 font-light" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6 pt-2">
                                    <div className="space-y-3">
                                        <label className="text-xs uppercase tracking-widest font-semibold">Total Days</label>
                                        <input required type="number" value={formData.days} readOnly className="w-full bg-transparent border-b border-border/50 px-0 py-2 text-lg focus:outline-none focus:border-foreground transition-colors opacity-70 cursor-not-allowed" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2"><Users className="h-4 w-4" /> Adults</label>
                                        <input required type="number" min="1" max="20" value={formData.adults} onChange={e => setFormData({ ...formData, adults: e.target.value })} className="w-full bg-transparent border-b border-border/50 px-0 py-2 text-lg focus:outline-none focus:border-foreground transition-colors" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs uppercase tracking-widest font-semibold">Children</label>
                                        <input required type="number" min="0" max="20" value={formData.children} onChange={e => setFormData({ ...formData, children: e.target.value })} className="w-full bg-transparent border-b border-border/50 px-0 py-2 text-lg focus:outline-none focus:border-foreground transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-secondary/10 p-6 md:p-8 border border-border/50 space-y-8">
                                <h3 className="text-sm font-semibold uppercase tracking-widest border-b border-border/50 pb-3 mb-4">Travel Style & Budget</h3>

                                <div className="flex flex-col gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs uppercase tracking-widest font-medium text-foreground/70 block">Trip Purpose</label>
                                        <div className="flex flex-wrap gap-2">
                                            {["Leisure / Vacation", "Honeymoon / Romance", "Family Getaway", "Solo Adventure", "Business & Leisure"].map((option) => (
                                                <button key={option} type="button" onClick={() => setFormData({ ...formData, tripType: option })} className={`px-4 py-2 text-xs tracking-wider transition-all border ${formData.tripType === option ? "bg-foreground text-background border-foreground" : "bg-transparent text-foreground border-border hover:border-foreground/50"}`}>{option}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs uppercase tracking-widest font-medium text-foreground/70 block">Ideal Pace</label>
                                        <div className="flex flex-wrap gap-2">
                                            {["Fast & Action-Packed", "Balanced & Flexible", "Slow & Relaxed"].map((option) => (
                                                <button key={option} type="button" onClick={() => setFormData({ ...formData, pace: option })} className={`px-4 py-2 text-xs tracking-wider transition-all border ${formData.pace === option ? "bg-foreground text-background border-foreground" : "bg-transparent text-foreground border-border hover:border-foreground/50"}`}>{option}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs uppercase tracking-widest font-medium text-foreground/70 block">Budget Level</label>
                                        <div className="flex flex-wrap gap-2">
                                            {["Budget / Backpacker", "Moderate / Mid-Range", "Premium / Upscale", "Luxury 5-Star", "Ultra-Luxury / Blank Check"].map((option) => (
                                                <button key={option} type="button" onClick={() => setFormData({ ...formData, budget: option })} className={`px-4 py-2 text-xs tracking-wider transition-all border ${formData.budget === option ? "bg-foreground text-background border-foreground" : "bg-transparent text-foreground border-border hover:border-foreground/50"}`}>{option}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs uppercase tracking-widest font-medium text-foreground/70 block">Accommodation Vibe</label>
                                        <div className="flex flex-wrap gap-2">
                                            {["Hostel / Guesthouse", "Standard Hotel", "Boutique Hotel", "Large Resort", "Private Rental / Airbnb", "Luxury 5-Star"].map((option) => (
                                                <button key={option} type="button" onClick={() => setFormData({ ...formData, accommodation: option })} className={`px-4 py-2 text-xs tracking-wider transition-all border ${formData.accommodation === option ? "bg-foreground text-background border-foreground" : "bg-transparent text-foreground border-border hover:border-foreground/50"}`}>{option}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-secondary/10 p-6 md:p-8 border border-border/50 space-y-8">
                                <h3 className="text-sm font-semibold uppercase tracking-widest border-b border-border/50 pb-3 mb-4">Special Requirements</h3>
                                <div className="flex flex-col gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs uppercase tracking-widest font-medium text-foreground/70 block">Dietary Restrictions</label>
                                        <div className="flex flex-wrap gap-2">
                                            {["Vegan", "Vegetarian", "Gluten-Free", "Halal", "Kosher", "Dairy-Free", "Nut Allergy"].map((option) => (
                                                <button key={option} type="button" onClick={() => setFormData({ ...formData, dietary: formData.dietary.includes(option) ? formData.dietary.filter((d) => d !== option) : [...formData.dietary, option] })} className={`px-4 py-2 text-xs tracking-wider transition-all border ${formData.dietary.includes(option) ? "bg-foreground text-background border-foreground" : "bg-transparent text-foreground border-border hover:border-foreground/50"}`}>{option}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs uppercase tracking-widest font-medium text-foreground/70 block">Accessibility Needs</label>
                                        <div className="flex flex-wrap gap-2">
                                            {["Wheelchair Accessible", "Ground Floor Room", "Elevator Required", "Service Animal"].map((option) => (
                                                <button key={option} type="button" onClick={() => setFormData({ ...formData, accessibility: formData.accessibility.includes(option) ? formData.accessibility.filter((a) => a !== option) : [...formData.accessibility, option] })} className={`px-4 py-2 text-xs tracking-wider transition-all border ${formData.accessibility.includes(option) ? "bg-foreground text-background border-foreground" : "bg-transparent text-foreground border-border hover:border-foreground/50"}`}>{option}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <h3 className="text-sm font-semibold uppercase tracking-widest mb-6">The Vibe Check</h3>
                                {QUIZ_QUESTIONS.map(({ id, label }) => (
                                    <div key={id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-border/30">
                                        <label className="text-sm md:text-base font-light text-foreground/90">{label}</label>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button type="button" onClick={() => setQuizValue(id, true)} className={`px-6 py-2 text-xs uppercase tracking-widest transition-all ${quizAnswers[id] === true ? "bg-foreground text-background border-foreground" : "bg-transparent text-foreground border border-border hover:border-foreground/50"}`}>Yes</button>
                                            <button type="button" onClick={() => setQuizValue(id, false)} className={`px-6 py-2 text-xs uppercase tracking-widest transition-all ${quizAnswers[id] === false ? "bg-foreground text-background border-foreground" : "bg-transparent text-foreground border border-border hover:border-foreground/50"}`}>No</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-5 uppercase tracking-widest text-sm font-medium hover:bg-primary/90 transition-colors mt-8 shadow-lg">
                                <Sparkles className="w-5 h-5" /> Curate My Journey
                            </button>
                        </form>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}