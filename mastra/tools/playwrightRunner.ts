import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { chromium, Browser, Page } from "playwright";

type PlaywrightArgs = {
  url: string;
  script?: string;
};

/**
 * Simple Playwright tool for Mastra agents.
 * Returns a JSON string with either `html`, `result` or `error`.
 */
export const playwrightTool = createTool({
  id: "playwright",
  description:
    "Automates a headless browser. Provide a URL and optional JavaScript to execute on the page. Returns the page's HTML or the script result.",
  inputSchema: z.object({
    url: z.string().describe("Target URL (including http/https)"),
    script: z.string().optional().describe("JavaScript to run inside the page context"),
  }),
  outputSchema: z.object({
    html: z.string().optional(),
    result: z.any().optional(),
    error: z.string().optional(),
  }),
  async execute({ url, script }) {
    const browser: Browser = await chromium.launch({ headless: true });
    const page: Page = await browser.newPage();
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      if (script) {
        const result = await page.evaluate(script);
        await browser.close();
        return { result };
      }
      const html = await page.content();
      await browser.close();
      return { html };
    } catch (err) {
      await browser.close();
      return { error: (err as Error).message };
    }
  },
});
