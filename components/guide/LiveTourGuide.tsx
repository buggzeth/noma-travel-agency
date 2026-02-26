// components/guide/LiveTourGuide.tsx
"use client";

import { useEffect, useState, useRef } from "react";
// --- Added Modality Import ---
import { GoogleGenAI, Modality } from "@google/genai";
import { getDistance } from "geolib";
import { Camera, Mic, MicOff, MapPin, Loader2, StopCircle, X, MessageSquareText } from "lucide-react";
import { TravelPlan } from "../home/AITravelPlanOverlay";
import { createEphemeralToken } from "@/app/actions/gemini";

interface LiveTourGuideProps {
  plan: TravelPlan;
}

interface Transcript {
  id: number;
  role: "user" | "ai";
  text: string;
}

export default function LiveTourGuide({ plan }: LiveTourGuideProps) {
  const lastPosRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const [triggeredZones, setTriggeredZones] = useState<string[]>([]);

  // Connection & UI States
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);

  // Persistent Refs (Fixes Stale Closures in Audio Callback)
  const isConnectedRef = useRef(false);
  const isConnectingRef = useRef(false);
  const sessionRef = useRef<any>(null);
  const sessionHandleRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeAiTranscriptIdRef = useRef<number | null>(null);
  const activeUserTranscriptIdRef = useRef<number | null>(null);

  // VAD & Media Refs
  const localMicStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioBufferQueue = useRef<string[]>([]);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const vadHangoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isCurrentlySpeakingRef = useRef<boolean>(false);

  // Audio Playback Scheduler Ref
  const nextPlayTimeRef = useRef<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll transcripts
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  // --- 1. Connection & Session Management ---

  const ensureConnection = async (): Promise<any> => {
    if (sessionRef.current) return sessionRef.current;
    if (isConnectingRef.current) return; // Prevent spamming connections while waking up

    setIsConnecting(true);
    isConnectingRef.current = true;

    try {
      const token = await createEphemeralToken(plan);

      const ai = new GoogleGenAI({
        apiKey: token,
        httpOptions: { apiVersion: "v1alpha" }
      });

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }

      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          // --- MATCH REQUIRED CONSTRAINTS ON CLIENT SIDE ---
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          sessionResumption: sessionHandleRef.current ? { handle: sessionHandleRef.current } : undefined
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            isConnectedRef.current = true;
            setIsConnecting(false);
            isConnectingRef.current = false;
          },
          onmessage: handleReceiveMessage,
          onerror: (e) => console.error("Live API Error:", e),
          onclose: () => {
            setIsConnected(false);
            isConnectedRef.current = false;
            sessionRef.current = null;
          },
        },
      });

      sessionRef.current = session;

      // Flush queued audio now that the connection is ready
      while (audioBufferQueue.current.length > 0) {
        const chunk = audioBufferQueue.current.shift();
        if (chunk) {
          session.sendRealtimeInput({
            audio: { data: chunk, mimeType: "audio/pcm;rate=16000" }
          });
        }
      }

      return session;

    } catch (error) {
      console.error("Failed to connect:", error);
      setIsConnecting(false);
      isConnectingRef.current = false;
      throw error;
    }
  };

  const handleReceiveMessage = (message: any) => {
    if (message.sessionResumptionUpdate?.resumable && message.sessionResumptionUpdate?.newHandle) {
      sessionHandleRef.current = message.sessionResumptionUpdate.newHandle;
    }

    const content = message.serverContent;
    if (!content) return;

    // --- AUDIO PLAYBACK ---
    if (content.modelTurn?.parts) {
      for (const part of content.modelTurn.parts) {
        if (part.inlineData?.data) {
          playAudioChunk(part.inlineData.data);
        }
      }
    }

    // --- AI SPEECH TEXT (Streaming Append) ---
    if (content.outputTranscription?.text) {
      setTranscripts(prev => {
        if (!activeAiTranscriptIdRef.current) {
          activeAiTranscriptIdRef.current = Date.now();
          return [...prev, { id: activeAiTranscriptIdRef.current, role: "ai", text: content.outputTranscription.text }];
        }
        return prev.map(t =>
          t.id === activeAiTranscriptIdRef.current
            ? { ...t, text: t.text + content.outputTranscription.text }
            : t
        );
      });
    }

    // --- USER SPEECH TEXT (Streaming Append) ---
    if (content.inputTranscription?.text) {
      setTranscripts(prev => {
        if (!activeUserTranscriptIdRef.current) {
          activeUserTranscriptIdRef.current = Date.now();
          return [...prev, { id: activeUserTranscriptIdRef.current, role: "user", text: content.inputTranscription.text }];
        }
        return prev.map(t =>
          t.id === activeUserTranscriptIdRef.current
            ? { ...t, text: t.text + content.inputTranscription.text }
            : t
        );
      });
    }

    // If the user interrupted the AI, close the current AI bubble
    if (content.interrupted) {
      activeAiTranscriptIdRef.current = null;
    }

    // When AI finishes its turn, close the bubble
    if (content.generationComplete) {
      activeAiTranscriptIdRef.current = null;

      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => {
        disconnectSession();
      }, 10000);
    }
  };

  const disconnectSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
      setIsConnected(false);
      isConnectedRef.current = false;
    }
  };

  // --- 2. Client-Side VAD ---

  const startVADListening = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Microphone access is blocked.");
      return;
    }

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localMicStreamRef.current = stream;
      setIsMicActive(true);

      const context = new AudioContext({ sampleRate: 16000 });
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(2048, 1, 1);

      processor.onaudioprocess = async (e) => {
        const inputData = e.inputBuffer.getChannelData(0);

        let sum = 0;
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const val = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = val * 32767;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / inputData.length);
        const isCurrentlyLoud = rms > 0.02;

        if (isCurrentlyLoud) {
          isCurrentlySpeakingRef.current = true;
          if (vadHangoverTimerRef.current) clearTimeout(vadHangoverTimerRef.current);
          if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        } else if (isCurrentlySpeakingRef.current) {
          if (!vadHangoverTimerRef.current) {
            vadHangoverTimerRef.current = setTimeout(() => {
              isCurrentlySpeakingRef.current = false;
              vadHangoverTimerRef.current = null;

              // --- ADD THIS LINE: Close the user bubble after they stop speaking ---
              activeUserTranscriptIdRef.current = null;
            }, 1500);
          }
        }

        if (isCurrentlySpeakingRef.current) {
          const buffer = new ArrayBuffer(pcmData.length * 2);
          const view = new DataView(buffer);
          pcmData.forEach((val, i) => view.setInt16(i * 2, val, true));

          let binary = '';
          const bytes = new Uint8Array(buffer);
          for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
          const base64Audio = window.btoa(binary);

          // Use the `Ref` instead of the React state variable inside closures
          if (sessionRef.current && isConnectedRef.current) {
            sessionRef.current.sendRealtimeInput({
              audio: { data: base64Audio, mimeType: "audio/pcm;rate=16000" }
            });
          } else {
            audioBufferQueue.current.push(base64Audio);
            // Verify `isConnectingRef` to avoid duplicating network requests
            if (!isConnectingRef.current) {
              ensureConnection();
            }
          }
        }
      };

      source.connect(processor);
      processor.connect(context.destination);
      processorRef.current = processor;
    } catch (err) {
      console.error("Mic access denied:", err);
    }
  };

  const stopVADListening = () => {
    processorRef.current?.disconnect();
    localMicStreamRef.current?.getTracks().forEach(t => t.stop());
    setIsMicActive(false);
    disconnectSession();
  };

  // --- 3. Playback Scheduler ---

  const playAudioChunk = (base64Audio: string) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;

    const binaryStr = window.atob(base64Audio);
    const len = binaryStr.length;
    const bytes = new Int16Array(len / 2);
    for (let i = 0; i < len / 2; i++) {
      bytes[i] = (binaryStr.charCodeAt(i * 2) & 0xff) | (binaryStr.charCodeAt(i * 2 + 1) << 8);
    }

    const audioBuffer = ctx.createBuffer(1, bytes.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < bytes.length; i++) channelData[i] = bytes[i] / 32768.0;

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const currentTime = ctx.currentTime;
    if (nextPlayTimeRef.current < currentTime) {
      nextPlayTimeRef.current = currentTime;
    }

    source.start(nextPlayTimeRef.current);
    nextPlayTimeRef.current += audioBuffer.duration;
  };

  // --- 4. Camera ---
  const openCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera access is blocked.");
      return;
    }
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied:", err);
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsCameraOpen(false);
  }

  const snapAndAsk = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext("2d");
    if (!context) return;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    const base64Image = canvasRef.current.toDataURL("image/jpeg", 0.7).split(",")[1];

    closeCamera();
    const session = await ensureConnection();
    session.sendClientContent({
      turns: [
        {
          role: "user",
          parts: [
            { text: "I am looking at this right now. What is it?" },
            { inlineData: { mimeType: "image/jpeg", data: base64Image } }
          ]
        }
      ],
      turnComplete: true
    });
  };

  // --- Geolocation ---
  useEffect(() => {
    if (!isMicActive) return;
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const currentPos = { latitude, longitude };
        if (lastPosRef.current && getDistance(currentPos, lastPosRef.current) < 5) return;
        lastPosRef.current = currentPos;

        for (const item of plan.itinerary) {
          if (!item.location_metadata) continue;
          const periods = ["morning", "afternoon", "evening"] as const;
          for (const period of periods) {
            const loc = item.location_metadata![period];
            if (!loc) continue;
            const dist = getDistance(currentPos, { latitude: loc.lat, longitude: loc.lng });
            if (dist <= (loc.radius_meters || 50) && !triggeredZones.includes(loc.name)) {
              setTriggeredZones((prev) => [...prev, loc.name]);
              const session = await ensureConnection();
              session.sendClientContent({
                turns: [{ role: "user", parts: [{ text: `SYSTEM ALERT: User arrived at ${loc.name}. Proactively introduce it.` }] }],
                turnComplete: true
              });
            }
          }
        }
      },
      (err) => console.warn("GPS Warning:", err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isMicActive, triggeredZones, plan.itinerary]);

  useEffect(() => {
    return () => stopVADListening();
  }, []);

  return (
    // Changed: Removed 'h-full' to inherit flex sizing perfectly, changed bg-stone-900 to bg-foreground
    <div className="relative flex-1 flex flex-col bg-foreground w-full overflow-hidden">
      {/* Viewfinder logic hidden to limit response length (Unchanged from original code) */}
      {isCameraOpen && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col">
          <header className="absolute top-0 w-full p-6 flex justify-between z-10">
            <span className="text-white drop-shadow-md tracking-widest uppercase text-xs">Viewfinder</span>
            <button onClick={closeCamera} className="text-white p-2 bg-black/50 rounded-full backdrop-blur-md">
              <X className="w-5 h-5" />
            </button>
          </header>
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-10 w-full flex justify-center z-10">
            <button onClick={snapAndAsk} className="w-20 h-20 bg-white rounded-full border-4 border-stone-300 shadow-2xl flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-black rounded-full" />
            </button>
          </div>
        </div>
      )}

      {/* Main UI */}
      {/* Changed: Adjusted padding-bottom (pb-24) to ensure content sits nicely above the bottom nav bar */}
      <div className="relative z-10 flex flex-col h-full p-6 pb-24 justify-between overflow-hidden">
        <header className="flex justify-between items-start shrink-0">
          <div>
            <span className="text-xs uppercase tracking-widest text-white/70 font-semibold bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
              AI Audio Guide
            </span>
            <h1 className="text-3xl font-serif text-white mt-4 drop-shadow-md">
              {plan.destination}
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            {isMicActive && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-400'}`} />
                <span className="text-xs font-light text-white uppercase tracking-widest">
                  {isConnected ? 'Connected' : 'Listening...'}
                </span>
              </div>
            )}
            {isConnecting && (
              <span className="text-[10px] text-white/50 uppercase tracking-widest flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Waking AI
              </span>
            )}
          </div>
        </header>

        {/* Captions UI */}
        <div
          ref={scrollRef}
          className="flex-1 my-6 overflow-y-auto hide-scrollbar flex flex-col gap-4 relative mask-image-fade min-h-0"
          style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
        >
          {transcripts.length === 0 && isMicActive && (
            <div className="m-auto text-center flex flex-col items-center gap-3 opacity-30">
              <MessageSquareText className="w-8 h-8 text-white" />
              <p className="text-white text-sm tracking-widest uppercase font-light">Speak to start</p>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-4 pb-8 pt-20">
            {transcripts.map((t) => (
              <div key={t.id} className={`max-w-[85%] rounded-2xl p-4 ${t.role === 'user' ? 'bg-white/10 text-white self-end rounded-br-none' : 'bg-primary text-primary-foreground self-start rounded-bl-none shadow-xl'}`}>
                <span className="text-[10px] uppercase tracking-widest opacity-50 block mb-1">
                  {t.role === 'user' ? 'You' : 'NOMA Guide'}
                </span>
                <p className="text-sm font-medium leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-6 shrink-0">
          {!isMicActive ? (
            <button
              onClick={startVADListening}
              className="bg-primary text-primary-foreground px-8 py-4 uppercase tracking-widest text-sm shadow-2xl hover:bg-primary/90 transition flex items-center gap-3 w-full max-w-sm justify-center rounded-full"
            >
              <Mic className="w-5 h-5" /> Activate Auto-Listen
            </button>
          ) : (
            <>
              <button
                onClick={openCamera}
                className="group relative flex flex-col items-center justify-center gap-2 w-full max-w-xs"
              >
                <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all shadow-lg">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-white/80 drop-shadow-md font-semibold">Snap & Ask</span>
              </button>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-2 rounded-full mt-2">
                <button
                  onClick={stopVADListening}
                  className="p-4 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors shadow-lg"
                >
                  <StopCircle className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}