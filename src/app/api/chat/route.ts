import { handleChatStream, toAISdkStream } from "@mastra/ai-sdk";
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

export async function POST(req: Request) {
  const params = await req.json();
  const messages = params.messages ?? [];
  const lastMsg = messages[messages.length - 1];

  // Extract user text from ai@6 parts format
  const userText =
    lastMsg?.parts?.find((p: { type: string }) => p.type === "text")?.text ??
    lastMsg?.content ??
    "";

  const provider = process.env.LLM_PROVIDER ?? "openrouter";
  const model =
    provider === "ollama"
      ? (process.env.OLLAMA_MODEL ?? "qwen3:8b")
      : (process.env.OPENROUTER_MODEL ?? "unknown");

  // Log the attack immediately
  const logId = Date.now().toString();
  logEntry({
    id: logId,
    timestamp: new Date().toISOString(),
    type: "attack",
    userMessage: userText,
    provider,
    model,
  });

  // Stream and capture response text simultaneously
  let responseText = "";

  const agentStream = await mastra.getAgent("securityAgent").stream(messages);

  const uiStream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      for await (const part of toAISdkStream(agentStream, {
        from: "agent",
        version: "v6",
      })) {
        // Capture text chunks for logging
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
      // Log response once stream is done
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