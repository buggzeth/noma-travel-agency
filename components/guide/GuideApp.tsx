// components/guide/GuideApp.tsx
"use client";

import { useState } from "react";
import { TravelPlan } from "../home/AITravelPlanOverlay";
import LiveTourGuide from "./LiveTourGuide";
import BottomNav from "./BottomNav";

// Tabs
import WelcomeTab from "./tabs/WelcomeTab";
import TransitTab from "./tabs/TransitTab";
import TodayTab from "./tabs/TodayTab";
import ItineraryTab from "./tabs/ItineraryTab";
import MoreTab from "./tabs/MoreTab";

export type TabType = "welcome" | "transit" | "today" | "itinerary" | "guide" | "more" | "passes";

interface GuideAppProps {
    plan: TravelPlan;
}

export default function GuideApp({ plan }: GuideAppProps) {
    const [isTripStarted, setIsTripStarted] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("welcome");

    const handleBeginTrip = () => {
        setIsTripStarted(true);
        setActiveTab("today");
    };

    return (
        <div className="flex flex-col h-[100dvh] w-full bg-background overflow-hidden text-foreground font-sans">

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 relative w-full overflow-hidden">

                {/* PRE-TRIP */}
                {!isTripStarted && activeTab === "welcome" && (
                    <WelcomeTab plan={plan} onBegin={handleBeginTrip} />
                )}
                {!isTripStarted && activeTab === "transit" && (
                    <TransitTab plan={plan} />
                )}

                {/* ON-TRIP */}
                {isTripStarted && (
                    <>
                        {activeTab === "today" && <TodayTab plan={plan} />}
                        {activeTab === "itinerary" && <ItineraryTab plan={plan} />}
                        {activeTab === "more" && <MoreTab />}
                        {activeTab === "passes" && <MoreTab />} {/* Routes to same view for now */}

                        {/* AI Guide Tab (Hidden instead of unmounted to keep session alive) */}
                        <div className={`h-full w-full bg-foreground text-background ${activeTab === "guide" ? "block" : "hidden"}`}>
                            <LiveTourGuide plan={plan} />
                        </div>
                    </>
                )}
            </div>

            {/* BOTTOM NAVIGATION */}
            <BottomNav
                isTripStarted={isTripStarted}
                activeTab={activeTab}
                onTabSelect={setActiveTab}
            />
        </div>
    );
}