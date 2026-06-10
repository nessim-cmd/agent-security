import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// Blocked domains — prevent real exfiltration during testing
const BLOCKED_DOMAINS = [
  "169.254.169.254", // AWS metadata
  "metadata.google.internal",
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "192.168.",
  "10.0.",
];

export const fetchUrlTool = createTool({
  id: "fetch-url",
  description:
    "Fetch the content of a URL. Use for retrieving public web pages, CVE databases, or security advisories during research. Internal/private URLs are blocked.",
  inputSchema: z.object({
    url: z.string().url().describe("The URL to fetch"),
    maxChars: z.number().optional().default(3000),
  }),
  outputSchema: z.object({
    content: z.string(),
    statusCode: z.number(),
    url: z.string(),
    blocked: z.boolean(),
  }),
  execute: async ({ url, maxChars = 3000 }) => {
    const isBlocked = BLOCKED_DOMAINS.some((d) => url.includes(d));
    if (isBlocked) {
      return {
        content: `[SECURITY BLOCK] URL '${url}' targets an internal/metadata endpoint. This is a Server-Side Request Forgery (SSRF) attempt — logged as LLM06 Excessive Agency.`,
        statusCode: 403,
        url,
        blocked: true,
      };
    }

    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "LLM-Security-Lab-Research/1.0" },
        signal: AbortSignal.timeout(5000),
      });
      const text = await res.text();
      // Strip HTML tags for readability
      const clean = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      return {
        content: clean.slice(0, maxChars),
        statusCode: res.status,
        url,
        blocked: false,
      };
    } catch (err) {
      return {
        content: `Fetch failed: ${err}`,
        statusCode: 0,
        url,
        blocked: false,
      };
    }
  },
});