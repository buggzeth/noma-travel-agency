// app/api/generate-plan/route.ts
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
          name: { type: "string" },
          description: { type: "string" },
          pricePerNight: { type: "string" },
          amenities: { type: "array", items: { type: "string" } }
        },
        required: ["name", "description", "pricePerNight", "amenities"]
      }
    },
    insiderTips: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["destination", "summary", "estimatedCost", "bestTimeToVisit", "itinerary", "accommodations", "insiderTips"]
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { 
      destination, timing, days, 
      adults, children, 
      tripType, pace, accommodation, budget, 
      dietary, accessibility, additionalRequests, 
      quiz 
    } = body;

    const today = new Date().toLocaleDateString();
    
    // ====================================================================
    // STEP 1: Generate the Creative Plan (Gemini 3)
    // ====================================================================
    const prompt = `
      You are the NOMA Travel Agency AI Concierge, an expert, highly adaptable travel advisor tailoring a trip for a modern traveler.
      Today's Date is: ${today}.

      CLIENT PROFILE & LOGISTICS:
      - Destination: ${destination}
      - Dates/Timing: ${timing}
      - Duration: ${days} days
      - Travelers: ${adults} Adults, ${children} Children (Under 18)
      - Trip Purpose: ${tripType}
      - Preferred Pace: ${pace}
      - Budget Level: ${budget}
      - Accommodation Style: ${accommodation}
      
      SPECIAL REQUIREMENTS & REQUESTS:
      - Dietary Restrictions: ${dietary || "None specified"}
      - Accessibility/Mobility Needs: ${accessibility || "None specified"}
      - Additional Client Requests: "${additionalRequests || "None specified"}"

      VIBE CHECK (Yes/No Preferences):
      - Off-the-beaten-path hidden gems? ${quiz.hiddenGems ? "Yes" : "No"}
      - Wellness & spa days? ${quiz.wellness ? "Yes" : "No"}
      - Gastronomy & fine dining focus? ${quiz.culinary ? "Yes" : "No"}
      - High-adrenaline adventure? ${quiz.adventure ? "Yes" : "No"}
      - Local nightlife/clubbing? ${quiz.nightlife ? "Yes" : "No"}
      - Eco-friendly/Sustainable travel? ${quiz.sustainability ? "Yes" : "No"}
      - Deep cultural/historical dives? ${quiz.culture ? "Yes" : "No"}

      INSTRUCTIONS (STRICTLY CONCISE):
      1. This user hates reading walls of text. Keep EVERYTHING short, sweet, and punchy. Maximum 1-2 sentences per description.
      2. Provide a brief, engaging summary (max 2 sentences) that reflects their specific inputs, budget, and any additional requests.
      3. Provide a realistic estimated cost (e.g., "$1,500 - $2,500 total") tailored strictly to their requested "${budget}" tier.
      4. Recommend 2 accommodations matching their exact requested style (${accommodation}) that realistically fit the ${budget} budget.
      5. Construct a daily itinerary matching their preferred pace (${pace}). Each section (morning, afternoon, evening) MUST mention ONE specific, real, named place (e.g., "Osteria Francescana" not "a sustainable restaurant"). DO NOT provide multiple choices for activities or restaurants in a single section; pick the absolute best one.
      6. Ensure dietary requirements (${dietary}) and accessibility (${accessibility}) are respected in activity and dining choices.
      7. Provide 3 quick insider tips relevant to their trip type, preferences, or additional requests.

      Return ONLY valid JSON matching the exact schema requested.
    `;

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
    if (!text1) throw new Error("No response generated in Step 1.");
    let planData = JSON.parse(text1);

    // ====================================================================
    // STEP 2: Ground Locations with Google Maps (Gemini 2.5 Flash)
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

    // ====================================================================
    // STEP 3: Save & Return
    // ====================================================================
    const cleanDest = planData.destination.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const randomHash = Math.random().toString(36).substring(2, 7);
    const slug = `${cleanDest}-${body.days}-days-${randomHash}`;

    const { error } = await supabase.from('travel_plans').insert({
      slug, destination: planData.destination, plan_data: planData
    });

    return new Response(JSON.stringify({ ...planData, slug }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}