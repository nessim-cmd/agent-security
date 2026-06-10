// mastra/index.ts
import { Mastra } from "@mastra/core";
import { securityAgent } from "./agents/securityAgent";

export const mastra = new Mastra({
  agents: {
    securityAgent,
  },
});