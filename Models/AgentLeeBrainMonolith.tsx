/* ============================================================================
   LEEWAY HEADER — DO NOT REMOVE
   PROFILE: LEEWAY-ORDER
   TAG: CORE.AGENTLEE.BRAIN.MONOLITH
   REGION: 🧠 AI

   STACK: LANG=ts; FW=react; UI=tailwind; BUILD=vite
   RUNTIME: browser
   TARGET: agent-module

   DISCOVERY_PIPELINE:
     MODEL=Voice>Intent>Location>Vertical>Ranking>Render;
     ROLE=primary;
     INTENT_SCOPE=multi;
     LOCATION_DEP=none;
     VERTICALS=infra, ai, ops;
     RENDER_SURFACE=browser;
     SPEC_REF=LEEWAY.v12.DiscoveryArchitecture

   LEEWAY-LD:
   {
     "@context": ["https://schema.org", {"leeway":"https://leeway.dev/ns#"}],
     "@type": "SoftwareSourceCode",
     "name": "Agent Lee Brain Monolith",
     "programmingLanguage": "TypeScript",
     "runtimePlatform": "browser",
     "about": ["LEEWAY","AgentLee","RAG","KnowledgeBase","Config"],
     "identifier": "CORE.AGENTLEE.BRAIN.MONOLITH",
     "license": "MIT",
     "dateModified": "2025-12-12"
   }

   5WH: WHAT=Unified brain component for Agent Lee; WHY=Provide a single file that holds runtime config, web sources, references, knowledge, and agent UI; WHO=Leeway Industries; WHERE=/Models/AgentLeeBrainMonolith.tsx; WHEN=2025-12-12; HOW=React + TS + local RAG helpers
   SPDX-License-Identifier: MIT
   ============================================================================ */

import type { Pipeline } from "@xenova/transformers";
import { env, pipeline } from "@xenova/transformers";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// Leeway standard: use @google/genai client as declared in package.json
// Optional: Gemini client (omitted; use local models per Leeway LOCAL_ONLY)

/* ============================================================================
   1. RUNTIME CONFIG (inlined from config.js + server dynamic config intent)
   ============================================================================ */

(function runtimeConfigInit() {
  try {
    // base config.js behavior
    (window as any).AGENTLEE_RUNTIME =
      (window as any).AGENTLEE_RUNTIME || { LOCAL_ONLY: true };

    // mirror of server /config.js behavior (server will OR in LOCAL_ONLY)
    const current = (window as any).AGENTLEE_RUNTIME || {};
    const next = { ...current, LOCAL_ONLY: true };
    (window as any).AGENTLEE_RUNTIME = next;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("AgentLeeBrainMonolith runtime init failed", e);
  }
})();

/* ============================================================================
   1.2. ONNX Runtime Web log suppression (set before any model loads)
   ============================================================================ */
(function quietOrtLogs() {
  try {
    const ort: any = (globalThis as any).ort;
    if (ort?.env) {
      // Reduce noisy graph optimizer warnings ([W:onnxruntime:,...])
      ort.env.logLevel = 'error'; // valid levels: 'verbose'|'info'|'warning'|'error'|'fatal'
    }
  } catch {}
})();

// Ultra-narrow console filter for known noisy warnings (ORT and streaming fetch)
(function filterSpecificWarnings() {
  try {
    const originalWarn = console.warn.bind(console);
    console.warn = (...args: any[]) => {
      try {
        const first = args?.[0];
        if (typeof first === 'string') {
          // Drop ORT graph cleanup spam
          if (first.includes('onnxruntime') && first.includes('CleanUnusedInitializersAndNodeArgs')) {
            return;
          }
          // Drop harmless transformers streaming warning (no content-length provided)
          if (first.includes('Unable to determine content-length from response headers')) {
            return;
          }
        }
      } catch {}
      return originalWarn(...args);
    };
  } catch {}
})();

/* ============================================================================
   1.1. ADDITIONAL CONFIGURATION (from global.d.ts)
   ============================================================================ */

(function additionalConfigInit() {
  try {
    const currentConfig = (window as any).AGENTLEE_CONFIG || {};
    const defaultConfig = {
      MCP_BRIDGE_URL: "https://default-bridge-url.com",
      MODEL_BASE_URL: "https://default-model-url.com",
    };
    (window as any).AGENTLEE_CONFIG = { ...defaultConfig, ...currentConfig };
  } catch (e) {
    console.warn("AgentLeeBrainMonolith additional config init failed", e);
  }
})();

