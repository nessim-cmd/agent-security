import { Agent } from "@mastra/core/agent";
import { createOpenAI } from "@ai-sdk/openai";
import { BANKING_SYSTEM_PROMPT } from "./systemPrompt";
import { webSearchTool } from "../../tools/webSearch";
import { readFileTool } from "../../tools/readFile";

function getModel() {
  const provider = process.env.LLM_PROVIDER ?? "openrouter";
  if (provider === "ollama") {
    const baseURL = (process.env.OLLAMA_BASE_URL ?? "http://localhost:11434") + "/v1";
    const modelName = process.env.OLLAMA_MODEL ?? "qwen3:8b";
    console.log(`[BankingAgent] 🖥️  LOCAL Ollama → ${modelName}`);
    return createOpenAI({ baseURL, apiKey: "ollama" }).chat(modelName);
  }
  const modelName = process.env.OPENROUTER_MODEL ?? "qwen/qwen3-8b";
  console.log(`[BankingAgent] ☁️  OpenRouter → ${modelName}`);
  return createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY ?? "",
  }).chat(modelName);
}

export const bankingAgent = new Agent({
    id: "banking-agent",
  name: "Alex",
  instructions: BANKING_SYSTEM_PROMPT,
  model: getModel(),
  tools: {
    webSearch: webSearchTool,
    readFile: readFileTool,
  },
});