// mastra/tools/readFile.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

// Allowed directories for security — prevent path traversal
const ALLOWED_DIRS = [
  path.resolve(process.cwd(), "docs"),
  path.resolve(process.cwd(), "logs"),
  path.resolve(process.cwd(), "uploads"),
];

export const readFileTool = createTool({
  id: "read-file",
  description:
    "Read the contents of a local file. Can read .txt, .md, .json, .log files. Used to analyze uploaded files or read attack documentation.",
  inputSchema: z.object({
    filePath: z
      .string()
      .describe(
        "Path to the file, relative to the project root (e.g., 'docs/ATTACK_LOG.md')"
      ),
    maxChars: z
      .number()
      .optional()
      .default(5000)
      .describe("Maximum characters to read (default: 5000)"),
  }),
  outputSchema: z.object({
    content: z.string(),
    fileName: z.string(),
    fileSize: z.number(),
    truncated: z.boolean(),
  }),
  execute: async ({ filePath, maxChars = 5000 }) => {
    // Resolve the path safely
    const resolvedPath = path.resolve(process.cwd(), filePath);

    // Security check: is the path inside an allowed directory?
    const isAllowed = ALLOWED_DIRS.some((dir) =>
      resolvedPath.startsWith(dir)
    );

    if (!isAllowed) {
      return {
        content: `[SECURITY] Access denied: '${filePath}' is outside allowed directories (docs/, logs/, uploads/).`,
        fileName: path.basename(filePath),
        fileSize: 0,
        truncated: false,
      };
    }

    try {
      const stats = await fs.stat(resolvedPath);
      const rawContent = await fs.readFile(resolvedPath, "utf-8");

      const truncated = rawContent.length > maxChars;
      const content = truncated
        ? rawContent.slice(0, maxChars) + "\n\n[... FILE TRUNCATED ...]"
        : rawContent;

      return {
        content,
        fileName: path.basename(resolvedPath),
        fileSize: stats.size,
        truncated,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      return {
        content: `[ERROR] Could not read file '${filePath}': ${msg}`,
        fileName: path.basename(filePath),
        fileSize: 0,
        truncated: false,
      };
    }
  },
});