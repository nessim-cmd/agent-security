import { Mastra } from "@mastra/core";
import { securityAgent } from "./agents/securityAgent";
import { bankingAgent } from "./agents/bankingAgent/agent";

export const mastra = new Mastra({
  agents: {
    securityAgent,
    bankingAgent,
  },
});