"use client";

import type { UIMessage } from "ai";

function getMessageText(message: UIMessage): string {
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((p) => p.type === "text")
      .map((p) => (p as { type: "text"; text: string }).text)
      .join("");
  }
  return "";
}

export function MessageBubble({ message }: { message: UIMessage }) {
  const text = getMessageText(message);
  if (!text) return null;
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[720px] w-full ${isUser ? "pl-12" : "pr-12"}`}>
        {/* Role label */}
        <div className={`flex items-center gap-1.5 mb-1.5 ${isUser ? "justify-end" : "justify-start"}`}>
          {!isUser && (
            <div className="w-4 h-4 rounded-sm bg-emerald-950/60 border border-emerald-900/50 flex items-center justify-center text-[8px]">
              ⬡
            </div>
          )}
          <span
            className="text-[9px] font-mono tracking-widest uppercase"
            style={{ color: isUser ? "#be3a5a" : "#2d8c5c" }}
          >
            {isUser ? "Attacker" : "SecureBot"}
          </span>
          {isUser && (
            <div className="w-4 h-4 rounded-sm bg-rose-950/60 border border-rose-900/50 flex items-center justify-center text-[8px]">
              ⬤
            </div>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`rounded-xl px-4 py-3 leading-relaxed text-sm ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}`}
          style={
            isUser
              ? {
                  backgroundColor: "var(--bg-user-bubble)",
                  border: "1px solid var(--user-border)",
                  color: "var(--user-text)",
                }
              : {
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--bot-text)",
                }
          }
        >
          <p className="whitespace-pre-wrap font-sans">{text}</p>
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="pr-12 w-full max-w-[720px]">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-4 h-4 rounded-sm bg-emerald-950/60 border border-emerald-900/50 flex items-center justify-center text-[8px]">
            ⬡
          </div>
          <span className="text-[9px] font-mono tracking-widest uppercase text-emerald-700">
            SecureBot
          </span>
        </div>
        <div
          className="rounded-xl rounded-tl-sm px-4 py-3 inline-flex items-center gap-1"
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-strong)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}