/* ============================================================================
   2. TYPES
   ============================================================================ */

type SlideNarration = {
  paragraphs: string[];
  bullets: string[];
};

type StorySlide = {
  id: string;
  title: string;
  chartKind?: string;
  navItem?: string;
  narration?: SlideNarration;
};

type Acquisition = {
  name: string;
  region: string;
  year: number | string;
  coordinates?: { x?: number | string; y?: number | string };
};

type CaseStudy = {
  study: string;
  beforeCost?: number;
  afterCost?: number;
  metric?: string;
};

type VelocityPoint = {
  year: number | string;
  revenue?: number;
  ebitda?: number;
  notes?: string;
};

type EvidenceItem = {
  tag: string;
  title: string;
  url?: string;
  date?: string;
};

type FinancialItem = {
  category: string;
  value: number | string;
  type?: string;
};

type MockData = {
  evidenceItems?: EvidenceItem[];
  financials?: FinancialItem[];
  acquisitions?: Acquisition[];
  caseStudies?: CaseStudy[];
  velocity?: VelocityPoint[];
};

type StoryConfig = {
  slides: StorySlide[];
};

type ClaimEvidence = {
  pageNumber: number;
  pageTitle: string;
  claim: string;
  visibility: "Public" | "Internal" | string;
  sources: string[];
  webSourceIds: string[];
};

type WebSource = {
  id: string;
  label: string;
  url: string;
  category: string;
  tags: string[];
};

type WebSourceView = {
  category: string;
  url: string;
  topicTags: string[];
  name: string;
  id: string;
};

/* ============================================================================
   3. WEB SOURCES (inlined from webSources.js)
   ============================================================================ */

// NOTE: This is the same structure as webSources.js, condensed into one file.
// You can expand/adjust as needed; the key is the catalog + suggest logic.
export const WEB_SOURCES: WebSource[] = [
  // === Visu-Sewer core ===
  {
    id: "visu_root",
    label: "Visu-Sewer – Home",
    url: "https://visu-sewer.com",
    category: "Visu-Sewer",
    tags: ["company", "overview"],
  },
  {
    id: "visu_projects",
    label: "Visu-Sewer – Projects",
    url: "https://visu-sewer.com/projects",
    category: "Visu-Sewer",
    tags: ["projects", "case_studies"],
  },
  {
    id: "visu_overview",
    label: "Visu-Sewer – Overview",
    url: "https://visu-sewer.com/overview",
    category: "Visu-Sewer",
    tags: ["overview"],
  },
  {
    id: "visu_muni",
    label: "Visu-Sewer – Serving Municipalities",
    url: "https://visu-sewer.com/serving-municipalities",
    category: "Visu-Sewer",
    tags: ["municipal", "service_model"],
  },

  // === HOVMSD anchor ===
  {
    id: "hov_root",
    label: "HOVMSD – Home",
    url: "https://hvmsd.org",
    category: "HOVMSD",
    tags: ["district"],
  },
  {
    id: "hov_project",
    label: "HOVMSD – Interceptor Rehabilitation Project",
    url: "https://hvmsd.org/interceptor-rehabilitation-project",
    category: "HOVMSD",
    tags: ["project", "interceptor", "hovmsd"],
  },
  {
    id: "hov_award",
    label: "HOVMSD Contract Award PDF",
    url: "https://hvmsd.org/wp-content/uploads/2023/08/HOV_Contract_Award.pdf",
    category: "HOVMSD",
    tags: ["contract", "award", "pdf", "hovmsd"],
  },

  // === Ownership / PE ===
  {
    id: "fortpoint_visu_2023_11_27",
    label: "Fort Point Capital – Visu-Sewer portfolio overview",
    url: "https://fortpointcapital.com/portfolio/visusewer",
    category: "Ownership",
    tags: ["private-equity", "fort-point", "platform"],
  },

  // === Contract scale ===
  {
    id: "fox11_hov_2023_08_08",
    label: "Fox11 – HOVMSD interceptor rehabilitation award",
    url: "https://fox11online.com/news/local/heart-of-the-valley-metropolitan-sewerage-district-awards-contract-for-rehabilitation-project",
    category: "Contract",
    tags: ["hovmsd", "18.1m", "award", "2023"],
  },

  // === Municipal examples ===
  {
    id: "fox_root",
    label: "Village of Fox Point – Home",
    url: "https://villageoffoxpoint.com",
    category: "Municipal",
    tags: ["fox_point"],
  },
  {
    id: "fox_public_works",
    label: "Fox Point – Public Works",
    url: "https://villageoffoxpoint.com/213/Public-Works",
    category: "Municipal",
    tags: ["fox_point", "public_works"],
  },
  {
    id: "fox_sewer_lining_2025",
    label: "Fox Point – 2025 Sewer Lining Project PDF",
    url: "https://villageoffoxpoint.com/DocumentCenter/View/6052/2025-Sewer-Lining-Project",
    category: "Municipal",
    tags: ["fox_point", "sewer_lining", "project_doc", "pdf"],
  },
  {
    id: "schaumburg_root",
    label: "Village of Schaumburg – Home",
    url: "https://schaumburg.com",
    category: "Municipal",
    tags: ["schaumburg"],
  },
  {
    id: "schaumburg_agenda",
    label: "Schaumburg – Project Agenda PDF",
    url: "https://schaumburg.novusagenda.com/agendapublic/Blobs/857364.pdf",
    category: "Municipal",
    tags: ["schaumburg", "agenda", "project_doc", "pdf"],
  },
  {
    id: "wauwatosa_root",
    label: "City of Wauwatosa – Home",
    url: "https://wauwatosa.net",
    category: "Municipal",
    tags: ["wauwatosa"],
  },
  {
    id: "wauwatosa_sewer",
    label: "Wauwatosa – Sewers & Stormwater",
    url: "https://wauwatosa.net/services/public-works/sewers-stormwater",
    category: "Municipal",
    tags: ["wauwatosa", "sewer", "stormwater"],
  },

  // === Industry ===
  {
    id: "trenchless_tech",
    label: "Trenchless Technology",
    url: "https://trenchlesstechnology.com",
    category: "Industry",
    tags: ["trenchless", "cipp"],
  },
  {
    id: "nationalliner",
    label: "National Liner",
    url: "https://nationalliner.com",
    category: "Industry",
    tags: ["cipp", "liner"],
  },
  {
    id: "pipelinerpros",
    label: "Pipeliner Pros",
    url: "https://pipelinerpros.com",
    category: "Industry",
    tags: ["cipp"],
  },
  {
    id: "patriotic_cipp",
    label: "Patriotic Plumbing – CIPP Overview",
    url: "https://patrioticplumbingandrooter.com/cured-in-place-pipe-cipp/",
    category: "Industry",
    tags: ["cipp", "explainer"],
  },
  {
    id: "wwdmag",
    label: "Water & Wastes Digest",
    url: "https://wwdmag.com",
    category: "Industry",
    tags: ["water", "wastewater"],
  },
];

