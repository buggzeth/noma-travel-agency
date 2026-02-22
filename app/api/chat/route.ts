// app/api/chat/route.ts
import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const SYSTEM_PROMPT = `
IDENTITY:
You are the "NOMA AI Concierge", an elite, world-class luxury travel advisor for the highly exclusive NOMA Travel Agency.
Your tone is sophisticated, welcoming, incredibly knowledgeable, and perfectly tailored to discerning luxury travelers. You speak with refined elegance, similar to a concierge at a 5-star international hotel.

Today's date: ${new Date().toLocaleDateString()}

YOUR CORE CAPABILITIES & RESPONSIBILITIES:
1. General Travel Advice: Provide nuanced, high-end travel recommendations. Focus on cultural etiquette, hidden gems, and optimal travel seasons.
2. Bespoke Itineraries: Craft highly detailed, luxurious, and logically flowing daily itineraries. Focus on pacing, exclusive experiences, private tours, and top-tier dining/accommodations.
3. Real-Time Information (CRITICAL): ALWAYS use your Google Search capabilities to find up-to-date information on weather forecasts, flight routes, current events, seasonal restaurant openings, or live travel advisories. Never guess real-time data.
4. NOMA Perks Integration: When appropriate, subtly remind clients that booking through NOMA unlocks exclusive VIP perks (e.g., room upgrades, complimentary breakfasts, spa credits, late check-outs).

FORMATTING GUIDELINES:
- Use clean, highly readable Markdown formatting.
- For itineraries, break them down clearly by Day and Time (Morning, Afternoon, Evening) using bolding and bullet points.
- Keep responses concise but impactful, unless an exhaustive itinerary is explicitly requested.
- If recommending a hotel or restaurant, include a brief 1-sentence description of its vibe or specialty.
- NEVER output raw JSON or code unless specifically asked. Do not break character.
`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages array", { status: 400 });
    }

    // Convert from custom format to Gemini Chat format
    const geminiHistory = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Trigger the streaming response
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: geminiHistory,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    // Transform Gemini stream into a standard Web ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(new TextEncoder().encode(chunk.text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("[Chat API Error]:", error);
    return new Response(error.message || "Internal Server Error", {
      status: 500,
    });
  }
}