"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type TargetType = "external_url" | "openai" | "anthropic" | "ollama" | "groq" | "openrouter" | "template";

type Target = {
  id: string;
  name: string;
  description?: string;
  type: TargetType;
  endpoint?: string;
  provider?: string;
  model?: string;
  apiKey?: string;
  templateId?: string;
  isActive: boolean;
  createdAt: string;
  _count?: { workflows: number };
};

const TYPE_LABELS: Record<TargetType, string> = {
  external_url: "External URL",
  openai: "OpenAI",
  anthropic: "Anthropic",
  ollama: "Ollama",
  groq: "Groq",
  openrouter: "OpenRouter",
  template: "Built-in Template",
};

const TYPE_COLORS: Record<TargetType, string> = {
  external_url: "#7ab4e0",
  openai: "#10a37f",
  anthropic: "#d4813a",
  ollama: "#7c3aed",
  groq: "#f59e0b",
  openrouter: "#3b82f6",
  template: "#f43f5e",
};

const TEMPLATES = [
  { id: "banking", label: "Banking Agent (Alex)" },
  { id: "securebot", label: "SecureBot" },
];

export default function TargetsPage() {
  const router = useRouter();
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; response?: string; error?: string; testing?: boolean }>>({});

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "ollama" as TargetType,
    endpoint: "",
    model: "",
    apiKey: "",
    templateId: "banking",
  });

  const fetchTargets = useCallback(async () => {
    const res = await fetch("/api/targets");
    const data = await res.json();
    setTargets(data.targets ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTargets(); }, [fetchTargets]);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;

    await fetch("/api/targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description || undefined,
        type: form.type,
        endpoint: form.type === "external_url" ? form.endpoint : undefined,
        model: form.model || undefined,
        apiKey: form.apiKey || undefined,
        templateId: form.type === "template" ? form.templateId : undefined,
      }),
    });

    setForm({ name: "", description: "", type: "ollama", endpoint: "", model: "", apiKey: "", templateId: "banking" });
    setShowForm(false);
    fetchTargets();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this target and all its workflows?")) return;
    await fetch(`/api/targets/${id}`, { method: "DELETE" });
    fetchTargets();
  };

  const handleTest = async (id: string) => {
    setTestResults(prev => ({ ...prev, [id]: { ok: false, testing: true } }));
    const res = await fetch(`/api/targets/${id}/test`, { method: "POST" });
    const data = await res.json();
    setTestResults(prev => ({ ...prev, [id]: { ok: data.ok, response: data.response, error: data.error } }));
  };

  const needsEndpoint = form.type === "external_url";
  const needsApiKey = ["openai", "anthropic", "groq", "openrouter"].includes(form.type);
  const needsModel = ["openai", "anthropic", "groq", "openrouter", "ollama"].includes(form.type);
  const isTemplate = form.type === "template";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="text-[11px] font-mono px-2 py-1 rounded"
            style={{ border: "1px solid var(--border-mid)", color: "var(--text-muted)" }}
          >
            ← Back
          </button>
          <span className="text-lg">🎯</span>
          <div>
            <h1 className="text-sm font-bold font-mono" style={{ color: "var(--text-primary)" }}>
              Target Registry
            </h1>
            <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
              AI systems to test · {targets.length} registered
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="text-[11px] font-mono px-3 py-1.5 rounded-md transition-all"
          style={{ backgroundColor: "#881337", border: "1px solid #9f1239", color: "#fff1f2" }}
        >
          + Add Target
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Add form */}
        {showForm && (
          <div
            className="rounded-xl p-5 mb-6"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-mid)" }}
          >
            <h2 className="text-sm font-bold font-mono mb-4" style={{ color: "var(--text-primary)" }}>
              New Target
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[10px] font-mono block mb-1" style={{ color: "var(--text-muted)" }}>Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="My Banking API"
                  className="w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-mid)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="text-[10px] font-mono block mb-1" style={{ color: "var(--text-muted)" }}>Type *</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as TargetType }))}
                  className="w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-mid)", color: "var(--text-primary)" }}
                >
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {needsEndpoint && (
              <div className="mb-3">
                <label className="text-[10px] font-mono block mb-1" style={{ color: "var(--text-muted)" }}>Endpoint URL</label>
                <input
                  value={form.endpoint}
                  onChange={e => setForm(f => ({ ...f, endpoint: e.target.value }))}
                  placeholder="https://my-agent.com/api/chat"
                  className="w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-mid)", color: "var(--text-primary)" }}
                />
              </div>
            )}

            {isTemplate && (
              <div className="mb-3">
                <label className="text-[10px] font-mono block mb-1" style={{ color: "var(--text-muted)" }}>Template</label>
                <select
                  value={form.templateId}
                  onChange={e => setForm(f => ({ ...f, templateId: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-mid)", color: "var(--text-primary)" }}
                >
                  {TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              {needsModel && (
                <div>
                  <label className="text-[10px] font-mono block mb-1" style={{ color: "var(--text-muted)" }}>Model</label>
                  <input
                    value={form.model}
                    onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                    placeholder={form.type === "ollama" ? "qwen3:8b" : "gpt-4o-mini"}
                    className="w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                    style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-mid)", color: "var(--text-primary)" }}
                  />
                </div>
              )}
              {needsApiKey && (
                <div>
                  <label className="text-[10px] font-mono block mb-1" style={{ color: "var(--text-muted)" }}>API Key</label>
                  <input
                    value={form.apiKey}
                    onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
                    type="password"
                    placeholder="sk-..."
                    className="w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                    style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-mid)", color: "var(--text-primary)" }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="text-[11px] font-mono px-4 py-2 rounded-lg"
                style={{ backgroundColor: "#881337", border: "1px solid #9f1239", color: "#fff1f2" }}
              >
                Save Target
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="text-[11px] font-mono px-4 py-2 rounded-lg"
                style={{ border: "1px solid var(--border-mid)", color: "var(--text-muted)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Target list */}
        {loading ? (
          <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>Loading...</p>
        ) : targets.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>No targets yet</p>
            <p className="text-xs font-mono mt-1" style={{ color: "var(--text-faint)" }}>
              Add an AI system to start testing it
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {targets.map(target => {
              const result = testResults[target.id];
              return (
                <div
                  key={target.id}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: TYPE_COLORS[target.type] }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold font-mono" style={{ color: "var(--text-primary)" }}>
                            {target.name}
                          </span>
                          <span
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: "var(--bg-elevated)",
                              border: "1px solid var(--border-mid)",
                              color: TYPE_COLORS[target.type],
                            }}
                          >
                            {TYPE_LABELS[target.type]}
                          </span>
                          {target._count?.workflows ? (
                            <span className="text-[9px] font-mono" style={{ color: "var(--text-faint)" }}>
                              {target._count.workflows} workflow{target._count.workflows !== 1 ? "s" : ""}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[10px] font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {target.endpoint && <span>{target.endpoint}</span>}
                          {target.model && <span>{target.model}</span>}
                          {target.templateId && <span>template: {target.templateId}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleTest(target.id)}
                        disabled={result?.testing}
                        className="text-[10px] font-mono px-2.5 py-1.5 rounded-md transition-all"
                        style={{ border: "1px solid var(--border-mid)", color: "var(--text-muted)" }}
                      >
                        {result?.testing ? "Testing..." : "Test"}
                      </button>
                      <button
                        onClick={() => handleDelete(target.id)}
                        className="text-[10px] font-mono px-2 py-1.5 rounded-md"
                        style={{ border: "1px solid var(--border-mid)", color: "var(--text-muted)" }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Test result */}
                  {result && !result.testing && (
                    <div
                      className="mt-3 rounded-lg px-3 py-2 text-[11px] font-mono"
                      style={{
                        backgroundColor: result.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                        border: `1px solid ${result.ok ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                        color: result.ok ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {result.ok ? "✓ Connected — " : "✗ Failed — "}
                      <span style={{ color: "var(--text-muted)" }}>
                        {result.response ?? result.error}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}