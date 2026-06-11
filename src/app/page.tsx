"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STATS = [
  { value: "10", label: "OWASP Categories" },
  { value: "17", label: "Attack Payloads" },
  { value: "3", label: "AI Agents" },
  { value: "∞", label: "Targets" },
];

export default function HomePage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);

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
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-8 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🛡️</span>
          <span className="text-sm font-bold font-mono" style={{ color: "var(--text-primary)" }}>
            LLM Security Lab
          </span>
          <span
            className="text-[9px] font-mono px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-mid)", color: "var(--text-muted)" }}
          >
            v0.1 · OWASP LLM Top 10
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-7 h-7 flex items-center justify-center rounded-md text-sm"
            style={{ border: "1px solid var(--border-mid)", color: "var(--text-muted)", backgroundColor: "var(--bg-elevated)" }}
          >
            {isDark ? "☀" : "☾"}
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-[10px] font-mono"
          style={{
            backgroundColor: "rgba(244,63,94,0.1)",
            border: "1px solid rgba(244,63,94,0.3)",
            color: "#f43f5e",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          Automated AI Red Team Platform
        </div>

        {/* Title */}
        <h1
          className="text-4xl font-bold font-mono tracking-tight mb-4 max-w-2xl"
        >
          Test AI Agent and LLM
        </h1>

        <p
          className="text-sm font-mono max-w-lg mb-10 leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          Connect any LLM or AI agent. Three specialized agents — Recon, Red Team, and Analysis —
          automatically discover, attack, and report vulnerabilities mapped to OWASP LLM Top 10.
        </p>

        {/* Stats */}
        <div className="flex gap-8 mb-12">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold font-mono" style={{ color: "var(--text-primary)" }}>
                {s.value}
              </div>
              <div className="text-[10px] font-mono mt-0.5" style={{ color: "var(--text-faint)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3 mb-16">
          <button
            onClick={() => router.push("/workflows")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-mono font-semibold transition-all"
            style={{ backgroundColor: "#881337", border: "1px solid #9f1239", color: "#fff1f2" }}
          >
            ⚡ Run Assessment
          </button>
          <button
            onClick={() => router.push("/targets")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-mono transition-all"
            style={{ border: "1px solid var(--border-mid)", color: "var(--text-muted)", backgroundColor: "var(--bg-surface)" }}
          >
            🎯 Add Target
          </button>
        </div>

        {/* Agent pipeline visualization */}
        <div
          className="flex items-center gap-0 rounded-2xl p-6 max-w-2xl w-full"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
        >
          {[
            { icon: "🔍", label: "Recon Agent", desc: "Discovers capabilities", color: "#3b82f6" },
            { icon: "⚔️", label: "Red Team Agent", desc: "Executes attacks", color: "#ef4444" },
            { icon: "📊", label: "Analysis Agent", desc: "Scores findings", color: "#8b5cf6" },
          ].map((agent, i) => (
            <div key={agent.label} className="flex items-center flex-1">
              <div className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${agent.color}18`, border: `1px solid ${agent.color}40` }}
                >
                  {agent.icon}
                </div>
                <div className="text-[11px] font-mono font-semibold text-center" style={{ color: "var(--text-primary)" }}>
                  {agent.label}
                </div>
                <div className="text-[9px] font-mono text-center" style={{ color: "var(--text-muted)" }}>
                  {agent.desc}
                </div>
              </div>
              {i < 2 && (
                <div className="flex items-center px-1">
                  <div className="w-8 h-px" style={{ backgroundColor: "var(--border-mid)" }} />
                  <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>▶</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom nav links */}
        <div className="flex gap-6 mt-10">
          {[
            { icon: "🎯", label: "Target Registry", path: "/targets" },
            { icon: "⚡", label: "Workflows", path: "/workflows" },
            { icon: "🛡", label: "SecureBot Demo", path: "/lab" },
            { icon: "🏦", label: "Banking Demo", path: "/banking" },
          ].map((link) => (
            <button
              key={link.path}
              onClick={() => router.push(link.path)}
              className="flex items-center gap-1.5 text-[11px] font-mono transition-all"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </button>
          ))}
        </div>
      </div>

      <footer className="px-8 py-4 text-center">
        <p className="text-[10px] font-mono" style={{ color: "var(--text-faint)" }}>
          All interactions logged to Neon PostgreSQL · OWASP LLM Top 10 2025
        </p>
      </footer>
    </div>
  );
}