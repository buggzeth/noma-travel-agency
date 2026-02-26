// app/actions/gemini.ts
"use server";

import { GoogleGenAI, Modality } from "@google/genai";
import { TravelPlan } from "@/components/home/AITravelPlanOverlay";

export async function createEphemeralToken(plan: TravelPlan) {
  const apiKey = process.env.GEMINI_FREE_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_FREE_API_KEY");

  const client = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    You are the NOMA AI Tour Guide, an exclusive, highly knowledgeable, and charismatic travel concierge.
    You are currently walking with the user on their trip to ${plan.destination}.
    Here is the summary of their trip: ${plan.summary}.
    Here are their daily journeys: ${JSON.stringify(plan.itinerary)}.
    
    RULES:
    - Keep responses brief, conversational, and natural. 1 to 3 sentences maximum.
    - If the user sends a photo, analyze it instantly and tell them a fascinating, obscure fact about what they are looking at.
    - If the system injects a location update (e.g., "USER LOCATION: Colosseum"), proactively introduce the location.
  `;

  const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const newSessionExpireTime = new Date(Date.now() + 1 * 60 * 1000).toISOString();

  const token = await client.authTokens.create({
    config: {
      uses: 1, 
      expireTime: expireTime,
      newSessionExpireTime: newSessionExpireTime,
      liveConnectConstraints: {
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          systemInstruction: { parts: [{ text: systemInstruction }] },
          responseModalities: [Modality.AUDIO],
          // --- NEW: Enable Transcriptions ---
          inputAudioTranscription: {}, 
          outputAudioTranscription: {}
        },
      },
      httpOptions: {
        apiVersion: "v1alpha",
      },
    },
  });

  return token.name;
}