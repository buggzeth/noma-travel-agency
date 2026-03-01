// app/api/generate-from-video/route.ts
import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const travelPlanSchema = {
  type: "object",
  properties: {
    destination: { type: "string" },
    summary: { type: "string" },
    departDate: { type: "string" },
    returnDate: { type: "string" },
    estimatedCost: { type: "string" },
    bestTimeToVisit: { type: "string" },
    itinerary: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "number" },
          title: { type: "string" },
          morning: { type: "string" },
          afternoon: { type: "string" },
          evening: { type: "string" },
        },
        required: ["day", "title", "morning", "afternoon", "evening"]
      }
    },
    accommodations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tier: { type: "string" },
          description: { type: "string" },
          estimatedPricePerNight: { type: "string" }
        },
        required: ["tier", "description", "estimatedPricePerNight"]
      }
    },
    insiderTips: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["destination", "summary", "departDate", "returnDate", "estimatedCost", "bestTimeToVisit", "itinerary", "accommodations", "insiderTips"]
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      youtubeUrl, transcript, action,
      departDate, returnDate, days, 
      adults, children, tripType, pace, accommodation, 
      budget, dietary, accessibility, additionalRequests, quiz 
    } = body;

    if (!youtubeUrl) {
      throw new Error("YouTube URL is required.");
    }

    let videoText = "";

    // 1. Fetch Transcript Data
    if (transcript) {
      videoText = transcript;
    } else {
      const transcriberUrl = process.env.TRANSCRIBER_API_URL;
      
      // Fetch with Cloudflare Tunnel bypass headers
      const vmResponse = await fetch(`${transcriberUrl}/transcript?url=${encodeURIComponent(youtubeUrl)}`, {
        headers: {
          "Bypass-Tunnel-Reminder": "true", // Crucial for trycloudflare.com
          "User-Agent": "NomaTravelBot/1.0"
        }
      });

      // Prevent JSON parsing crash if we receive an HTML error page
      const contentType = vmResponse.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        const errorHtml = await vmResponse.text();
        console.error("Received HTML instead of JSON:", errorHtml.substring(0, 200));
        throw new Error("Transcriber API returned an HTML page. Please ensure the Python backend is running.");
      }

      if (!vmResponse.ok) {
        throw new Error("Failed to analyze video content. Please try another video.");
      }

      const videoDataRaw = await vmResponse.json();

      if (!Array.isArray(videoDataRaw) || videoDataRaw.length === 0) {
        throw new Error("Video content is empty or unavailable for analysis.");
      }

      videoText = videoDataRaw.map((t: any) => t.text).join(" ");
    }
    
    // --- POST-PROCESSING ---
    let safeVideoText = videoText.slice(0, 30000);

    safeVideoText = safeVideoText
      .replace(/&#39;/g, "'")       
      .replace(/&quot;/g, '"')      
      .replace(/&amp;/g, "&")       
      .replace(/&lt;/g, "<")        
      .replace(/&gt;/g, ">")        
      .replace(/\[Music\]/gi, "")   
      .replace(/\s+/g, " ")         
      .trim();                      
    // -----------------------

    // IF THIS IS JUST STEP 1 (EXTRACTION), RETURN EARLY
    if (action === "extract") {
      return new Response(JSON.stringify({ transcript: safeVideoText }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Build Enriched AI Prompt blending Video data + Personalization
    const today = new Date().toLocaleDateString();

    const prompt = `
      You are the NOMA Travel Agency AI Concierge, an expert travel advisor crafting a bespoke journey.
      Today's Date is: ${today}.
      
      Below is the raw transcript extracted from a YouTube travel video the user just watched for inspiration:
      <transcript>
      ${safeVideoText}
      </transcript>

      CLIENT PROFILE & LOGISTICS:
      - Destination: Infer strictly from the video content
      - Travel Dates: ${departDate || "Recommend dates"} to ${returnDate || ""}
      - Duration: ${days || "Infer from video"} days
      - Travelers: ${adults || 2} Adults, ${children || 0} Children
      - Trip Purpose: ${tripType || "Leisure"}
      - Preferred Pace: ${pace || "Balanced"}
      - Budget Level: ${budget || "Moderate"}
      - Ideal Accommodation Vibe: ${accommodation || "Boutique Hotel"}
      
      SPECIAL REQUIREMENTS & REQUESTS:
      - Dietary Restrictions: ${dietary || "None specified"}
      - Accessibility/Mobility Needs: ${accessibility || "None specified"}
      - Additional Client Requests: "${additionalRequests || "None specified"}"

      VIBE CHECK (Yes/No Preferences):
      - Off-the-beaten-path hidden gems? ${quiz?.hiddenGems ? "Yes" : "No"}
      - Wellness & spa days? ${quiz?.wellness ? "Yes" : "No"}
      - Gastronomy & fine dining focus? ${quiz?.culinary ? "Yes" : "No"}
      - High-adrenaline adventure? ${quiz?.adventure ? "Yes" : "No"}
      - Local nightlife/clubbing? ${quiz?.nightlife ? "Yes" : "No"}
      - Eco-friendly/Sustainable travel? ${quiz?.sustainability ? "Yes" : "No"}
      - Deep cultural/historical dives? ${quiz?.culture ? "Yes" : "No"}

      YOUR MISSION:
      Create a complete, luxurious NOMA-style travel itinerary by extracting the core events, attractions, and vibe from the video data, BUT tailoring it entirely to the user's specific profile, dates, and budget using your Google Search tool.

      INSTRUCTIONS (STRICTLY FOLLOW THESE):
      1. DESTINATION & VIBE: Identify the primary destination strictly from the video content. Craft a brief, engaging summary (max 2 sentences).
      2. REAL-TIME PRICING (USE GOOGLE SEARCH): Use Google Search to find current, up-to-date costs for the "estimatedCost" matching their specified Budget Level (e.g., "${budget}").
      3. MAXIMIZE VIDEO ATTRACTIONS + USER PREFS: Extract as many specific restaurants, events, and activities mentioned in the video as possible. If the video misses details or doesn't align with their dietary (${dietary}), accessibility (${accessibility}), or budget constraints, use Google Search to find highly-rated luxury/boutique alternatives to fill the gaps.
      4. ITINERARY RULES: Match the exact duration requested (${days} days). Fill the itinerary strictly with exploring, dining, and activities matching their Preferred Pace (${pace}). Assume transit logistics are handled.
      5. ACCOMMODATIONS: Provide exactly 3 tiers of accommodation options ('Budget', 'Mid-Tier', 'Luxury') for the general destination area. Include estimated average price per night and ensure they reflect the Ideal Accommodation Vibe (${accommodation}).
      6. INSIDER TIPS: Provide 4-5 tips. Mix specific "travel hacks" from the video creator with answers to their explicit Custom Requests.
      7. TONE & FORMAT: Keep EVERYTHING short, sweet, and punchy. Maximum 1-2 sentences per description.

      Return ONLY valid JSON matching the exact schema requested.
    `;

    // 3. Generate Plan with Gemini (WITH GOOGLE SEARCH ENABLED)
    const response1 = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseJsonSchema: travelPlanSchema,
        temperature: 0.7,
      },
    });

    const text1 = response1.text;
    if (!text1) throw new Error("No response generated.");
    let planData = JSON.parse(text1);

    // ====================================================================
    // STEP 4: Ground Locations with Google Maps (Gemini 2.5 Flash)
    // ====================================================================
    const mappingPrompt = `
      You are a precise geospatial mapping assistant. 
      Here is the daily itinerary for ${planData.destination}:
      
      ${JSON.stringify(planData.itinerary, null, 2)}

      TASK: 
      1. Digest each section (morning, afternoon, evening) of each day separately.
      2. For each section, use Google Maps to find the exact geographical coordinates (latitude and longitude) of the specific, named location mentioned.
      3. Determine an appropriate geofence radius in meters (e.g., 50 for a specific building/restaurant, 150 for a large park or plaza).
      4. Provide the exact name of the location you found coordinates for in the "name" property.
      
      OUTPUT FORMAT (STRICT):
      You must return ONLY a raw, valid JSON array. DO NOT wrap the response in \`\`\`json markdown blocks. DO NOT include any conversational text. 
      The JSON array must contain the exact same itinerary objects you received, but with a new "location_metadata" object added to each item.
      
      Example structure for each item:
      {
        "day": 1,
        "title": "Heart of the City",
        "morning": "Tour the Colosseum and the Roman Forum.",
        "afternoon": "Lunch at Roscioli Salumeria con Cucina followed by a visit to the Pantheon.",
        "evening": "Dine at Armando al Pantheon.",
        "location_metadata": {
          "morning": {
            "name": "The Colosseum",
            "lat": 41.8902,
            "lng": 12.4922,
            "radius_meters": 100
          },
          "afternoon": {
            "name": "Roscioli Salumeria con Cucina",
            "lat": 41.8943,
            "lng": 12.4735,
            "radius_meters": 50
          },
          "evening": {
            "name": "Armando al Pantheon",
            "lat": 41.8996,
            "lng": 12.4768,
            "radius_meters": 50
          }
        }
      }
    `;

    try {
      const response2 = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: mappingPrompt,
        config: {
          tools: [{ googleMaps: {} }],
          temperature: 0.1,
        },
      });

      if (response2.text) {
        let cleanText = response2.text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        const mappedItinerary = JSON.parse(cleanText);
        
        if (Array.isArray(mappedItinerary) && mappedItinerary.length > 0) {
           planData.itinerary = mappedItinerary;
        } else {
           console.warn("Mapped itinerary is not a valid array, keeping original.");
        }
      }
    } catch (mapError) {
      console.error("[Maps Grounding Error]: Proceeding without coordinates.", mapError);
    }

    planData.youtubeUrl = youtubeUrl;

    // ====================================================================
    // STEP 5: Save & Return
    // ====================================================================
    const cleanDest = planData.destination.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const randomHash = Math.random().toString(36).substring(2, 7);
    const durationDays = planData.itinerary?.length || 5;
    const slug = `${cleanDest}-${durationDays}-days-${randomHash}`;

    const { error } = await supabase.from('travel_plans').insert({
      slug,
      destination: planData.destination,
      plan_data: planData
    });

    if (error) {
      console.error("[Supabase Insert Error]:", error);
    }

    return new Response(JSON.stringify({ ...planData, slug }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[Generate Video Plan API Error]:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}