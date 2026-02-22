// components/home/AIChat.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Loader2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChat({ isOpen, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to NOMA. I am your personal AI Travel Concierge. Where in the world would you like to explore today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiMessageContent = "";

      // Add a placeholder for the streaming response
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

          // Update the specific AI message chunk by chunk
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
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "I apologize, but my connection was interrupted. Please try asking again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-4 sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex flex-col bg-background border border-border/80 shadow-2xl sm:w-[420px] h-[calc(100vh-2rem)] sm:h-[600px] transition-all animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-secondary/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-serif text-lg tracking-wide text-foreground">
            NOMA Concierge
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-foreground/50 hover:text-foreground transition-colors p-1"
          aria-label="Close Chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/50 hide-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 text-sm font-light leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/40 text-foreground border border-border/30"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 bg-secondary/40 border border-border/30 text-foreground/50 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs uppercase tracking-widest font-medium">Consulting...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/50 bg-background">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 border border-border/80 p-1 bg-white/5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a destination..."
            className="flex-1 bg-transparent px-4 py-2 text-sm font-light focus:outline-none placeholder:text-foreground/40"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}