declare global {
  interface AgentStatus {
    initialized: boolean;
    online: boolean;
    model?: string | null;
    lastError?: string | null;
  }

  interface Window {
    AGENT_STATUS: AgentStatus;
    probeAgent?: (msg?: string) => Promise<any>;
    getKnowledgeSnippet?: (query: string, maxResults?: number) => string;
    bootstrapRag?: () => void;
    agentTeam?: any;
    AGENTLEE_MODEL_BASE_URL?: string;
    AGENTLEE_RUNTIME?: {
      LOCAL_ONLY?: boolean;
      MODEL_BASE_URL?: string;
      [key: string]: unknown;
    };
  }
}

export { };

