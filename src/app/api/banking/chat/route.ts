import { handleChatStream, toAISdkStream } from "@mastra/ai-sdk";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { mastra } from "../../../../../mastra";
import { prisma } from "../../../../../mastra/db/prisma";

export async function POST(req: Request) {
  const params = await req.json();
  const messages = params.messages ?? [];
  const lastMsg = messages[messages.length - 1];
  const userText =
    lastMsg?.parts?.find((p: { type: string }) => p.type === "text")?.text ??
    lastMsg?.content ?? "";

  const provider = process.env.LLM_PROVIDER ?? "openrouter";
  const model = provider === "ollama"
    ? (process.env.OLLAMA_MODEL ?? "qwen3:8b")
    : (process.env.OPENROUTER_MODEL ?? "unknown");

  // Log attack immediately
  await prisma.attackLog.create({
    data: {
      agentId: "bankingAgent",
      userMessage: userText,
      provider,
      model,
    },
  }).catch(console.error);

  let responseText = "";

  const agentStream = await mastra.getAgent("bankingAgent").stream(messages);

  const uiStream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      for await (const part of toAISdkStream(agentStream, { from: "agent", version: "v6" })) {
        if (part.type === "text-delta" && "textDelta" in part && typeof part.textDelta === "string") {
          responseText += part.textDelta;
        }
        await writer.write(part);
      }
    },
    onFinish: async () => {
      // Update log with response
      await prisma.attackLog.updateMany({
        where: { agentId: "bankingAgent", userMessage: userText },
        data: { agentResponse: responseText.slice(0, 1000) },
      }).catch(console.error);
    },
  });

  return createUIMessageStreamResponse({ stream: uiStream });
}