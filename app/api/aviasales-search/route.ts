// app/api/aviasales-search/route.ts
import { NextRequest, NextResponse } from "next/server";

// Helper function to fetch from Aviasales
async function fetchAviasalesData(params: URLSearchParams) {
  const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params.toString()}`;
  console.log("Fetching Aviasales URL:", url.replace(/token=[^&]+/, "token=HIDDEN"));
  
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      "Accept-Encoding": "gzip, deflate",
      "Accept": "application/json"
    }
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const token = process.env.TRAVELPAYOUTS_API_TOKEN;
    if (!token) throw new Error("Travelpayouts API token not configured.");

    const body = await req.json();
    const { originIata, destinationIata, departureDate, returnDate } = body;

    if (!originIata || !destinationIata || !departureDate) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    // 1. First Attempt: Exact Dates
    const params = new URLSearchParams({
      origin: originIata,
      destination: destinationIata,
      departure_at: departureDate, // e.g., "2024-10-15"
      unique: 'false',
      sorting: 'price',
      direct: 'false',
      currency: 'usd',
      limit: '10',
      page: '1',
      token: token
    });

    if (returnDate) {
      params.append("return_at", returnDate);
      params.append("one_way", "false");
    } else {
      params.append("one_way", "true");
    }

    let flightData = await fetchAviasalesData(params);
    let flights = (flightData.success && Array.isArray(flightData.data)) ? flightData.data : [];

    // 2. Fallback Attempt: Search the whole month if exact date is empty
    if (flights.length === 0) {
      console.log("Exact date cache missed. Trying month-wide search...");
      
      // Convert "YYYY-MM-DD" to "YYYY-MM"
      const departureMonth = departureDate.substring(0, 7); 
      params.set("departure_at", departureMonth);
      
      if (returnDate) {
        const returnMonth = returnDate.substring(0, 7);
        params.set("return_at", returnMonth);
      }

      flightData = await fetchAviasalesData(params);
      flights = (flightData.success && Array.isArray(flightData.data)) ? flightData.data : [];
    }

    // 3. Last Resort Fallback Attempt: One-Way Month search 
    // (Roundtrips are much less likely to be cached than one-ways)
    if (flights.length === 0 && returnDate) {
      console.log("Roundtrip month cache missed. Trying One-Way month search...");
      params.delete("return_at");
      params.set("one_way", "true");
      
      flightData = await fetchAviasalesData(params);
      flights = (flightData.success && Array.isArray(flightData.data)) ? flightData.data : [];
    }

    return NextResponse.json({
      flights: flights,
      stays: [] 
    });

  } catch (error: any) {
    console.error("Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}