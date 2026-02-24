"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Youtube, Sparkles, Loader2, ArrowRight, Video, FileText, X } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function VideoJourneyPage() {
    const router = useRouter();
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [status, setStatus] = useState<"idle" | "extracting" | "generating" | "redirecting" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    // Debug/Test Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [debugTranscript, setDebugTranscript] = useState("");
    const [debugLoading, setDebugLoading] = useState(false);
    const [debugError, setDebugError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!youtubeUrl.trim() || !youtubeUrl.includes("youtu")) return;

        setStatus("extracting");
        setErrorMessage("");

        try {
            const response = await fetch("/api/generate-from-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ youtubeUrl }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to generate plan");
            }

            setStatus("generating");
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
            setErrorMessage(error.message || "We had trouble analyzing that video. Ensure the video has closed captions/subtitles available.");
        }
    };

    const handleTestTranscript = async () => {
        if (!youtubeUrl.trim() || !youtubeUrl.includes("youtu")) return;

        setIsModalOpen(true);
        setDebugLoading(true);
        setDebugError("");
        setDebugTranscript("");

        try {
            const response = await fetch("/api/test-transcript", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ youtubeUrl }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch transcript.");
            }

            setDebugTranscript(data.transcript);
        } catch (error: any) {
            console.error(error);
            setDebugError(error.message);
        } finally {
            setDebugLoading(false);
        }
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center pt-24 pb-20 px-6">

                <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">

                    <div className="flex items-center justify-center h-16 w-16 bg-secondary/30 rounded-full mb-8 border border-border/50">
                        <Video className="w-6 h-6 text-primary" />
                    </div>

                    <span className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-4 block border border-primary/30 px-3 py-1 bg-primary/5">
                        Video to Itinerary
                    </span>

                    <h1 className="text-4xl md:text-5xl font-serif mb-6 text-center">
                        Turn Inspiration into Reality
                    </h1>

                    <p className="text-base md:text-lg font-light text-foreground/80 text-center max-w-xl mb-12 leading-relaxed">
                        Found the perfect travel vlog? Drop the YouTube link below, and our AI will extract the hidden gems, hotels, and itinerary into a complete, personalized NOMA journey.
                    </p>

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
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
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Extract Journey
                                    </>
                                ) : status === "extracting" ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Analyzing Video...
                                    </>
                                ) : status === "generating" ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Curating Vibe...
                                    </>
                                ) : (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Redirecting...
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Helper visual hints */}
                    <div className="mt-16 w-full pt-8 border-t border-border/50 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 mb-2">Step 01</p>
                            <p className="text-sm font-light">Find a vlog or travel guide on YouTube.</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 mb-2">Step 02</p>
                            <p className="text-sm font-light">We transcribe and analyze the creator's mentions.</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 mb-2">Step 03</p>
                            <p className="text-sm font-light">A bespoke, readable NOMA plan is generated.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* DEBUG TRANSCRIPT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

                    <div className="relative w-full max-w-3xl max-h-[85vh] bg-background border border-border/50 shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
                            <h3 className="font-serif text-xl tracking-wide flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Raw Transcript Output
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-foreground/50 hover:text-foreground p-1 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 text-sm font-light text-foreground/80 leading-relaxed space-y-4">
                            {debugLoading ? (
                                <div className="flex flex-col items-center justify-center h-40 text-foreground/50">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                                    <p className="uppercase tracking-widest text-xs font-medium">Fetching Transcript...</p>
                                </div>
                            ) : debugError ? (
                                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-none">
                                    <p className="font-semibold mb-1">Failed to fetch transcript:</p>
                                    <p>{debugError}</p>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap">
                                    {debugTranscript ? debugTranscript : "No transcript found."}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-border/50 bg-secondary/10 flex justify-end shrink-0">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-foreground text-background uppercase text-xs tracking-widest font-medium hover:bg-foreground/90 transition-all">
                                Close Inspector
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}