export function suggestWebSources(query: string, max = 5): WebSource[] {
  const q = (query || "").toLowerCase();
  const scored = WEB_SOURCES.map((src) => {
    let score = 0;
    if (src.label.toLowerCase().includes(q)) score += 3;
    if (src.category.toLowerCase().includes(q)) score += 2;
    for (const tag of src.tags) {
      if (q.includes(tag.toLowerCase())) score += 1;
    }
    return { src, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.src);
}

/* ============================================================================
   4. REFERENCES REGISTRY (inlined from referencesRegistry.js)
   ============================================================================ */

export const claimEvidence: ClaimEvidence[] = [
  {
    pageNumber: 1,
    pageTitle: "Company Background",
    claim:
      "Visu-Sewer was founded in 1975 in Pewaukee, Wisconsin and grew into a leading Midwest platform for inspection, maintenance, and trenchless rehabilitation.",
    visibility: "Public",
    sources: [
      "Visu-Sewer homepage",
      "Fort Point Capital – Visu-Sewer portfolio overview",
    ],
    webSourceIds: ["visu_root", "fortpoint_visu_2023_11_27"],
  },
  {
    pageNumber: 5,
    pageTitle: "Mid-Atlantic Expansion",
    claim:
      "The MOR Construction acquisition expands Visu-Sewer’s operating footprint into Pennsylvania, Delaware, and New Jersey.",
    visibility: "Public",
    sources: [
      "PR Newswire – Visu-Sewer acquires MOR Construction",
      "Underground Infrastructure – Mid-Atlantic expansion",
    ],
    webSourceIds: ["pr_mor_2025_10_01", "ui_mor_2025_10"],
  },
  {
    pageNumber: 5,
    pageTitle: "Strategic Rationale",
    claim:
      "The strategic rationale for acquiring MOR is to add an established regional operator with 20+ years of growth, align customer-first service culture, and accelerate Visu-Sewer’s platform expansion across aging infrastructure markets.",
    visibility: "Public",
    sources: [
      "PR Newswire – Visu-Sewer acquires MOR Construction",
      "Epicos – Visu-Sewer acquires MOR Construction",
      "Water & Wastes Digest – Mid-Atlantic acquisition",
    ],
    webSourceIds: [
      "pr_mor_2025_10_01",
      "epicos_mor_2025_09_30",
      "wwd_mor_2025_10_07",
    ],
  },
  {
    pageNumber: 8,
    pageTitle: "Contract Scale",
    claim:
      "Visu-Sewer has executed large municipal rehabilitation work, including an $18.1M interceptor rehabilitation award with HOVMSD.",
    visibility: "Public",
    sources: ["Fox11 – HOVMSD interceptor rehabilitation award"],
    webSourceIds: ["fox11_hov_2023_08_08"],
  },
];

// Browser-friendly projection of WEB_SOURCES into a lightweight view model
export const webSources: WebSourceView[] = WEB_SOURCES.map((s) => ({
  category: s.category,
  url: s.url,
  topicTags: s.tags,
  name: s.label,
  id: s.id,
}));

// Advisory pack: AI Strategy YAML (trimmed for brevity – you can paste full text)
export const VISU_SEWER_AI_STRATEGY_YAML = `
ai_strategy_for_visusewer_com:
  context:
    - "Website currently has no AI layer"
    - "Services include sewer inspection, drain cleaning, and trenchless rehabilitation"
  goals:
    - "Add AI-assisted intake and triage for municipalities and contractors"
    - "Surface inspection evidence and case studies in a guided narrative"
  guardrails:
    - "Do not overstate ROI; label speculative numbers as targets"
    - "Keep corporate history and contract scale strictly factual"
`;

/* ============================================================================
   5. KNOWLEDGE BASE GENERATOR (inlined from knowledgeBase.js)
   ============================================================================ */

const VISU_SEWER_TITLES = [
  "Guardians Beneath the Streets: The Visu-Sewer Story",
  "Beneath the Surface: The Unsung Heroes of Visu-Sewer",
  "Through the Tunnels: 50 Years of Visu-Sewer Excellence",
  "Eye on the Underground: Technology and Tradition at Visu-Sewer",
  "Saving Cities: Visu-Sewer and the Art of Trenchless Repair",
];

const STRATEGY_GUARDRAILS = `
=== GUARDRAILS: FACTS VS ADVICE ===
1) Treat Visu-Sewer corporate history, ownership, acquisitions, and contract scale as FACTS.
2) Treat website AI rollout steps as ADVISORY BEST PRACTICE.
3) Do not state numeric ROI lifts as factual unless they are present in internal analytics or explicitly labeled as targets.
4) If unsure, label the statement as an assumption or recommendation.
`.trim();

// Minimal cross-industry AI sewer evidence block (snippet)
const AI_SEWER_EVIDENCE = `
AI SEWER MAINTENANCE EVIDENCE:
- PACP/LACP/MACP coding remains the gold standard for condition assessment.
- AI systems can pre-score defects, but certified human reviewers remain the final authority.
- No AI product is certified to replace all NASSCO codes; use AI to assist, not replace, inspectors.
- Video quality, location accuracy, and metadata integrity are key for any AI pipeline.
`;

/**
 * Build a strict, deck-aware knowledge base string.
 * This is fed into local models (Gemma, Llama, PHI-3, etc.) as context.
 */
export function GENERATE_KNOWLEDGE_BASE(
  STORY_CONFIG_INPUT: StoryConfig | null | undefined,
  MOCK_DATA_INPUT: MockData | null | undefined,
  referencesOverride?: {
    claimEvidence?: ClaimEvidence[];
    VISU_SEWER_AI_STRATEGY_YAML?: string;
  }
): string {
  const STORY_CONFIG = STORY_CONFIG_INPUT || (typeof window !== 'undefined' ? (window as any).STORY_CONFIG : null) || (typeof STORY_CONFIG_INPUT !== 'undefined' ? STORY_CONFIG_INPUT : undefined) || (globalThis as any).STORY_CONFIG || ({} as StoryConfig);
  const MOCK_DATA = MOCK_DATA_INPUT || (typeof window !== 'undefined' ? (window as any).MOCK_DATA : null) || (typeof MOCK_DATA_INPUT !== 'undefined' ? MOCK_DATA_INPUT : undefined) || (globalThis as any).MOCK_DATA || ({} as MockData);
  const refs = {
    claimEvidence,
    VISU_SEWER_AI_STRATEGY_YAML,
    ...(referencesOverride || {}),
  };

  // 1) Slide navigation map
  const navigationMap = (STORY_CONFIG.slides || [])
    .map(
      (s: any, i: number) =>
        `Slide ${i + 1}: "${s.title}" (ID: ${s.id}) - Topics: ${
          s.chartKind || "generic"
        }, ${s.navItem || "N/A"}`
    )
    .join("\n");

  // 2) Slide narrative + bullets
  const slidesContext = (STORY_CONFIG.slides || [])
    .map((s: any) => {
      const paragraphs = s.narration?.paragraphs || [];
      const bullets = s.narration?.bullets || [];
      return `SLIDE [${s.title}] (ID=${s.id}):\n${paragraphs.join(
        " "
      )}\nKey points: ${bullets.join("; ")}`;
    })
    .join("\n\n");

  // 3) Evidence locker
  const evidenceContext = (MOCK_DATA.evidenceItems || [])
    .map(
      (e: any) =>
        `EVIDENCE [${e.tag}] ${e.title}: ${
          e.url || "Internal Data"
        } (${e.date || "n.d."})`
    )
    .join("\n");

  // 4) Financials
  const financialContext = (MOCK_DATA.financials || [])
    .map(
      (f: any) =>
        `FINANCIAL: ${f.category} = ${f.value}M (${f.type || "metric"})`
    )
    .join("\n");

  // 5) Acquisitions / footprint
  const acquisitionContext = (MOCK_DATA.acquisitions || [])
    .map(
      (a: any) =>
        `ACQUISITION: ${a.name} in ${a.region} (${a.year}). Coordinates: ${a.coordinates?.x}, ${a.coordinates?.y}`
    )
    .join("\n");

  // 6) Case studies
  const caseStudyContext = (MOCK_DATA.caseStudies || [])
    .map((c: any) => {
      const costText =
        c.beforeCost && c.afterCost
          ? `reduced cost from $${c.beforeCost} to $${c.afterCost}`
          : "";
      return `CASE STUDY: ${c.study} ${costText}`.trim();
    })
    .join("\n");

  // 7) Operational trajectory
  const velocityContext = (MOCK_DATA.velocity || [])
    .map(
      (v: any) =>
        `TRAJECTORY: Year ${v.year} - Revenue=${v.revenue ?? "n/a"}M, EBITDA=${
          v.ebitda ?? "n/a"
        }M, Notes=${v.notes ?? "n/a"}`
    )
    .join("\n");

  // 8) AI cross-industry evidence
  const aiSewerEvidence = AI_SEWER_EVIDENCE;

  // 9) Claim → source map and title candidates
  const claimContext = (refs.claimEvidence || [])
    .map((c) => `CLAIM: ${c.claim} (Page ${c.pageNumber}: ${c.pageTitle})`)
    .join("\n");
  const titleContext = VISU_SEWER_TITLES.map(
    (t) => `TITLE OPTION: ${t}`
  ).join("\n");
  const aiStrategyYaml = refs.VISU_SEWER_AI_STRATEGY_YAML || "";

  return `
*** STRICT KNOWLEDGE BASE ***
You must answer based on the following verified facts about Visu-Sewer, the deck, and the AI sewer infrastructure evidence. Do NOT hallucinate company-specific numbers that are not present here. When data is not present, say so and reason conceptually.

${STRATEGY_GUARDRAILS}

=== NAVIGATION MAP (Slide Index) ===
${navigationMap}

=== EVIDENCE LOCKER (Deck Evidence Items) ===
${evidenceContext}

=== CLAIM → SOURCE MAP (Human Curated) ===
${claimContext}

=== STORY TITLE CANDIDATES ===
${titleContext}

=== FINANCIALS (Deck-Level) ===
${financialContext}

=== ACQUISITIONS & FOOTPRINT ===
${acquisitionContext}

=== CASE STUDIES (Deck-Level) ===
${caseStudyContext}

=== OPERATIONAL TRAJECTORY ===
${velocityContext}

=== PRESENTATION NARRATIVE (SLIDES) ===
${slidesContext}

=== AI SEWER MAINTENANCE EVIDENCE (CROSS-INDUSTRY) ===
${aiSewerEvidence}

=== AI STRATEGY FOR VISUSEWER.COM (ADVISORY) ===
${aiStrategyYaml}
`.trim();
}

/**
 * Simple local text search helper over the knowledge base string.
 * Useful for very small local models that benefit from pre-filtered context.
 */
export function simpleKnowledgeSearch(
  STORY_CONFIG: StoryConfig,
  MOCK_DATA: MockData,
  query: string,
  maxLines = 40
): string {
  const kb = GENERATE_KNOWLEDGE_BASE(STORY_CONFIG, MOCK_DATA);
  const lines = kb.split("\n");
  const terms = (query || "")
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean);

  if (!terms.length) return kb;

  const scored = lines
    .map((line) => {
      const l = line.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (!t) continue;
        if (l.includes(t)) score += 1;
        const tokens = l.split(/\W+/);
        if (tokens.includes(t)) score += 1;
      }
      return { line, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, maxLines).map((s) => s.line);
  return top.join("\n");
}

/**
 * SEARCH_KNOWLEDGE_BASE: Returns top N lines from the KB matching the query terms.
 */
export function SEARCH_KNOWLEDGE_BASE(
  STORY_CONFIG: StoryConfig,
  MOCK_DATA: MockData,
  query: string,
  maxLines = 20
): string[] {
  const kb = GENERATE_KNOWLEDGE_BASE(STORY_CONFIG, MOCK_DATA);
  const lines = kb.split("\n");
  const terms = (query || "").toLowerCase().split(/\W+/).filter(Boolean);
  if (!terms.length) return lines.slice(0, maxLines);
  const scored = lines
    .map((line) => {
      const l = line.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (!t) continue;
        if (l.includes(t)) score += 1;
        const tokens = l.split(/\W+/);
        if (tokens.includes(t)) score += 1;
      }
      return { line, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, maxLines).map((s) => s.line);
}

/* ============================================================================
   6. SERVER AWARENESS SNAPSHOT (from server.js)
   ============================================================================ */

// This is NOT a running server in the browser. It is a snapshot of the
// server responsibilities so the agent has awareness of the environment.

export const SERVER_DOC = `
Express Static File Server (Agent Lee Edition)
- Serves built assets from 'docs' (Vite build output)
- Enforces COOP/COEP headers for Local AI/WASM support (SharedArrayBuffer)
- Provides diagnostic endpoints:
/inspect-requests (GET): recent request log
/inspect-requests/clear (POST): clear log
/healthz (GET): health check
/config.js (GET): dynamic runtime config injection (LOCAL_ONLY: true)
- SPA fallback: unknown GET requests that accept HTML are served index.html
- Security headers:
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  Access-Control-Allow-Origin: *
`;

/* ============================================================================
   7. LOCAL MODEL HUB (lightweight facade)
   ============================================================================ */

env.localModelPath = "models/";
env.allowLocalModels = true;

type LocalModelHubState = {
  embedderReady: boolean;
  textGenReady: boolean;
  lastError?: string;
};

export class LocalModelHub {
  private embedder?: Pipeline;
  private textGen?: Pipeline;
  state: LocalModelHubState = { embedderReady: false, textGenReady: false };

  async initialize() {
    try {
      this.embedder = (await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2")) as Pipeline;
      this.state.embedderReady = true;
    } catch (e: any) {
      this.state.lastError = `Embedder init failed: ${e?.message || e}`;
    }

    try {
      this.textGen = (await pipeline("text-generation", "Xenova/gpt2")) as Pipeline;
      this.state.textGenReady = true;
    } catch (e: any) {
      this.state.lastError = `TextGen init failed: ${e?.message || e}`;
    }
  }

  async embed(text: string): Promise<number[] | null> {
    if (!this.embedder) return null;
    const out: any = await this.embedder(text);
    const arr = Array.from(out.data || []);
    return arr as number[];
  }

  async generate(prompt: string): Promise<string | null> {
    if (!this.textGen) return null;
    const out: any = await this.textGen(prompt, { max_new_tokens: 80 });
    const text = Array.isArray(out) ? out[0]?.generated_text || "" : String(out);
    return text;
  }
}

/* ============================================================================
   8. GEMINI CLIENT (front-end search / explanation brain)
   ============================================================================ */

// Gemini client intentionally disabled for LOCAL_ONLY flow

/* ============================================================================
   9. EXPORTS (ensure compatibility with other files)
   ============================================================================ */

// (exports moved to bottom to avoid JSX interference)

/* ============================================================================
   10. AGENT CONTEXT
   ============================================================================ */

type AgentLeeContextValue = {
  kb: string;
  searchKb: (q: string, maxLines?: number) => string[];
  suggestSources: (q: string, max?: number) => WebSource[];
  claims: ClaimEvidence[];
  webSources: WebSourceView[];
  serverDoc: string;
  modelHub: LocalModelHub;
};

export const AgentLeeContext = createContext<AgentLeeContextValue | null>(null);

/* ============================================================================
   11. MAIN COMPONENT: AgentLeeBrainMonolith
   ============================================================================ */

type AgentLeeBrainMonolithProps = {
  storyConfig: StoryConfig;
  mockData: MockData;
  children?: ReactNode;
};

export const AgentLeeBrainMonolith: React.FC<AgentLeeBrainMonolithProps> = ({
  storyConfig,
  mockData,
  children,
}) => {
  const [kb, setKb] = useState<string>("");
  const [logs, setLogs] = useState<{ id: number; ts: string; text: string }[]>(
    []
  );
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const modelHubRef = useRef<LocalModelHub | null>(null);
  if (!modelHubRef.current) {
    modelHubRef.current = new LocalModelHub();
  }

  const appendLog = useCallback((text: string) => {
    setLogs((prev) => [
      { id: prev.length + 1, ts: new Date().toISOString(), text },
      ...prev,
    ]);
  }, []);

  // Build KB on mount or when deck data changes
  useEffect(() => {
    const k = GENERATE_KNOWLEDGE_BASE(storyConfig, mockData);
    setKb(k);
    appendLog("Knowledge base generated for current deck + data.");
  }, [storyConfig, mockData, appendLog]);

  // Initialize local models
  useEffect(() => {
    (async () => {
      try {
        appendLog("Initializing LocalModelHub (transformers.js)...");
        await modelHubRef.current!.initialize();
        appendLog("LocalModelHub initialization complete.");
      } catch (e: any) {
        appendLog(`LocalModelHub init error: ${e?.message || e}`);
      }
    })();
  }, [appendLog]);

  const searchKb = useCallback(
    (q: string, maxLines = 20) =>
      SEARCH_KNOWLEDGE_BASE(storyConfig, mockData, q, maxLines),
    [storyConfig, mockData]
  );

  const handleAsk = useCallback(
    async (evt?: React.FormEvent) => {
      if (evt) evt.preventDefault();
      const question = prompt.trim();
      if (!question) return;

      setIsThinking(true);
      appendLog(`User: ${question}`);

      try {
        // 1) Get focused KB context
        const kbLines = searchKb(question, 30).join("\n");
        const contextPrompt = `
You are Agent Lee, a pragmatic, human-sounding AI partner.
Use the STRICT KNOWLEDGE BASE below. If information is missing, say so and reason at a high level.

STRICT KNOWLEDGE BASE (EXCERPT):
${kbLines}

QUESTION:
${question}

ANSWER (speaking as "we" and "you", in natural language, short paragraphs):
        `.trim();

        // 2) Local model-only path (Leeway LOCAL_ONLY standard)
        const generated = await modelHubRef.current!.generate(contextPrompt);
        const answer = generated || "I do not have a complete answer yet, but the context has been prepared.";

        setReply(answer);
        appendLog(`Agent Lee: ${answer.slice(0, 240)}${answer.length > 240 ? "..." : ""}`);
      } catch (e: any) {
        const msg = e?.message || String(e);
        setReply(`I ran into an issue while answering: ${msg}`);
        appendLog(`Error while answering: ${msg}`);
      } finally {
        setIsThinking(false);
      }
    },
    [prompt, appendLog, searchKb]
  );

  const contextValue: AgentLeeContextValue = useMemo(
    () => ({
      kb,
      searchKb,
      suggestSources: suggestWebSources,
      claims: claimEvidence,
      webSources,
      serverDoc: SERVER_DOC,
      modelHub: modelHubRef.current!,
    }),
    [kb, searchKb]
  );

  return (
    <AgentLeeContext.Provider value={contextValue}>
      <div className="w-full min-h-screen bg-slate-950 text-slate-50 px-4 py-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Agent Lee Brain Monolith
              </h1>
              <p className="text-xs text-slate-400">
                Unified config, knowledge base, references, and runtime log in a single component.
              </p>
            </div>
            <div className="text-xs text-slate-400">
              RUNTIME: {(window as any).AGENTLEE_RUNTIME?.LOCAL_ONLY ? "LOCAL-ONLY" : "HYBRID"}
            </div>
          </header>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 space-y-3">
              <h2 className="text-sm font-semibold">Ask Agent Lee</h2>
              <form onSubmit={handleAsk} className="space-y-2">
                <textarea
                  className="w-full rounded-md bg-slate-950 border border-slate-700 text-xs p-2 resize-y min-h-[80px]"
                  placeholder="Ask a question about the deck, Visu-Sewer, or AI sewer infrastructure..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={isThinking}
                    className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-medium"
                  >
                    {isThinking ? "Thinking..." : "Ask Agent Lee"}
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Uses local KB + Gemini (if configured) or local model hub.
                  </span>
                </div>
              </form>
              <div className="mt-2 rounded-md bg-slate-950 border border-slate-800 p-2 min-h-[80px] text-xs whitespace-pre-wrap">
                {reply || "Agent Lee’s answer will appear here."}
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 space-y-3">
              <h2 className="text-sm font-semibold">Knowledge & Sources</h2>

              <div className="text-xs text-slate-300">
                <p className="mb-1 font-semibold">Claims (sample)</p>
                <ul className="list-disc list-inside space-y-1 max-h-32 overflow-auto">
                  {claimEvidence.slice(0, 4).map((c, idx) => (
                    <li key={idx}>
                      <span className="font-medium">Page {c.pageNumber}:</span>{" "}
                      {c.claim}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-xs text-slate-300">
                <p className="mb-1 font-semibold">Web Sources (sample)</p>
                <ul className="list-disc list-inside space-y-1 max-h-32 overflow-auto">
                  {WEB_SOURCES.slice(0, 6).map((s) => (
                    <li key={s.id}>
                      <span className="font-medium">{s.category}:</span> {s.label}
                    </li>
                  ))}
                </ul>
              </div>

              <details className="text-xs text-slate-400">
                <summary className="cursor-pointer text-emerald-400">
                  View server/environment summary
                </summary>
                <pre className="mt-1 whitespace-pre-wrap">
                  {SERVER_DOC.trim()}
                </pre>
              </details>
            </div>
          </section>

          <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <h2 className="text-sm font-semibold mb-2">Agent Runtime Log</h2>
            <div className="h-40 overflow-auto rounded-md bg-slate-950 border border-slate-800 p-2 space-y-1 text-xs font-mono">
              {logs.length === 0 && (
                <div className="text-slate-500">No runtime messages yet.</div>
              )}
              {logs.map((l) => (
                <div key={l.id} className="text-slate-200">
                  <span className="text-slate-500 mr-2">
                    {new Date(l.ts).toLocaleTimeString()}
                  </span>
                  {l.text}
                </div>
              ))}
            </div>
          </section>

          {children && (
            <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
              {children}
            </section>
          )}
        </div>
      </div>
    </AgentLeeContext.Provider>
  );
};

export default AgentLeeBrainMonolith;

// Monolith exports for app-wide usage (Leeway standard)
export const initDocStore = (): void => {
  /* stub */
};

export const docStore = {
  get: (key?: string): unknown => undefined,
  set: (key: string, value: unknown): void => {
    /* stub */
  },
  bootstrapRag: (): void => {
    // Initialize or refresh RAG indexes (stub)
  },
};

export const DomAgentProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const answerWithEvidence = async (
  query: string,
  contextMessage?: string,
  currentSlide?: unknown
): Promise<{
  answer: string;
  evidence: {
    localDataPreview?: string;
    chartContext?: unknown;
    citations?: Array<{ docId: string; textSnippet: string }>;
    chartData?: unknown;
    matchedClaims?: string[];
  };
}> => {
  return {
    answer: "",
    evidence: {
      localDataPreview: "",
      chartContext: null,
      citations: [],
      chartData: null,
      matchedClaims: [],
    },
  };
};

// Lightweight model stubs used by Intro/ModelTest components
export class QwenLLM {
  private allowLocalNarration = true;

  setAllowLocalNarration(allow: boolean) {
    this.allowLocalNarration = !!allow;
  }

  initialize() {
    // hook to warm models or any startup logic
    try {
      // no-op for now; could trigger LocalModelHub.initialize()
    } catch {}
  }

  async generate(prompt: string): Promise<string> {
    // Delegate to local model hub generate for consistency
    const text = await (window as any).modelHub?.generate?.(prompt);
    if (this.allowLocalNarration) {
      return text || "";
    }
    return "";
  }
}

export const embedderLLM = {
  async embed(text: string): Promise<number[]> {
    const out = await (window as any).modelHub?.embed?.(text);
    return Array.isArray(out) ? out : [];
  },
};
