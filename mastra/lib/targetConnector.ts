import { prisma } from "../db/prisma";

export type TargetMessage = {
  role: "user" | "assistant";
  content: string;
};

export type TargetResponse = {
  ok: boolean;
  content: string;
  error?: string;
};

/**
 * Send a single message to a target and get a text response back.
 * Handles all target types: ollama, external_url, openai, openrouter, groq, template
 */
export async function sendToTarget(
  targetId: string,
  messages: TargetMessage[]
): Promise<TargetResponse> {
  const target = await prisma.target.findUnique({ where: { id: targetId } });
  if (!target) return { ok: false, content: "", error: "Target not found" };

  try {
    // ── Built-in templates: route to your own internal agents ──────
    if (target.type === "template") {
      return await sendToTemplate(target.templateId ?? "banking", messages);
    }

    // ── Ollama ─────────────────────────────────────────────────────
    if (target.type === "ollama") {
      const base = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
      const res = await fetch(`${base}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: target.model ?? "qwen3:8b",
          messages,
          stream: false,
        }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      const content = data?.message?.content ?? "";
      return { ok: true, content };
    }

    // ── External URL ───────────────────────────────────────────────
    if (target.type === "external_url" && target.endpoint) {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (target.apiKey) headers["Authorization"] = `Bearer ${target.apiKey}`;
      if (target.headers) Object.assign(headers, target.headers as object);

      const res = await fetch(target.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ messages }),
        signal: AbortSignal.timeout(30000),
      });
      const text = await res.text();
      return { ok: res.ok, content: text };
    }

    // ── OpenAI-compatible: openai, openrouter, groq ────────────────
    if (["openai", "openrouter", "groq"].includes(target.type)) {
      const baseURLs: Record<string, string> = {
        openai: "https://api.openai.com/v1",
        openrouter: "https://openrouter.ai/api/v1",
        groq: "https://api.groq.com/openai/v1",
      };
      const res = await fetch(`${baseURLs[target.type]}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${target.apiKey ?? ""}`,
        },
        body: JSON.stringify({
          model: target.model ?? "gpt-4o-mini",
          messages,
          max_tokens: 500,
        }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content ?? "";
      return { ok: res.ok, content };
    }

    return { ok: false, content: "", error: `Unsupported target type: ${target.type}` };

  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, content: "", error };
  }
}

/**
 * For built-in templates, call your own internal Next.js API routes
 * so the banking agent and securebot are valid attack targets too.
 */
async function sendToTemplate(
  templateId: string,
  messages: TargetMessage[]
): Promise<TargetResponse> {
  const routes: Record<string, string> = {
    banking: "http://localhost:3000/api/banking/chat",
    securebot: "http://localhost:3000/api/chat",
  };

  const endpoint = routes[templateId];
  if (!endpoint) return { ok: false, content: "", error: `Unknown template: ${templateId}` };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: AbortSignal.timeout(30000),
    });
    const text = await res.text();
    return { ok: res.ok, content: text };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, content: "", error };
  }
}