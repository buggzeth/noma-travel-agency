// components/home/AIChatOverlay.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { X, Sparkles, Loader2, History, MessageSquare, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

interface AIChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage: string;
  clearInitialMessage: () => void;
}

const STORAGE_KEY = "noma_chat_sessions";

export default function AIChatOverlay({
  isOpen,
  onClose,
  initialMessage,
  clearInitialMessage,
}: AIChatOverlayProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Load History
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    }
  }, []);

  // Save active session
  useEffect(() => {
    if (messages.length === 0) return;

    setSessions((prev) => {
      const currentSessionIdx = prev.findIndex((s) => s.id === activeSessionId);
      let updatedSessions = [...prev];

      if (currentSessionIdx >= 0) {
        updatedSessions[currentSessionIdx] = {
          ...updatedSessions[currentSessionIdx],
          messages,
          updatedAt: Date.now(),
        };
      } else {
        const newSessionId = Date.now().toString();
        setActiveSessionId(newSessionId);
        updatedSessions.unshift({
          id: newSessionId,
          title: messages[0].content.slice(0, 30) + "...",
          messages,
          updatedAt: Date.now(),
        });
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
      return updatedSessions;
    });
  }, [messages, activeSessionId]);

  // Handle external trigger
  useEffect(() => {
    if (isOpen && initialMessage) {
      handleSend(initialMessage);
      clearInitialMessage();
    }
  }, [isOpen, initialMessage]);

  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiMessageContent = "";

      const aiMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: aiMessageId, role: "assistant", content: "" },
      ]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          aiMessageContent += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: aiMessageContent }
                : msg
            )
          );
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "I apologize, but my connection to the NOMA database was interrupted.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setActiveSessionId(session.id);
      setMessages(session.messages);
      setShowHistoryMobile(false);
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setShowHistoryMobile(false);
  };

  const handleClose = () => {
    setActiveSessionId(null);
    setMessages([]);
    setShowHistoryMobile(false); // Ensures the sidebar resets state when closed
    onClose();
  };

  const hasSessions = sessions.length > 0;

  return (
    <div
      // ADDED: `overflow-hidden` to prevent the sidebar from bleeding into the viewport when closed
      className={`fixed top-0 left-0 z-[100] w-full h-[100dvh] bg-background flex overflow-hidden transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"
      }`}
    >
      {/* Mobile Backdrop for Sidebar */}
      {showHistoryMobile && (
        <div 
          className="md:hidden absolute inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setShowHistoryMobile(false)}
        />
      )}

      {/* Sidebar / History Panel */}
      <div
        // MODIFIED: Base `flex` removed from static classes, moved to dynamic ternary to safely enforce display hidden vs flex across all breakpoints
        className={`absolute top-0 left-0 md:relative z-40 h-[100dvh] w-[80vw] max-w-[320px] md:w-80 bg-background md:bg-secondary/10 border-r border-border/50 flex-col transition-transform duration-300 md:translate-x-0 ${
          showHistoryMobile ? "translate-x-0 shadow-2xl md:shadow-none" : "-translate-x-full"
        } ${!hasSessions ? "hidden" : "flex"}`}
      >
        <div className="p-6 border-b border-border/50 flex justify-between items-center bg-background">
          <h2 className="font-serif text-xl tracking-wide">Journeys</h2>
          <button
            onClick={() => setShowHistoryMobile(false)}
            className="md:hidden text-foreground/50 hover:text-foreground p-2 -mr-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar bg-background md:bg-transparent">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border/50 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
          >
            <Plus className="h-4 w-4" />
            NEW INQUIRY
          </button>
          
          <div className="pt-4 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold px-2 mb-2">Previous</p>
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => loadSession(session.id)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 border text-sm transition-colors ${
                  activeSessionId === session.id
                    ? "border-foreground bg-foreground/5"
                    : "border-transparent hover:border-border/50"
                }`}
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-foreground/50" />
                <span className="truncate font-light text-foreground/80">{session.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-[100dvh] w-full relative z-10 bg-background overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center p-4 md:p-6 border-b border-border/50 bg-background/95 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            {hasSessions && (
              <button
                onClick={() => setShowHistoryMobile(true)}
                className="md:hidden text-foreground/70 hover:text-foreground p-1"
                aria-label="Open History"
              >
                <History className="h-5 w-5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-serif text-xl md:text-2xl tracking-wide text-foreground">
                NOMA Concierge
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-foreground/50 hover:text-foreground transition-colors p-2 border border-transparent hover:border-border/50"
            aria-label="Close Chat"
          >
            <X className="h-6 w-6" />
          </button>
        </header>

        {/* Dynamic Layout for flowing input */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Top spacer (Forces input to center when empty) */}
          <div
            className={`transition-all duration-700 ease-in-out shrink-0 w-full ${
              messages.length === 0 ? "h-[25vh] md:h-[35vh]" : "h-0"
            }`}
          />

          {/* Messages Area */}
          <div
            className={`transition-all duration-700 ease-in-out flex-1 overflow-y-auto px-4 md:px-12 flex flex-col hide-scrollbar w-full ${
              messages.length === 0 ? "opacity-0 invisible h-0 py-0" : "opacity-100 visible py-6 space-y-6"
            }`}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[95%] md:max-w-[75%] px-5 py-4 md:px-6 md:py-6 text-sm md:text-base font-light leading-relaxed ${
                    msg.role === "user"
                      ? "bg-foreground text-background whitespace-pre-wrap"
                      : "bg-secondary/30 text-foreground border border-border/50"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-xl md:text-2xl font-serif mt-6 mb-4 first:mt-0" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-lg md:text-xl font-serif mt-6 mb-3 first:mt-0" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-base md:text-lg font-serif mt-6 mb-3 text-primary font-medium first:mt-0" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-square list-inside mb-4 space-y-2 marker:text-primary" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2 marker:text-primary" {...props} />,
                        li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                        hr: ({ node, ...props }) => <hr className="my-6 border-border/50" {...props} />,
                        a: ({ node, ...props }) => <a className="text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors" {...props} />
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start w-full">
                <div className="px-5 py-4 md:px-6 md:py-4 bg-secondary/30 border border-border/50 text-foreground/50 flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-[10px] md:text-xs uppercase tracking-widest font-medium">Consulting our network...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Input Area */}
          <div className="shrink-0 w-full px-4 md:px-12 pb-6 md:pb-12 bg-background pt-4 z-20">
            <div className="max-w-4xl mx-auto w-full">
              {messages.length === 0 && (
                <div className="text-center mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <h1 className="font-serif text-3xl md:text-5xl mb-3 md:mb-4">How may I assist you?</h1>
                  <p className="font-light text-foreground/60 text-sm md:text-lg">Curated itineraries, expert advice, and live updates.</p>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-center bg-background border border-border shadow-sm p-1 transition-all duration-300 focus-within:border-foreground/50"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about a destination..."
                  className="flex-1 w-full bg-transparent px-4 py-3 md:px-6 md:py-4 text-sm md:text-base font-light focus:outline-none placeholder:text-foreground/40"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-3 md:px-8 md:py-4 bg-primary text-primary-foreground uppercase text-[10px] md:text-xs tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent shrink-0"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}