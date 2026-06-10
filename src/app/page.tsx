"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SelectAgentPage() {
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
      className="min-h-screen flex flex-col items-center justify-center gap-10 px-4"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 w-8 h-8 rounded-md flex items-center justify-center text-sm transition-all"
        style={{ border: "1px solid var(--border-mid)", color: "var(--text-muted)", backgroundColor: "var(--bg-elevated)" }}
      >
        {isDark ? "☀" : "☾"}
      </button>

      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-3xl">🛡️</span>
          <h1
            className="text-2xl font-bold font-mono tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            LLM Security Lab
          </h1>
        </div>
        <p className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>
          Select an agent to test · OWASP Top 10 for LLMs
        </p>
      </div>

      {/* Agent cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
        {/* Security Agent */}
        <button
          onClick={() => router.push("/lab")}
          className="flex-1 group text-left rounded-xl p-6 transition-all"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
        >
          <div className="text-2xl mb-3">🛡</div>
          <h2 className="text-sm font-bold font-mono mb-1" style={{ color: "var(--text-primary)" }}>
            SecureBot
          </h2>
          <p className="text-xs font-mono mb-4" style={{ color: "var(--text-muted)" }}>
            General LLM security agent. Test all OWASP LLM Top 10 attacks.
          </p>
          <div className="flex flex-wrap gap-1">
            {["LLM01", "LLM02", "LLM06", "LLM07"].map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border-mid)" }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div
            className="mt-4 text-xs font-mono font-semibold"
            style={{ color: "var(--accent-blue-hover)" }}
          >
            Open Lab →
          </div>
        </button>

        {/* Banking Agent */}
        <button
          onClick={() => router.push("/banking")}
          className="flex-1 group text-left rounded-xl p-6 transition-all"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#d97706")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
        >
          <div className="text-2xl mb-3">🏦</div>
          <h2 className="text-sm font-bold font-mono mb-1" style={{ color: "var(--text-primary)" }}>
            Alex — Banking Agent
          </h2>
          <p className="text-xs font-mono mb-4" style={{ color: "var(--text-muted)" }}>
            SecureBank customer service AI. Try to extract data, bypass auth, or inject malicious instructions.
          </p>
          <div className="flex flex-wrap gap-1">
            {["Credential theft", "Auth bypass", "Data exfil", "Injection"].map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{ backgroundColor: "var(--bg-elevated)", color: "#d97706", border: "1px solid #92400e" }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4 text-xs font-mono font-semibold text-amber-500">
            Attack Alex →
          </div>
        </button>
      </div>

      {/* Footer */}
      <p className="text-[10px] font-mono" style={{ color: "var(--text-faint)" }}>
        All interactions logged to Neon PostgreSQL
      </p>
    </div>
  );
}