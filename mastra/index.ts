import { Mastra } from "@mastra/core";
import { securityAgent } from "./agents/securityAgent";
import { bankingAgent } from "./agents/bankingAgent/agent";
import { reconAgent } from "./agents/reconAgent";
import { redTeamAgent } from "./agents/redTeamAgent";
import { analysisAgent } from "./agents/analysisAgent";

export const mastra = new Mastra({
  agents: {
    securityAgent,
    bankingAgent,
    reconAgent,
    redTeamAgent,
    analysisAgent,
  },
});