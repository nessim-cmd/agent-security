"use client";

import { useRef, useEffect } from "react";
import type { UIMessage } from "ai";
import { MessageBubble, TypingIndicator } from "./MessageBubble";

interface Props {
  messages: UIMessage[];
  isLoading: boolean;
  sessionTitle: string;
}

export function MessageList({ messages, isLoading, sessionTitle }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 text-center">
        {/* Radar icon */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ border: "1px solid var(--border-mid)" }}
          />
          <div
            className="absolute inset-2 rounded-full animate-ping opacity-30 [animation-delay:300ms]"
            style={{ border: "1px solid var(--border-strong)" }}
          />
          <div
            className="absolute inset-4 rounded-full animate-ping opacity-40 [animation-delay:600ms]"
            style={{ border: "1px solid var(--border-accent)" }}
          />
          <span className="text-2xl z-10">🛡️</span>
        </div>

        <div>
          <p className="text-base font-semibold font-mono" style={{ color: "var(--text-primary)" }}>
            SecureBot is ready
          </p>
          <p className="text-xs mt-1 max-w-xs" style={{ color: "var(--text-muted)" }}>
            Select an attack preset above, drop a file below, or type a custom prompt.
          </p>
        </div>

        {sessionTitle && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md"
            style={{
              border: "1px solid var(--border-mid)",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "var(--text-faint)" }} />
            <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
              {sessionTitle}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-2 max-w-xs w-full text-left">
          {[
            { icon: "⚡", label: "Prompt injection", sub: "LLM01" },
            { icon: "🔑", label: "Credential leakage", sub: "LLM02" },
            { icon: "🕵️", label: "Jailbreak attempts", sub: "LLM01" },
            { icon: "💉", label: "Indirect injection", sub: "LLM01" },
          ].map((tip) => (
            <div
              key={tip.label}
              className="flex items-start gap-2 px-2.5 py-2 rounded-md"
              style={{
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-card)",
              }}
            >
              <span className="text-sm">{tip.icon}</span>
              <div>
                <p className="text-[10px] font-mono leading-snug" style={{ color: "var(--text-secondary)" }}>
                  {tip.label}
                </p>
                <p className="text-[9px] font-mono" style={{ color: "var(--text-faint)" }}>
                  {tip.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const visibleMessages = messages.filter((m) => {
    if (Array.isArray(m.parts)) {
      return m.parts.some((p) => p.type === "text" && (p as { type: "text"; text: string }).text);
    }
    return false;
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
      {visibleMessages.map((m: UIMessage) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}