// components/guide/tabs/TodayTab.tsx
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { MapPin, Clock, Utensils } from "lucide-react";
import Map, { Marker, Source, Layer, GeolocateControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import 'mapbox-gl/dist/mapbox-gl.css';

import { TravelPlan } from "../../home/AITravelPlanOverlay";

export default function TodayTab({ plan }: { plan: TravelPlan }) {
    const mapRef = useRef<MapRef>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [activeIdx, setActiveIdx] = useState<number | null>(null);

    const todayItinerary = plan.itinerary?.[0];
    const isNewFormat = !!(todayItinerary?.activities && todayItinerary?.meals);

    // 1. Build chronological event list
    const timelineEvents = useMemo(() => {
        const events: any[] = [];
        if (isNewFormat && todayItinerary) {
            if (todayItinerary.meals?.breakfast) {
                events.push({ type: 'meal', label: 'Breakfast', desc: todayItinerary.meals.breakfast, meta: todayItinerary.location_metadata?.meals?.breakfast });
            }
            if (todayItinerary.activities?.[0]) {
                events.push({ type: 'activity', label: todayItinerary.activities[0].title, desc: todayItinerary.activities[0].description, time: todayItinerary.activities[0].estimatedTime, meta: todayItinerary.location_metadata?.activities?.[0] });
            }
            if (todayItinerary.meals?.lunch) {
                events.push({ type: 'meal', label: 'Lunch', desc: todayItinerary.meals.lunch, meta: todayItinerary.location_metadata?.meals?.lunch });
            }
            if (todayItinerary.activities?.[1]) {
                events.push({ type: 'activity', label: todayItinerary.activities[1].title, desc: todayItinerary.activities[1].description, time: todayItinerary.activities[1].estimatedTime, meta: todayItinerary.location_metadata?.activities?.[1] });
            }
            if (todayItinerary.activities?.[2]) {
                events.push({ type: 'activity', label: todayItinerary.activities[2].title, desc: todayItinerary.activities[2].description, time: todayItinerary.activities[2].estimatedTime, meta: todayItinerary.location_metadata?.activities?.[2] });
            }
            if (todayItinerary.meals?.dinner) {
                events.push({ type: 'meal', label: 'Dinner', desc: todayItinerary.meals.dinner, meta: todayItinerary.location_metadata?.meals?.dinner });
            }
        }
        return events;
    }, [todayItinerary, isNewFormat]);

    // 2. Filter valid events for mapping & extract coordinates
    const mapEvents = useMemo(() => {
        return timelineEvents.map((event, idx) => ({ ...event, originalIdx: idx }))
            .filter(e => e.meta?.lat && e.meta?.lng);
    }, [timelineEvents]);

    // 3. Calculate Map Bounds purely from coordinates
    const bounds = useMemo(() => {
        if (mapEvents.length === 0) return null;

        const lats = mapEvents.map(e => e.meta.lat);
        const lngs = mapEvents.map(e => e.meta.lng);

        // [minLng, minLat, maxLng, maxLat]
        return [
            Math.min(...lngs), Math.min(...lats),
            Math.max(...lngs), Math.max(...lats)
        ] as [number, number, number, number];
    }, [mapEvents]);

    // 4. Fetch actual walking navigation route from Mapbox Directions API
    const [routeGeoJSON, setRouteGeoJSON] = useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);

    useEffect(() => {
        async function fetchRoute() {
            if (mapEvents.length < 2) {
                setRouteGeoJSON(null);
                return;
            }

            // The Mapbox walking profile supports a maximum of 25 coordinates per request.
            // Slicing here to prevent API errors on highly packed itineraries.
            const validEvents = mapEvents.slice(0, 25);
            const coordinatesString = validEvents.map(e => `${e.meta.lng},${e.meta.lat}`).join(';');
            const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

            if (!token) return;

            try {
                const response = await fetch(
                    `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinatesString}?geometries=geojson&access_token=${token}`
                );
                const data = await response.json();

                if (data.routes && data.routes[0]) {
                    // Set the returned exact path geometry
                    setRouteGeoJSON({
                        type: 'Feature',
                        properties: {},
                        geometry: data.routes[0].geometry
                    });
                }
            } catch (error) {
                console.error("Error fetching directions from Mapbox:", error);

                // Fallback to straight lines if the API request fails
                setRouteGeoJSON({
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: mapEvents.map(e => [e.meta.lng, e.meta.lat])
                    }
                });
            }
        }

        fetchRoute();
    }, [mapEvents]);

    // 5. Interactivity Handlers
    const handleMarkerClick = (index: number) => {
        setActiveIdx(index);
        itemRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleTimelineClick = (index: number, lat?: number, lng?: number) => {
        setActiveIdx(index);
        if (lat && lng && mapRef.current) {
            mapRef.current.flyTo({ center: [lng, lat], zoom: 16, duration: 1500 });
        }
    };

    return (
        <div className="flex flex-col h-full w-full overflow-hidden bg-background">
            {/* TOP HALF: MAPBOX */}
            <div className="h-[40vh] w-full shrink-0 relative bg-muted/20 border-b border-border">
                {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground p-6 text-center">
                        Missing Mapbox Token. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env file.
                    </div>
                ) : (
                    <Map
                        ref={mapRef}
                        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                        initialViewState={bounds ? {
                            bounds: bounds,
                            fitBoundsOptions: { padding: 50, maxZoom: 15 }
                        } : { longitude: 0, latitude: 0, zoom: 2 }}
                        mapStyle="mapbox://styles/mapbox/dark-v11"
                        interactiveLayerIds={['route']}
                    >
                        {/* Current User Location GPS Dot */}
                        <GeolocateControl
                            position="top-right"
                            positionOptions={{ enableHighAccuracy: true }}
                            trackUserLocation={true}
                            showUserHeading={true}
                        />

                        {/* Navigation Route Line */}
                        {routeGeoJSON && (
                            <Source id="route-source" type="geojson" data={routeGeoJSON}>
                                <Layer
                                    id="route-layer"
                                    type="line"
                                    paint={{
                                        'line-color': '#3b82f6', // Tailwind blue-500
                                        'line-width': 4,         // Slightly thicker for a path
                                        'line-dasharray': [1, 1.5] // Adjusted dashed visual for walking paths
                                    }}
                                />
                            </Source>
                        )}

                        {/* Event Markers */}
                        {mapEvents.map((event, i) => (
                            <Marker
                                key={`marker-${event.originalIdx}`}
                                longitude={event.meta.lng}
                                latitude={event.meta.lat}
                                anchor="bottom"
                                onClick={e => {
                                    e.originalEvent.stopPropagation();
                                    handleMarkerClick(event.originalIdx);
                                }}
                            >
                                <div className={`cursor-pointer transition-all duration-300 transform ${activeIdx === event.originalIdx ? 'scale-125 z-50' : 'scale-100 z-10'}`}>
                                    {/* Map Pin UI */}
                                    <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-lg ${activeIdx === event.originalIdx ? 'bg-primary border-background text-primary-foreground' : 'bg-background border-primary text-foreground'}`}>
                                        <span className="text-xs font-bold">{i + 1}</span>
                                    </div>
                                    <div className={`mx-auto w-1 h-3 ${activeIdx === event.originalIdx ? 'bg-primary' : 'bg-background border-x border-primary'}`}></div>
                                </div>
                            </Marker>
                        ))}
                    </Map>
                )}
            </div>

            {/* BOTTOM HALF: TIMELINE */}
            <div className="flex-1 overflow-y-auto hide-scrollbar p-6 pb-12 animate-in fade-in duration-500">
                <header className="mb-8">
                    <span className="bg-foreground text-background text-[9px] px-3 py-1 uppercase tracking-[0.2em] font-bold rounded-sm">
                        Day {todayItinerary?.day || 1}
                    </span>
                    <h2 className="text-3xl font-serif mt-4 text-foreground">Today's Journey</h2>
                    <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm font-light tracking-wide">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {plan.destination}
                    </p>
                </header>

                <div className="relative pl-6 border-l-2 border-primary/20 ml-2 space-y-8">
                    {isNewFormat ? (
                        timelineEvents.map((event, idx) => {
                            const isMapEvent = !!(event.meta?.lat && event.meta?.lng);
                            const sequenceNum = mapEvents.findIndex(e => e.originalIdx === idx) + 1;

                            return (
                                <div
                                    key={idx}
                                    ref={(el) => { itemRefs.current[idx] = el; }}
                                    onClick={() => handleTimelineClick(idx, event.meta?.lat, event.meta?.lng)}
                                    className={`relative transition-all duration-300 ${isMapEvent ? 'cursor-pointer' : ''}`}
                                >
                                    <div className={`absolute -left-[35px] top-1 flex items-center justify-center w-6 h-6 rounded-full border-2 bg-background z-10 transition-colors ${activeIdx === idx ? 'border-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 'border-primary/40'}`}>
                                        {sequenceNum > 0 ? (
                                            <span className={`text-[10px] font-bold ${activeIdx === idx ? 'text-primary' : 'text-foreground'}`}>{sequenceNum}</span>
                                        ) : (
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mb-2">
                                        {event.type === 'activity' ? <Clock className="w-3.5 h-3.5 text-primary" /> : <Utensils className="w-3.5 h-3.5 text-primary" />}
                                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${activeIdx === idx ? 'text-primary' : 'text-primary/70'}`}>
                                            {event.label} {event.time && `- ${event.time}`}
                                        </span>
                                    </div>

                                    <div className={`bg-card border rounded-lg p-5 shadow-sm transition-all duration-300 ${activeIdx === idx ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                                        <h4 className="font-serif text-lg mb-2 text-foreground">{event.meta?.name || event.label}</h4>
                                        <p className="text-sm text-foreground/70 leading-relaxed font-light">
                                            {event.desc || "Unassigned"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md border border-border">
                            This trip was generated with an older version of NOMA and does not support live maps.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}