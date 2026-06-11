"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type Target = { id: string; name: string; type: string };
type Workflow = {
  id: string;
  name: string;
  targetId: string;
  mode: string;
  status: string;
  attackCategories: string[];
  createdAt: string;
  target: { id: string; name: string; type: string };
  _count: { runs: number };
};

const ALL_CATEGORIES = ["LLM01", "LLM02", "LLM05", "LLM06", "LLM07", "LLM09"];

const STATUS_COLORS: Record<string, string> = {
  idle: "#8ba0c4",
  running: "#f59e0b",
  done: "#22c55e",
  failed: "#ef4444",
};

// Build React Flow nodes from a workflow
function buildNodes(workflow: Workflow): Node[] {
  return [
    {
      id: "trigger",
      type: "default",
      position: { x: 50, y: 180 },
      data: { label: "▶ Manual Trigger" },
      style: {
        background: "#0f1a2e",
        border: "1px solid #1e3056",
        borderRadius: "10px",
        color: "#8ba0c4",
        fontSize: "11px",
        fontFamily: "monospace",
        padding: "10px 16px",
        minWidth: "140px",
      },
    },
    {
      id: "target",
      type: "default",
      position: { x: 250, y: 180 },
      data: { label: `🎯 ${workflow.target.name}` },
      style: {
        background: "#0f1a2e",
        border: "1px solid #3b82f6",
        borderRadius: "10px",
        color: "#7ab4e0",
        fontSize: "11px",
        fontFamily: "monospace",
        padding: "10px 16px",
        minWidth: "140px",
      },
    },
    {
      id: "recon",
      type: "default",
      position: { x: 460, y: 100 },
      data: { label: "🔍 Recon Agent" },
      style: {
        background: "#0f1a2e",
        border: "1px solid #3b82f6",
        borderRadius: "10px",
        color: "#3b82f6",
        fontSize: "11px",
        fontFamily: "monospace",
        padding: "10px 16px",
        minWidth: "140px",
      },
    },
    {
      id: "attack",
      type: "default",
      position: { x: 460, y: 200 },
      data: { label: `⚔️ Red Team Agent\n${(workflow.attackCategories ?? []).join(", ")}` },
      style: {
        background: "#0f1a2e",
        border: "1px solid #ef4444",
        borderRadius: "10px",
        color: "#ef4444",
        fontSize: "11px",
        fontFamily: "monospace",
        padding: "10px 16px",
        minWidth: "140px",
        whiteSpace: "pre-wrap",
      },
    },
    {
      id: "analysis",
      type: "default",
      position: { x: 460, y: 300 },
      data: { label: "📊 Analysis Agent" },
      style: {
        background: "#0f1a2e",
        border: "1px solid #8b5cf6",
        borderRadius: "10px",
        color: "#8b5cf6",
        fontSize: "11px",
        fontFamily: "monospace",
        padding: "10px 16px",
        minWidth: "140px",
      },
    },
    {
      id: "report",
      type: "default",
      position: { x: 680, y: 200 },
      data: { label: "📋 Score + Findings" },
      style: {
        background: "#0f1a2e",
        border: "1px solid #22c55e",
        borderRadius: "10px",
        color: "#22c55e",
        fontSize: "11px",
        fontFamily: "monospace",
        padding: "10px 16px",
        minWidth: "140px",
      },
    },
  ];
}

