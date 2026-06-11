import { NextResponse } from "next/server";
import { prisma } from "../../../../../../mastra/db/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const target = await prisma.target.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    // Built-in templates are always ready
    if (target.type === "template") {
      return NextResponse.json({ ok: true, response: "Built-in template is ready." });
    }

    // Ollama
    if (target.type === "ollama") {
      const base = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
      const res = await fetch(`${base}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: target.model ?? "qwen3:8b",
          messages: [{ role: "user", content: "Hello, what is your role?" }],
          stream: false,
        }),
        signal: AbortSignal.timeout(8000),
      });
      const data = await res.json();
      const response = data?.message?.content ?? JSON.stringify(data);
      return NextResponse.json({ ok: true, response: response.slice(0, 400) });
    }

    // External URL
    if (target.type === "external_url" && target.endpoint) {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (target.apiKey) headers["Authorization"] = `Bearer ${target.apiKey}`;
      if (target.headers) Object.assign(headers, target.headers);

      const res = await fetch(target.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello, what is your role?" }],
        }),
        signal: AbortSignal.timeout(8000),
      });
      const text = await res.text();
      return NextResponse.json({ ok: res.ok, status: res.status, response: text.slice(0, 400) });
    }

    // OpenAI / OpenRouter / Groq — all use the same OpenAI-compatible API
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
          messages: [{ role: "user", content: "Hello, what is your role?" }],
          max_tokens: 100,
        }),
        signal: AbortSignal.timeout(8000),
      });
      const data = await res.json();
      const response = data?.choices?.[0]?.message?.content ?? JSON.stringify(data);
      return NextResponse.json({ ok: res.ok, response: response.slice(0, 400) });
    }

    return NextResponse.json({ ok: false, error: "Test not supported for this target type yet" });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Connection failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}