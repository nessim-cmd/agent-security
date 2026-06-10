// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CRITICAL: Mastra uses Node-only modules.
  // This tells Next.js NOT to bundle them into the edge runtime.
  serverExternalPackages: ["@mastra/*"],
};

export default nextConfig;