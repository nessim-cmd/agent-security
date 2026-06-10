import { toAISdkStream } from "@mastra/ai-sdk";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { mastra } from "../../../../mastra";
import fs from "fs";
import path from "path";

const LOG_PATH = path.join(process.cwd(), "logs", "attacks.jsonl");
fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });

function logEntry(entry: object) {
  try {
    fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + "\n", "utf-8");
  } catch (e) {
    console.error("[Logger]", e);
  }
}

// ── Convert AI SDK UIMessages → Mastra-compatible messages ────────────
// UIMessages have a `parts` array that may contain non-text entries like
// `step-start`, tool calls, etc. Mastra requires {id, createdAt, role, content}.
type UIMessageLike = {
  id?: string;
  role?: string;
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
};

type MastraMessage = {
  id: string;
  createdAt: Date;
  role: "user" | "assistant";
  content: string;
};

function toMastraMessages(messages: UIMessageLike[]): MastraMessage[] {
  const result: MastraMessage[] = [];

  for (const msg of messages) {
    const role = msg.role === "assistant" ? "assistant" : "user";

    // Extract only text parts (ignore step-start, tool calls, etc.)
    let content = "";
    if (Array.isArray(msg.parts)) {
      content = msg.parts
        .filter((p) => p.type === "text" && typeof p.text === "string")
        .map((p) => p.text as string)
        .join("")
        .trim();
    }

    // Fall back to content string if parts had nothing
    if (!content && typeof msg.content === "string") {
      content = msg.content.trim();
    }

    // Skip messages with no extractable text (pure tool-call messages, etc.)
    if (!content) continue;

    result.push({
      id: msg.id ?? crypto.randomUUID(),
      createdAt: new Date(),
      role,
      content,
    });
  }

  return result;
}

export async function POST(req: Request) {
  const params = await req.json();
  const rawMessages: UIMessageLike[] = params.messages ?? [];
  const lastMsg = rawMessages[rawMessages.length - 1];

  // Extract user text for logging
  const userText =
    lastMsg?.parts?.find((p) => p.type === "text")?.text ??
    lastMsg?.content ??
    "";

  const provider = process.env.LLM_PROVIDER ?? "openrouter";
  const model =
    provider === "ollama"
      ? (process.env.OLLAMA_MODEL ?? "qwen3:8b")
      : (process.env.OPENROUTER_MODEL ?? "unknown");

  const logId = Date.now().toString();
  logEntry({
    id: logId,
    timestamp: new Date().toISOString(),
    type: "attack",
    userMessage: userText,
    provider,
    model,
  });

  // Sanitize messages for Mastra — strips step-start parts, adds id + createdAt
  const mastraMessages = toMastraMessages(rawMessages);

  let responseText = "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agentStream = await mastra.getAgent("securityAgent").stream(mastraMessages as any);

  const uiStream = createUIMessageStream({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    originalMessages: rawMessages as any,
    execute: async ({ writer }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for await (const part of toAISdkStream(agentStream, {
        from: "agent",
        version: "v6",
      }) as any) {
        if (
          part.type === "text-delta" &&
          "textDelta" in part &&
          typeof part.textDelta === "string"
        ) {
          responseText += part.textDelta;
        }
        await writer.write(part);
      }
    },
    onFinish: () => {
      logEntry({
        id: logId,
        timestamp: new Date().toISOString(),
        type: "response",
        responsePreview: responseText.slice(0, 500),
        provider,
        model,
      });
    },
  });

  return createUIMessageStreamResponse({ stream: uiStream });
}

// Handle file uploads
export async function PUT(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = path.join(uploadDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return Response.json({
    success: true,
    fileName: safeName,
    size: buffer.length,
    path: `uploads/${safeName}`,
  });
}