// app/api/generate-from-video/route.ts
import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchTranscript } from "youtube-transcript-plus";

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
    const { youtubeUrl } = await req.json();

    if (!youtubeUrl) {
      throw new Error("YouTube URL is required.");
    }

    // 1. Fetch Transcript using the new package
    const transcriptRaw = await fetchTranscript(youtubeUrl);
    let transcriptText = transcriptRaw.map((t) => t.text).join(" ");
    
    // --- POST-PROCESSING ---
    // Clean up HTML entities and token-wasting tags
    transcriptText = transcriptText
      .replace(/&#39;/g, "'")       // Fix apostrophes
      .replace(/&quot;/g, '"')      // Fix double quotes
      .replace(/&amp;/g, "&")       // Fix ampersands
      .replace(/&lt;/g, "<")        // Fix less-than symbols
      .replace(/&gt;/g, ">")        // Fix greater-than symbols
      .replace(/\[Music\]/gi, "")   // Strip token-wasting [Music] tags from YouTube
      .replace(/\s+/g, " ")         // Collapse multiple spaces into a single space
      .trim();                      // Remove leading/trailing spaces
    // -----------------------

    // Safety check - trim transcript if it's ridiculously long
    const safeTranscriptText = transcriptText.slice(0, 30000);

    const today = new Date().toLocaleDateString();

    // 2. Build Enriched AI Prompt
    const prompt = `
      You are the NOMA Travel Agency AI Concierge, an expert, highly adaptable travel advisor crafting a bespoke journey based on a user's favorite travel video.
      Today's Date is: ${today}.
      
      Below is the raw transcript from a YouTube travel video the user just watched:
      <transcript>
      ${safeTranscriptText}
      </transcript>

      YOUR MISSION:
      Create a complete, luxurious NOMA-style travel itinerary by extracting the core events, attractions, and vibe from the video transcript, BUT supplementing and verifying all logistical data (especially prices) using your Google Search tool.

      INSTRUCTIONS (STRICTLY FOLLOW THESE):
      1. DESTINATION & VIBE: Identify the primary destination discussed. Craft a brief, engaging summary (max 2 sentences) that captures the specific energy of the video creator's trip.
      2. TRIP DURATION: Analyze the transcript to determine exactly how many days the creator spent on this trip. Structure your generated itinerary to match that exact length. If the duration is unclear from the video transcript, default to a realistic 3 to 5-day itinerary.
      3. REAL-TIME PRICING (USE GOOGLE SEARCH): Do NOT rely on prices mentioned in the video, as they are likely outdated. Use the Google Search tool to find current, up-to-date costs for the "estimatedCost" (e.g., "$2,000 - $3,500 total") and current hotel "pricePerNight".
      4. MAXIMIZE VIDEO ATTRACTIONS: Extract as many specific restaurants, events, excursions, and activities mentioned in the transcript as possible and weave them naturally into your daily itinerary.
      5. FILL THE GAPS (USE GOOGLE SEARCH): If the video misses certain details (e.g., only mentions dinners but no breakfasts, or doesn't mention a hotel), use Google Search to find highly-rated, culturally relevant luxury/boutique options to fill in the blanks.
      6. ACCOMMODATIONS: Recommend 2 fantastic accommodations. If the video mentioned hotels, use those. If not, use Google Search to find 2 boutique/luxury options fitting the vibe. Include 3 key amenities and up-to-date nightly rates.
      7. INSIDER TIPS & FAQS: For the "insiderTips" array, provide 4-5 tips. Mix specific "travel hacks" mentioned by the video creator with answers to common traveler FAQs (e.g., navigating local transit, tipping culture, or current seasonal weather advisories found via search).
      8. TONE & FORMAT: This user hates reading walls of text. Keep EVERYTHING short, sweet, and punchy. Maximum 1-2 sentences per description.

      Return ONLY valid JSON matching the exact schema requested.
    `;

    // 3. Generate Plan with Gemini (WITH GOOGLE SEARCH ENABLED)
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
    
    const planData = JSON.parse(text);

    // 4. Save to Supabase
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

    // Return plan & slug
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