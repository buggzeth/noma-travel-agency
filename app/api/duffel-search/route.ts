// app/api/duffel-search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Duffel } from "@duffel/api";

export async function POST(req: NextRequest) {
  try {
    const token = process.env.DUFFEL_ACCESS_TOKEN;
    if (!token) {
      throw new Error("Duffel access token not configured.");
    }

    const duffel = new Duffel({ token });
    const isTestMode = token.includes("test");

    const body = await req.json();
    const { originIata, destinationIata, destinationCity, departureDate, returnDate, adults, rooms } = body;

    // 1. Geocode the destination city for the Stays API
    let lat = 0;
    let lng = 0;
    if (process.env.GOOGLE_API_KEY) {
      const geoRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destinationCity)}&key=${process.env.GOOGLE_API_KEY}`
      );
      const geoData = await geoRes.json();
      if (geoData.results?.[0]?.geometry?.location) {
        lat = geoData.results[0].geometry.location.lat;
        lng = geoData.results[0].geometry.location.lng;
      }
    }

    // Fallback to dummy coordinates if geocoding fails in test mode
    if (lat === 0 && lng === 0 && isTestMode) {
      lat = 1; 
      lng = 1;
    }

    const passengers = Array.from({ length: Number(adults) }).map(() => ({ type: "adult" as const }));
    let flightOffers = [];
    
    // 2. Fetch Flights (Using SDK)
    try {
      const flightReq = await duffel.offerRequests.create({
        return_offers: true,
        slices: [
          { origin: originIata, destination: destinationIata, departure_date: departureDate },
          { origin: destinationIata, destination: originIata, departure_date: returnDate }
        ] as any,
        passengers: passengers as any,
        cabin_class: "economy",
      });
      
      flightOffers = (flightReq as any).data?.offers || (flightReq as any).offers || [];
    } catch (err) {
      console.error("[Duffel Flights Error]", err);
    }

    // 3. Fetch Stays (Using native fetch to bypass SDK opaque errors)
    let stayResults = [];
    if (lat !== 0 && lng !== 0) {
      // OVERRIDE: If using a test token, we MUST use Duffel's magic test coordinates
      const searchLat = isTestMode ? -24.38 : lat;
      const searchLng = isTestMode ? -128.32 : lng;

      try {
        const staysRes = await fetch("https://api.duffel.com/stays/search", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Duffel-Version": "v2",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              rooms: Number(rooms),
              location: {
                radius: 5, // Kept to 5km as per Duffel docs
                geographic_coordinates: { latitude: searchLat, longitude: searchLng }
              },
              check_in_date: departureDate,
              check_out_date: returnDate,
              guests: passengers
            }
          })
        });

        if (!staysRes.ok) {
          const errText = await staysRes.text();
          console.error("[Duffel Stays API Raw Error]:", errText);
        } else {
          const staysData = await staysRes.json();
          stayResults = staysData.data?.results || [];
        }
      } catch (err) {
        console.error("[Duffel Stays Network Error]", err);
      }
    }

    return NextResponse.json({
      flights: flightOffers,
      stays: stayResults
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}