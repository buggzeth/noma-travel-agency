// app/api/tiqets/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("destination");

  if (!destination) {
    return NextResponse.json({ error: "Destination is required" }, { status: 400 });
  }

  try {
    const cleanDestination = destination.split(',')[0].trim();
    
    const headers = {
      "Authorization": `Token ${process.env.TIQETS_API_KEY}`, 
      "User-Agent": "NOMA-Travel-App/1.0"
    };

    // STEP 1: Resolve text destination to a Tiqets internal `city_id`
    // We use the /products endpoint because it properly supports free-text queries.
    const prodRes = await fetch(
      `https://api.tiqets.com/v2/products?query=${encodeURIComponent(cleanDestination)}&page_size=1`,
      { headers, next: { revalidate: 86400 } }
    );

    if (!prodRes.ok) throw new Error("Failed to search products");
    const prodData = await prodRes.json();

    const topProduct = prodData.products?.[0];
    
    // If Tiqets has literally zero products for this city, fail gracefully
    if (!topProduct || !topProduct.city_id) {
      return NextResponse.json({ experiences: [] });
    }

    const cityId = topProduct.city_id;

    // STEP 2: Fetch the beautiful Experiences using the exact city_id
    const expRes = await fetch(
      `https://api.tiqets.com/v2/experiences?city_id=${cityId}&page_size=12`,
      { headers, next: { revalidate: 86400 } }
    );

    if (!expRes.ok) throw new Error("Failed to fetch experiences");
    const expData = await expRes.json();

    return NextResponse.json(expData);

  } catch (error) {
    console.error("Tiqets API Error:", error);
    return NextResponse.json({ error: "Failed to load experiences" }, { status: 500 });
  }
}