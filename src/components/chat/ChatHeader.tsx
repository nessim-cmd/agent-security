"use client";

import { useEffect, useState } from "react";

interface Props {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  sessionTitle: string;
  provider: string;
  attackCount: number;
}

export function ChatHeader({
  sidebarOpen,
  onToggleSidebar,
  sessionTitle,
  provider,
  attackCount,
}: Props) {
  const [isDark, setIsDark] = useState(true);

  // Sync with whatever the layout script already applied
  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains("light"));
  }, []);

  const toggleTheme = () => {
    const goLight = isDark;
    document.documentElement.classList.toggle("light", goLight);
    localStorage.setItem("theme", goLight ? "light" : "dark");
    setIsDark(!goLight);
  };

  return (
    <header
      className="flex-shrink-0 flex items-center gap-3 px-4 py-3 backdrop-blur-md"
      style={{
        borderBottom: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-surface)",
      }}
    >
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        className="w-7 h-7 flex items-center justify-center rounded-md font-mono text-xs transition-all"
        style={{
          border: "1px solid var(--border-mid)",
          color: "var(--accent-blue)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = "var(--accent-blue-hover)";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-accent)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = "var(--accent-blue)";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-mid)";
        }}
      >
        {sidebarOpen ? "⟨" : "⟩"}
      </button>

      {/* Logo */}
      <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-md text-sm bg-rose-950/50 border border-rose-900/60">
        🛡
      </div>

      {/* Title block */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <h1
            className="text-sm font-bold font-mono tracking-tight whitespace-nowrap"
            style={{ color: "var(--text-primary)" }}
          >
            LLM Security Lab
          </h1>
          {sessionTitle && (
            <>
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>›</span>
              <span
                className="text-xs truncate font-mono"
                style={{ color: "var(--text-muted)" }}
              >
                {sessionTitle}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>Provider</span>
          <span className="text-[9px] text-emerald-500 font-mono font-semibold">{provider}</span>
          <span className="text-[9px]" style={{ color: "var(--text-faint)" }}>·</span>
          <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>OWASP Top 10 for LLMs</span>
        </div>
      </div>

      {/* Attack count chip */}
      <div
        className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md"
        style={{
          backgroundColor: "var(--bg-elevated)",
          border: "1px solid var(--border-mid)",
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
          {attackCount} attack{attackCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="w-7 h-7 flex items-center justify-center rounded-md font-mono text-sm transition-all"
        style={{
          border: "1px solid var(--border-mid)",
          color: "var(--text-muted)",
          backgroundColor: "var(--bg-elevated)",
        }}
      >
        {isDark ? "☀" : "☾"}
      </button>
    </header>
  );
}