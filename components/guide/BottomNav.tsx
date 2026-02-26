// components/guide/BottomNav.tsx
"use client";

import { Plane, Map, List, Radio, MapPin, Calendar, Ticket } from "lucide-react";
import { TabType } from "./GuideApp";

interface BottomNavProps {
    isTripStarted: boolean;
    activeTab: TabType;
    onTabSelect: (tab: TabType) => void;
}

export default function BottomNav({ isTripStarted, activeTab, onTabSelect }: BottomNavProps) {
    return (
        <nav className="shrink-0 w-full h-[72px] bg-background border-t border-border z-50 pb-safe">
            <div className="flex flex-row h-full w-full">
                {!isTripStarted ? (
                    <>
                        <NavButton icon={<Map strokeWidth={1.5} />} label="Welcome" isActive={activeTab === "welcome"} onClick={() => onTabSelect("welcome")} />
                        <NavButton icon={<Plane strokeWidth={1.5} />} label="Transit" isActive={activeTab === "transit"} onClick={() => onTabSelect("transit")} />
                    </>
                ) : (
                    <>
                        <NavButton icon={<MapPin strokeWidth={1.5} />} label="Today" isActive={activeTab === "today"} onClick={() => onTabSelect("today")} />
                        <NavButton icon={<Calendar strokeWidth={1.5} />} label="Itinerary" isActive={activeTab === "itinerary"} onClick={() => onTabSelect("itinerary")} />
                        <NavButton icon={<Radio strokeWidth={1.5} className={activeTab === "guide" ? "animate-pulse" : ""} />} label="AI Tour" isActive={activeTab === "guide"} onClick={() => onTabSelect("guide")} isPrimary />
                        <NavButton icon={<List strokeWidth={1.5} />} label="More" isActive={activeTab === "more"} onClick={() => onTabSelect("more")} />
                        <NavButton icon={<Ticket strokeWidth={1.5} />} label="Passes" isActive={activeTab === "passes"} onClick={() => onTabSelect("passes")} />
                    </>
                )}
            </div>
        </nav>
    );
}

function NavButton({
    icon, label, isActive, onClick, isPrimary = false
}: {
    icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, isPrimary?: boolean
}) {
    return (
        <button
            onClick={onClick}
            // 1. w-0 forces the flex item to ignore content size, ensuring equal width.
            // 2. min-w-0 prevents flex items from overflowing container.
            // 3. p-0 removes default button padding that might interfere.
            className={`flex-1 w-0 min-w-0 p-0 flex flex-col items-center justify-center h-full gap-1 font-sans transition-all duration-200
        ${isPrimary
                    ? (isActive ? "bg-primary text-primary-foreground" : "bg-foreground text-background hover:bg-foreground/90")
                    : (isActive ? "text-primary border-t-2 border-primary bg-primary/5" : "text-muted-foreground border-t-2 border-transparent hover:text-foreground hover:bg-foreground/5")
                }
      `}
        >
            <div className={`${isActive && !isPrimary ? "-mt-0.5" : ""} transition-all scale-90 sm:scale-100`}>
                {icon}
            </div>

            {/* 
               1. text-[8px] for mobile, text-[9px] for sm+.
               2. leading-none is crucial: standard line-height often adds extra height that makes text look bigger/spaced out.
               3. truncate ensures it fits if the screen is tiny.
            */}
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] font-bold w-full truncate text-center leading-none">
                {label}
            </span>
        </button>
    );
}