const DEFAULT_EDGES: Edge[] = [
  { id: "e1", source: "trigger", target: "target", style: { stroke: "#1e3056" } },
  { id: "e2", source: "target", target: "recon", style: { stroke: "#3b82f6", strokeDasharray: "4" } },
  { id: "e3", source: "target", target: "attack", style: { stroke: "#ef4444", strokeDasharray: "4" } },
  { id: "e4", source: "target", target: "analysis", style: { stroke: "#8b5cf6", strokeDasharray: "4" } },
  { id: "e5", source: "recon", target: "report", style: { stroke: "#1e3056" } },
  { id: "e6", source: "attack", target: "report", style: { stroke: "#1e3056" } },
  { id: "e7", source: "analysis", target: "report", style: { stroke: "#1e3056" } },
];

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [runResults, setRunResults] = useState<Record<string, { score: number }>>({});

 const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEFAULT_EDGES);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const [form, setForm] = useState({
    name: "",
    targetId: "",
    mode: "manual",
    attackCategories: ["LLM01", "LLM07"],
  });

  const fetchAll = useCallback(async () => {
    const [wRes, tRes] = await Promise.all([
      fetch("/api/workflows"),
      fetch("/api/targets"),
    ]);
    const wData = await wRes.json();
    const tData = await tRes.json();
    setWorkflows(wData.workflows ?? []);
    setTargets(tData.targets ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // When a workflow is selected, update the canvas
  useEffect(() => {
    if (selectedWorkflow) {
      setNodes(buildNodes(selectedWorkflow));
      setEdges(DEFAULT_EDGES);
    }
  }, [selectedWorkflow, setNodes, setEdges]);

  const handleSelect = (wf: Workflow) => {
    setSelectedWorkflow(wf);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.targetId) return;
    await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", targetId: "", mode: "manual", attackCategories: ["LLM01", "LLM07"] });
    setShowForm(false);
    fetchAll();
  };

  const handleRun = async (workflowId: string) => {
    setRunning(prev => ({ ...prev, [workflowId]: true }));
    // Update nodes to show running state
    setNodes(prev => prev.map(n => ({
      ...n,
      style: { ...n.style, opacity: n.id === "trigger" ? 1 : 0.4 },
    })));

    try {
      const res = await fetch(`/api/workflows/${workflowId}/run`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setRunResults(prev => ({ ...prev, [workflowId]: { score: data.securityScore } }));
        // Restore nodes
        if (selectedWorkflow) setNodes(buildNodes(selectedWorkflow));
      }
    } finally {
      setRunning(prev => ({ ...prev, [workflowId]: false }));
      fetchAll();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this workflow?")) return;
    await fetch(`/api/workflows/${id}`, { method: "DELETE" });
    if (selectedWorkflow?.id === id) setSelectedWorkflow(null);
    fetchAll();
  };

  const toggleCategory = (cat: string) => {
    setForm(f => ({
      ...f,
      attackCategories: f.attackCategories.includes(cat)
        ? f.attackCategories.filter(c => c !== cat)
        : [...f.attackCategories, cat],
    }));
  };

  return (
    <div className="flex h-full" style={{ backgroundColor: "var(--bg-base)" }}>

      {/* Left panel — workflow list */}
      <div
        className="flex flex-col flex-shrink-0 overflow-hidden"
        style={{
          width: "280px",
          borderRight: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-surface)",
        }}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <span className="text-xs font-bold font-mono" style={{ color: "var(--text-primary)" }}>
            Workflows
          </span>
          <button
            onClick={() => { setShowForm(v => !v); setSelectedWorkflow(null); }}
            className="text-[10px] font-mono px-2 py-1 rounded"
            style={{ backgroundColor: "#881337", border: "1px solid #9f1239", color: "#fff1f2" }}
          >
            + New
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="p-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Workflow name..."
              className="w-full rounded px-2 py-1.5 text-[11px] font-mono mb-2 focus:outline-none"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-mid)", color: "var(--text-primary)" }}
            />
            <select
              value={form.targetId}
              onChange={e => setForm(f => ({ ...f, targetId: e.target.value }))}
              className="w-full rounded px-2 py-1.5 text-[11px] font-mono mb-2 focus:outline-none"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-mid)", color: "var(--text-primary)" }}
            >
              <option value="">Select target...</option>
              {targets.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <div className="flex flex-wrap gap-1 mb-2">
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                  style={{
                    border: "1px solid",
                    borderColor: form.attackCategories.includes(cat) ? "#f43f5e" : "var(--border-mid)",
                    color: form.attackCategories.includes(cat) ? "#f43f5e" : "var(--text-faint)",
                    backgroundColor: "transparent",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={handleSubmit}
                className="flex-1 text-[10px] font-mono py-1.5 rounded"
                style={{ backgroundColor: "#881337", color: "#fff1f2", border: "1px solid #9f1239" }}
              >
                Save
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="text-[10px] font-mono px-3 py-1.5 rounded"
                style={{ border: "1px solid var(--border-mid)", color: "var(--text-muted)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Workflow list */}
        <div className="flex-1 overflow-y-auto py-1">
          {loading ? (
            <p className="text-[10px] font-mono px-4 py-3" style={{ color: "var(--text-muted)" }}>Loading...</p>
          ) : workflows.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>No workflows yet</p>
              <p className="text-[10px] font-mono mt-1" style={{ color: "var(--text-faint)" }}>Click + New to create one</p>
            </div>
          ) : (
            workflows.map(wf => {
              const isSelected = selectedWorkflow?.id === wf.id;
              const isRunning = running[wf.id];
              const result = runResults[wf.id];
              return (
                <div
                  key={wf.id}
                  onClick={() => handleSelect(wf)}
                  className="mx-2 my-0.5 rounded-lg px-3 py-2.5 cursor-pointer transition-all"
                  style={{
                    backgroundColor: isSelected ? "var(--bg-elevated)" : "transparent",
                    border: `1px solid ${isSelected ? "var(--border-mid)" : "transparent"}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {wf.name}
                    </span>
                    <span className="text-[9px] font-mono ml-1 flex-shrink-0" style={{ color: STATUS_COLORS[wf.status] }}>
                      {wf.status}
                    </span>
                  </div>
                  <div className="text-[9px] font-mono mb-1.5" style={{ color: "var(--text-muted)" }}>
                    {wf.target.name} · {wf._count.runs} run{wf._count.runs !== 1 ? "s" : ""}
                  </div>
                  {result && (
                    <div className="text-[9px] font-mono mb-1.5" style={{ color: result.score >= 61 ? "#ef4444" : "#22c55e" }}>
                      Score: {result.score}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRun(wf.id); }}
                      disabled={isRunning}
                      className="text-[9px] font-mono px-2 py-0.5 rounded flex-1"
                      style={{
                        backgroundColor: isRunning ? "transparent" : "#881337",
                        border: "1px solid",
                        borderColor: isRunning ? "var(--border-mid)" : "#9f1239",
                        color: isRunning ? "var(--text-muted)" : "#fff1f2",
                      }}
                    >
                      {isRunning ? "Running..." : "▶ Run"}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(wf.id); }}
                      className="text-[9px] font-mono px-2 py-0.5 rounded"
                      style={{ border: "1px solid var(--border-mid)", color: "var(--text-muted)" }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel — React Flow canvas */}
      <div className="flex-1 flex flex-col">
        {/* Canvas header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}
        >
          <div>
            <span className="text-xs font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
              {selectedWorkflow ? selectedWorkflow.name : "Select a workflow"}
            </span>
            {selectedWorkflow && (
              <span className="text-[10px] font-mono ml-2" style={{ color: "var(--text-muted)" }}>
                → {selectedWorkflow.target.name} · {selectedWorkflow.mode} mode
              </span>
            )}
          </div>
          {selectedWorkflow && (
            <div className="flex flex-wrap gap-1">
              {((selectedWorkflow.attackCategories as string[]) ?? []).map(cat => (
                <span key={cat} className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", color: "#f43f5e" }}>
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Flow canvas */}
        {selectedWorkflow ? (
          <div className="flex-1" style={{ backgroundColor: "#080d18" }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              attributionPosition="bottom-right"
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                color="#1a2236"
              />
              <Controls
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-mid)",
                  borderRadius: "8px",
                }}
              />
              <MiniMap
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-mid)" }}
                nodeColor="#1e3056"
              />
            </ReactFlow>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4"
            style={{ backgroundColor: "#080d18" }}>
            <div className="text-4xl opacity-20">⚡</div>
            <p className="text-xs font-mono" style={{ color: "var(--text-faint)" }}>
              Select a workflow to see its canvas
            </p>
            <p className="text-[10px] font-mono" style={{ color: "var(--text-faint)" }}>
              or click + New to create one
            </p>
          </div>
        )}
      </div>
    </div>
  );
}