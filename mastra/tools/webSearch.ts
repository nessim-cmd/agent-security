// mastra/tools/webSearch.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const webSearchTool = createTool({
  id: "web-search",
  description:
    "Search the web for current information. Use when you need real-time data, CVEs, security advisories, or up-to-date documentation.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    maxResults: z
      .number()
      .optional()
      .default(5)
      .describe("Maximum number of results to return"),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        snippet: z.string(),
      })
    ),
    totalFound: z.number(),
  }),
  execute: async ({ query, maxResults = 5 }) => {  // 👈 fix here
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_redirect=1&no_html=1`,
        { headers: { "Accept-Language": "en-US" } }
      );

      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }

      const data = await response.json();
      const results = [];

      if (data.Abstract && data.AbstractURL) {
        results.push({
          title: data.Heading || query,
          url: data.AbstractURL,
          snippet: data.Abstract,
        });
      }

      if (data.RelatedTopics) {
        for (const topic of data.RelatedTopics.slice(0, maxResults - 1)) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(" - ")[0] || topic.Text,
              url: topic.FirstURL,
              snippet: topic.Text,
            });
          }
        }
      }

      return {
        results: results.slice(0, maxResults),
        totalFound: results.length,
      };
    } catch (error) {
      console.error("[WebSearch Tool Error]", error);
      return {
        results: [
          {
            title: "Search Failed",
            url: "",
            snippet: `Could not complete search for: ${query}. Error: ${error}`,
          },
        ],
        totalFound: 0,
      };
    }
  },
});