"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  isLoading,
}: Props) {
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div
      className="flex-shrink-0 px-4 py-3 border-t"
      style={{
        borderColor: "var(--border-subtle)",
        backgroundColor: "var(--bg-surface)",
      }}
    >
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type an attack prompt, select a preset, or drop a file above..."
            rows={2}
            className="w-full rounded-xl px-4 py-3 text-sm resize-none transition-all duration-150 font-mono leading-relaxed min-h-[72px] max-h-[180px] focus:outline-none"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <button
          onClick={onSend}
          disabled={isLoading || !value.trim()}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-mono text-xs font-semibold tracking-wider transition-all duration-150 border"
          style={
            isLoading || !value.trim()
              ? {
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-faint)",
                  backgroundColor: "transparent",
                }
              : {
                  backgroundColor: "#881337",
                  borderColor: "#9f1239",
                  color: "#fff1f2",
                }
          }
        >
          {isLoading ? (
            <span className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-rose-400 animate-bounce" />
              <span className="w-1 h-1 rounded-full bg-rose-400 animate-bounce [animation-delay:100ms]" />
              <span className="w-1 h-1 rounded-full bg-rose-400 animate-bounce [animation-delay:200ms]" />
            </span>
          ) : (
            <>
              <span>SEND</span>
              <span className="text-[10px]">↵</span>
            </>
          )}
        </button>
      </div>

      <p
        className="text-[9px] mt-1.5 font-mono"
        style={{ color: "var(--text-faint)" }}
      >
        Shift+Enter for newline · Enter to send · History saved to
        logs/sessions/
      </p>
    </div>
  );
}