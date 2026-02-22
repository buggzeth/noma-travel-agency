// components/home/AITravelPlanOverlay.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Loader2, History, MapPin, Calendar, Users, Check, Plus, DollarSign } from "lucide-react";

export type TravelPlan = {
  destination: string;
  summary: string;
  estimatedCost: string;
  bestTimeToVisit: string;
  itinerary: { day: number; title: string; morning: string; afternoon: string; evening: string }[];
  accommodations: { name: string; description: string; pricePerNight: string; amenities: string[] }[];
  insiderTips: string[];
};

export type PlanSession = {
  id: string;
  title: string;
  plan: TravelPlan;
  createdAt: number;
};

interface AITravelPlanOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialDestination: string;
  clearInitialDestination: () => void;
}

const STORAGE_KEY = "noma_travel_plans";

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

export default function AITravelPlanOverlay({
  isOpen,
  onClose,
  initialDestination,
  clearInitialDestination,
}: AITravelPlanOverlayProps) {
  const [sessions, setSessions] = useState<PlanSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);
  const [appState, setAppState] = useState<"form" | "loading" | "result">("form");
  const [currentPlan, setCurrentPlan] = useState<TravelPlan | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    destination: "",
    timing: "",
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

  // Load History
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse travel plan history");
      }
    }
  }, []);

  // Handle Initial Destination passed from Hero
  useEffect(() => {
    if (isOpen && initialDestination) {
      setFormData((prev) => ({ ...prev, destination: initialDestination }));
      setAppState("form");
      clearInitialDestination();
    }
  }, [isOpen, initialDestination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.destination.trim() || !formData.timing.trim()) return;

    setAppState("loading");
    
    try {
      // Format arrays into comma-separated strings for the backend
      const payload = {
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

      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to generate plan");
      
      const planData: TravelPlan = await response.json();
      setCurrentPlan(planData);
      
      const newSession: PlanSession = {
        id: Date.now().toString(),
        title: `${planData.destination} (${formData.days} Days)`,
        plan: planData,
        createdAt: Date.now(),
      };
      
      const updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
      setActiveSessionId(newSession.id);
      
      setAppState("result");

      // Clear the form after successful generation
      setFormData({ 
        destination: "", timing: "", days: "5", 
        adults: "2", children: "0", tripType: "Leisure / Vacation",
        pace: "Balanced & Flexible", budget: "Moderate / Mid-Range", accommodation: "Boutique Hotel",
        dietary: [], accessibility: [], showOtherDietary: false, otherDietary: "", 
        showOtherAccessibility: false, otherAccessibility: "", additionalRequests: ""
      });
      setQuizAnswers({
        hiddenGems: null, wellness: null, culinary: null, adventure: null,
        nightlife: null, sustainability: null, culture: null
      });

    } catch (error) {
      console.error(error);
      setAppState("form"); 
      alert("There was an error generating your travel plan. Please try again.");
    }
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setActiveSessionId(session.id);
      setCurrentPlan(session.plan);
      setAppState("result");
      setShowHistoryMobile(false);
    }
  };

  const startNewPlan = () => {
    setActiveSessionId(null);
    setCurrentPlan(null);
    setAppState("form");
    setFormData({ 
      destination: "", timing: "", days: "5", 
      adults: "2", children: "0", tripType: "Leisure / Vacation",
      pace: "Balanced & Flexible", budget: "Moderate / Mid-Range", accommodation: "Boutique Hotel",
      dietary: [], accessibility: [], showOtherDietary: false, otherDietary: "", 
      showOtherAccessibility: false, otherAccessibility: "", additionalRequests: ""
    });
    setQuizAnswers({
      hiddenGems: null, wellness: null, culinary: null, adventure: null,
      nightlife: null, sustainability: null, culture: null
    });
    setShowHistoryMobile(false);
  };

  const handleClose = () => {
    setShowHistoryMobile(false);
    onClose();
  };

  const setQuizValue = (key: QuizKeys, value: boolean) => {
    setQuizAnswers(prev => ({ ...prev, [key]: value }));
  };

  const hasSessions = sessions.length > 0;

  return (
    <div className={`fixed top-0 left-0 z-[100] w-full h-[100dvh] bg-background flex overflow-hidden transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"}`}>
      
      {/* Mobile Backdrop for Sidebar */}
      {showHistoryMobile && (
        <div className="md:hidden absolute inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setShowHistoryMobile(false)} />
      )}

      {/* Sidebar / History Panel */}
      <div className={`absolute top-0 left-0 md:relative z-40 h-[100dvh] w-[80vw] max-w-[320px] md:w-80 bg-background md:bg-secondary/10 border-r border-border/50 flex-col transition-transform duration-300 md:translate-x-0 ${showHistoryMobile ? "translate-x-0 shadow-2xl md:shadow-none" : "-translate-x-full"} ${!hasSessions ? "hidden" : "flex"}`}>
        <div className="p-6 border-b border-border/50 flex justify-between items-center bg-background">
          <h2 className="font-serif text-xl tracking-wide">Itineraries</h2>
          <button onClick={() => setShowHistoryMobile(false)} className="md:hidden text-foreground/50 hover:text-foreground p-2 -mr-2">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar bg-background md:bg-transparent">
          <button onClick={startNewPlan} className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border/50 text-sm font-medium hover:bg-foreground hover:text-background transition-colors">
            <Plus className="h-4 w-4" />
            NEW TRAVEL PLAN
          </button>
          
          <div className="pt-4 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold px-2 mb-2">Previous Plans</p>
            {sessions.map((session) => (
              <button key={session.id} onClick={() => loadSession(session.id)} className={`w-full text-left flex items-center gap-3 px-4 py-3 border text-sm transition-colors ${activeSessionId === session.id ? "border-foreground bg-foreground/5" : "border-transparent hover:border-border/50"}`}>
                <MapPin className="h-4 w-4 shrink-0 text-foreground/50" />
                <span className="truncate font-light text-foreground/80">{session.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-[100dvh] w-full relative z-10 bg-background overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center p-4 md:p-6 border-b border-border/50 bg-background/95 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            {hasSessions && (
              <button onClick={() => setShowHistoryMobile(true)} className="md:hidden text-foreground/70 hover:text-foreground p-1">
                <History className="h-5 w-5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-serif text-xl md:text-2xl tracking-wide text-foreground">
                Journey Architect
              </h3>
            </div>
          </div>
          <button onClick={handleClose} className="text-foreground/50 hover:text-foreground transition-colors p-2 border border-transparent hover:border-border/50">
            <X className="h-6 w-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto hide-scrollbar relative">
          
          {/* STATE: LOADING */}
          {appState === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-6" />
              <h2 className="text-2xl font-serif text-center mb-2">Curating Your Vibe</h2>
              <p className="text-foreground/60 font-light text-center max-w-sm">
                Consulting the NOMA global network to craft a perfectly personalized aesthetic...
              </p>
            </div>
          )}

          {/* STATE: INTAKE FORM (BUZZFEED QUIZ STYLE) */}
          {appState === "form" && (
            <div className="max-w-2xl mx-auto px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center mb-12">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">The Vibe Check</span>
                <h1 className="text-4xl md:text-5xl font-serif mb-4">Design Your Escape</h1>
                <p className="text-foreground/60 font-light">
                  Tell us what you're craving. We'll handle the logistics.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                
                {/* 1. Core Logistics Section */}
                <div className="bg-secondary/20 p-6 md:p-8 border border-border/50 space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" /> Where are we heading?</label>
                    <input required type="text" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} placeholder="e.g. Kyoto, Japan or The Amalfi Coast" className="w-full bg-transparent border-b border-border/50 px-0 py-2 text-xl font-serif focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/30" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> When are we packing our bags?</label>
                    <input required type="text" value={formData.timing} onChange={e => setFormData({...formData, timing: e.target.value})} placeholder="e.g. Next Summer, Mid-October, or specific dates" className="w-full bg-transparent border-b border-border/50 px-0 py-2 text-lg focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/30 font-light" />
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-2">
                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-widest font-semibold">Total Days</label>
                      <input required type="number" min="1" max="60" value={formData.days} onChange={e => setFormData({...formData, days: e.target.value})} className="w-full bg-transparent border-b border-border/50 px-0 py-2 text-lg focus:outline-none focus:border-foreground transition-colors" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2"><Users className="h-4 w-4" /> Adults</label>
                      <input required type="number" min="1" max="20" value={formData.adults} onChange={e => setFormData({...formData, adults: e.target.value})} className="w-full bg-transparent border-b border-border/50 px-0 py-2 text-lg focus:outline-none focus:border-foreground transition-colors" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-widest font-semibold">Children</label>
                      <input required type="number" min="0" max="20" value={formData.children} onChange={e => setFormData({...formData, children: e.target.value})} className="w-full bg-transparent border-b border-border/50 px-0 py-2 text-lg focus:outline-none focus:border-foreground transition-colors" />
                    </div>
                  </div>
                </div>

                {/* 2. Travel Style & Budget */}
                <div className="bg-secondary/10 p-6 md:p-8 border border-border/50 space-y-8">
                  <h3 className="text-sm font-semibold uppercase tracking-widest border-b border-border/50 pb-3 mb-4">Travel Style & Budget</h3>
                  
                  <div className="flex flex-col gap-8">
                    {/* Trip Purpose */}
                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-widest font-medium text-foreground/70 block">Trip Purpose</label>
                      <div className="flex flex-wrap gap-2">
                        {["Leisure / Vacation", "Honeymoon / Romance", "Family Getaway", "Solo Adventure", "Business & Leisure"].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setFormData({ ...formData, tripType: option })}
                            className={`px-4 py-2 text-xs tracking-wider transition-all border ${
                              formData.tripType === option
                                ? "bg-foreground text-background border-foreground"
                                : "bg-transparent text-foreground border-border hover:border-foreground/50"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ideal Pace */}
                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-widest font-medium text-foreground/70 block">Ideal Pace</label>
                      <div className="flex flex-wrap gap-2">
                        {["Fast & Action-Packed", "Balanced & Flexible", "Slow & Relaxed"].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setFormData({ ...formData, pace: option })}
                            className={`px-4 py-2 text-xs tracking-wider transition-all border ${
                              formData.pace === option
                                ? "bg-foreground text-background border-foreground"
                                : "bg-transparent text-foreground border-border hover:border-foreground/50"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget Level */}
                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-widest font-medium text-foreground/70 block">Budget Level</label>
                      <div className="flex flex-wrap gap-2">
                        {["Budget / Backpacker", "Moderate / Mid-Range", "Premium / Upscale", "Luxury 5-Star", "Ultra-Luxury / Blank Check"].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setFormData({ ...formData, budget: option })}
                            className={`px-4 py-2 text-xs tracking-wider transition-all border ${
                              formData.budget === option
                                ? "bg-foreground text-background border-foreground"
                                : "bg-transparent text-foreground border-border hover:border-foreground/50"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accommodation */}
                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-widest font-medium text-foreground/70 block">Accommodation</label>
                      <div className="flex flex-wrap gap-2">
                        {["Hostel / Guesthouse", "Standard Hotel", "Boutique Hotel", "Large Resort", "Private Rental / Airbnb", "Luxury 5-Star"].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setFormData({ ...formData, accommodation: option })}
                            className={`px-4 py-2 text-xs tracking-wider transition-all border ${
                              formData.accommodation === option
                                ? "bg-foreground text-background border-foreground"
                                : "bg-transparent text-foreground border-border hover:border-foreground/50"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Special Requirements */}
                <div className="bg-secondary/10 p-6 md:p-8 border border-border/50 space-y-8">
                  <h3 className="text-sm font-semibold uppercase tracking-widest border-b border-border/50 pb-3 mb-4">Special Requirements</h3>
                  
                  <div className="flex flex-col gap-8">
                    {/* Dietary Restrictions */}
                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-widest font-medium text-foreground/70 block">Dietary Restrictions</label>
                      <div className="flex flex-wrap gap-2">
                        {["Vegan", "Vegetarian", "Gluten-Free", "Halal", "Kosher", "Dairy-Free", "Nut Allergy"].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              const newDietary = formData.dietary.includes(option)
                                ? formData.dietary.filter((d) => d !== option)
                                : [...formData.dietary, option];
                              setFormData({ ...formData, dietary: newDietary });
                            }}
                            className={`px-4 py-2 text-xs tracking-wider transition-all border ${
                              formData.dietary.includes(option)
                                ? "bg-foreground text-background border-foreground"
                                : "bg-transparent text-foreground border-border hover:border-foreground/50"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, showOtherDietary: !formData.showOtherDietary })}
                          className={`px-4 py-2 text-xs tracking-wider transition-all border ${
                            formData.showOtherDietary
                              ? "bg-foreground text-background border-foreground"
                              : "bg-transparent text-foreground border-border hover:border-foreground/50"
                          }`}
                        >
                          Other
                        </button>
                      </div>
                      {formData.showOtherDietary && (
                        <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                          <input
                            type="text"
                            value={formData.otherDietary}
                            onChange={(e) => setFormData({ ...formData, otherDietary: e.target.value })}
                            placeholder="Please specify your dietary needs..."
                            className="w-full bg-transparent border-b border-border/50 px-0 py-2 text-base focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/30 font-light"
                          />
                        </div>
                      )}
                    </div>

                    {/* Accessibility Needs */}
                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-widest font-medium text-foreground/70 block">Accessibility Needs</label>
                      <div className="flex flex-wrap gap-2">
                        {["Wheelchair Accessible", "Ground Floor Room", "Elevator Required", "Service Animal"].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              const newAccess = formData.accessibility.includes(option)
                                ? formData.accessibility.filter((a) => a !== option)
                                : [...formData.accessibility, option];
                              setFormData({ ...formData, accessibility: newAccess });
                            }}
                            className={`px-4 py-2 text-xs tracking-wider transition-all border ${
                              formData.accessibility.includes(option)
                                ? "bg-foreground text-background border-foreground"
                                : "bg-transparent text-foreground border-border hover:border-foreground/50"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, showOtherAccessibility: !formData.showOtherAccessibility })}
                          className={`px-4 py-2 text-xs tracking-wider transition-all border ${
                            formData.showOtherAccessibility
                              ? "bg-foreground text-background border-foreground"
                              : "bg-transparent text-foreground border-border hover:border-foreground/50"
                          }`}
                        >
                          Other
                        </button>
                      </div>
                      {formData.showOtherAccessibility && (
                        <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                          <input
                            type="text"
                            value={formData.otherAccessibility}
                            onChange={(e) => setFormData({ ...formData, otherAccessibility: e.target.value })}
                            placeholder="Please specify your accessibility needs..."
                            className="w-full bg-transparent border-b border-border/50 px-0 py-2 text-base focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/30 font-light"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. The Vibe Check (Yes/No Questions) */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-semibold uppercase tracking-widest mb-6">The Vibe Check</h3>
                  {QUIZ_QUESTIONS.map(({ id, label }) => (
                    <div key={id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-border/30">
                      <label className="text-sm md:text-base font-light text-foreground/90">{label}</label>
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          type="button" 
                          onClick={() => setQuizValue(id, true)}
                          className={`px-6 py-2 text-xs uppercase tracking-widest transition-all ${quizAnswers[id] === true ? "bg-foreground text-background border-foreground" : "bg-transparent text-foreground border border-border hover:border-foreground/50"}`}
                        >
                          Yes
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setQuizValue(id, false)}
                          className={`px-6 py-2 text-xs uppercase tracking-widest transition-all ${quizAnswers[id] === false ? "bg-foreground text-background border-foreground" : "bg-transparent text-foreground border border-border hover:border-foreground/50"}`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 5. Freeform Requests */}
                <div className="pt-6 space-y-4">
                  <label className="text-sm font-semibold uppercase tracking-widest block">Requests & Comments</label>
                  <p className="text-xs font-light text-foreground/60 mb-2">Celebrating a special occasion? Have a specific hotel in mind? Let us know below.</p>
                  <textarea 
                    rows={4}
                    value={formData.additionalRequests}
                    onChange={e => setFormData({...formData, additionalRequests: e.target.value})}
                    placeholder="Type any specific dreams or requirements here..."
                    className="w-full bg-secondary/10 border border-border/50 p-4 text-base focus:outline-none focus:border-foreground transition-colors placeholder:text-foreground/30 font-light resize-none"
                  />
                </div>

                <button type="submit" className="w-full bg-primary text-primary-foreground py-5 uppercase tracking-widest text-sm font-medium hover:bg-primary/90 transition-colors mt-8 shadow-lg">
                  Curate My Journey
                </button>
              </form>
            </div>
          )}

          {/* STATE: RESULT */}
          {appState === "result" && currentPlan && (
            <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              {/* Header Info */}
              <div className="text-center mb-16">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 block">Your Tailored Escape</span>
                <h1 className="text-5xl md:text-6xl font-serif mb-6">{currentPlan.destination}</h1>
                <p className="text-lg md:text-xl font-light text-foreground/80 max-w-2xl mx-auto leading-relaxed">
                  {currentPlan.summary}
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  <div className="flex items-center gap-2 bg-secondary/30 px-5 py-2.5 border border-border/50">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="text-sm tracking-wide font-medium">{currentPlan.estimatedCost}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/30 px-5 py-2.5 border border-border/50">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm tracking-wide font-medium">Ideal Time: {currentPlan.bestTimeToVisit}</span>
                  </div>
                </div>
              </div>

              {/* Accommodations */}
              <div className="mb-16">
                <h2 className="text-2xl md:text-3xl font-serif mb-8 flex items-center gap-3 border-b border-border/50 pb-4">
                  Where to Drop Your Bags
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentPlan.accommodations.map((acc, idx) => (
                    <div key={idx} className="border border-border/50 p-6 bg-card hover:border-foreground/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-serif pr-4">{acc.name}</h3>
                        <span className="text-xs bg-foreground text-background px-2 py-1 uppercase tracking-wider whitespace-nowrap">{acc.pricePerNight}</span>
                      </div>
                      <p className="text-sm font-light text-foreground/70 mb-6 leading-relaxed">{acc.description}</p>
                      <div className="space-y-3">
                        <p className="text-[10px] uppercase tracking-widest font-semibold text-foreground/50">Standout Perks</p>
                        <div className="flex flex-col gap-2">
                          {acc.amenities.map((amenity, i) => (
                            <span key={i} className="text-sm font-light text-foreground/90 flex items-start gap-2">
                              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5"/> 
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Itinerary */}
              <div className="mb-16">
                <h2 className="text-2xl md:text-3xl font-serif mb-8 border-b border-border/50 pb-4">The Agenda</h2>
                <div className="space-y-8">
                  {currentPlan.itinerary.map((day) => (
                    <div key={day.day} className="flex flex-col md:flex-row gap-4 md:gap-12 relative group">
                      <div className="md:w-32 shrink-0 pt-1">
                        <span className="text-sm font-semibold uppercase tracking-widest text-primary">Day {day.day}</span>
                      </div>
                      <div className="flex-1 pb-8 border-b border-border/50 group-last:border-0 group-last:pb-0">
                        <h3 className="text-xl md:text-2xl font-serif mb-5">{day.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-secondary/10 p-4 border border-border/30">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 block mb-2">Morning</span>
                            <p className="text-sm font-light leading-relaxed">{day.morning}</p>
                          </div>
                          <div className="bg-secondary/10 p-4 border border-border/30">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 block mb-2">Afternoon</span>
                            <p className="text-sm font-light leading-relaxed">{day.afternoon}</p>
                          </div>
                          <div className="bg-secondary/10 p-4 border border-border/30">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 block mb-2">Evening</span>
                            <p className="text-sm font-light leading-relaxed">{day.evening}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insider Tips */}
              <div className="bg-primary/5 border border-primary/20 p-8 md:p-10">
                <h2 className="text-2xl font-serif mb-6 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Local Cheat Codes
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {currentPlan.insiderTips.map((tip, idx) => (
                    <li key={idx} className="flex flex-col gap-2">
                      <div className="h-1 w-8 bg-primary/50 rounded-full mb-2" />
                      <span className="text-sm font-light leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}