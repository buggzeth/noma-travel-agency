// app/api/generate-plan/route.ts
import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

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
      4. Recommend 2 accommodations matching their exact requested style (${accommodation}) that realistically fit the ${budget} budget. If they have children, ensure the recommendations are child-friendly. List 3 key amenities for each.
      5. Construct a daily itinerary matching their preferred pace (${pace}) and budget. Ensure dietary requirements (${dietary}) and accessibility (${accessibility}) are respected in activity and dining choices.
      6. Provide 3 quick insider tips relevant to their trip type, preferences, or additional requests.

      Return ONLY valid JSON matching the exact schema requested.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseJsonSchema: travelPlanSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response generated.");

    return new Response(text, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[Generate Plan API Error]:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}