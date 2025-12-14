/* ============================================================================
LEEWAY HEADER — DO NOT REMOVE
PROFILE: LEEWAY-ORDER
TAG: CORE.CONFIG.TYPES.GLOBAL
REGION: 🟢 CORE

STACK: LANG=ts; FW=none; UI=none; BUILD=node
RUNTIME: browser
TARGET: config

DISCOVERY_PIPELINE:
  MODEL=Voice>Intent>Location>Vertical>Ranking>Render;
  ROLE=support;
  INTENT_SCOPE=n/a;
  LOCATION_DEP=none;
  VERTICALS=n/a;
  RENDER_SURFACE=n/a;
  SPEC_REF=LEEWAY.v12.DiscoveryArchitecture

LEEWAY-LD:
{
  "@context": ["https://schema.org", {"leeway":"https://leeway.dev/ns#"}],
  "@type": "SoftwareSourceCode",
  "name": "Global TypeScript Type Definitions",
  "programmingLanguage": "TypeScript",
  "runtimePlatform": "browser",
  "about": ["LEEWAY", "TypeScript", "Declarations"],
  "identifier": "CORE.CONFIG.TYPES.GLOBAL",
  "license": "MIT",
  "dateModified": "2025-12-09"
}

5WH: WHAT=Global TypeScript type definitions; WHY=Extend Window interface and global types; WHO=Agent Lee System; WHERE=/global.d.ts; WHEN=2025-12-09; HOW=TypeScript declaration merging
SPDX-License-Identifier: MIT
============================================================================ */

declare global {
  interface AgentStatus {
    initialized: boolean;
    online: boolean;
    model?: string | null;
    lastError?: string | null;
  }

  interface AgentLeeConfig {
    MCP_BRIDGE_URL?: string;
    PHONE_MCP_HTTP_BASE?: string;
    WINDOWS_MCP_HTTP_BASE?: string;
    [key: string]: unknown;
  }

  interface Window {
    AGENT_STATUS: AgentStatus;
    probeAgent?: (msg?: string) => Promise<any>;
    getKnowledgeSnippet?: (query: string, maxResults?: number) => string;
    bootstrapRag?: () => void;
      probeAgent?: (msg?: string) => Promise<{ ok: boolean; response?: unknown; error?: string }>;
    agentTeam?: any;
    AGENTLEE_MODEL_BASE_URL?: string;
    AGENTLEE_RUNTIME?: {
      LOCAL_ONLY?: boolean;
      MODEL_BASE_URL?: string;
      [key: string]: unknown;
    };
    AGENTLEE_CONFIG?: AgentLeeConfig;
    __AGENTLEE_CFG?: AgentLeeConfig;
    embedderLLM?: any;
    Embedder?: any;
    EmbedderLLM?: any;
    __BASE_URL__?: string;
  }
}

export { };

// Ambient module declarations for JS bundles referenced in TS code
declare module './Models/agentlee-local-bundle.js';
declare module '../Models/agentlee-local-bundle.js';
declare module './Models/AgentLeeBrain.tsx';

