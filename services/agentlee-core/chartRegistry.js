/* ============================================================================
LEEWAY HEADER — DO NOT REMOVE
PROFILE: LEEWAY-ORDER
TAG: AI.RETRIEVAL.INDEX.CHARTS.MAPPING
REGION: 🧠 AI

STACK: LANG=js; FW=none; UI=none; BUILD=node
RUNTIME: browser
TARGET: agent-module

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
  "name": "Chart Registry and Context Helpers",
  "programmingLanguage": "JavaScript",
  "runtimePlatform": "browser",
  "about": ["LEEWAY", "AI", "Charts", "Registry", "Mapping"],
  "identifier": "AI.RETRIEVAL.INDEX.CHARTS.MAPPING",
  "license": "MIT",
  "dateModified": "2025-12-09"
}

5WH: WHAT=Slide → chart registry, tab IDs, and chart context helpers; WHY=Help local models understand page context and charts; WHO=Leeway Industries; WHERE=/services/agentlee-core/chartRegistry.js; WHEN=2025-12-09; HOW=JavaScript mapping + chart overrides + context helpers
SPDX-License-Identifier: MIT
============================================================================ */
// chartRegistry.js
// Slide → chart mapping to help local models understand "page X" and charts.

import { STORY_CONFIG } from "../../constants";

// Optional: manual overrides to enrich charts for key slides
const CHART_OVERRIDES = {
  throughTheTunnels: {
    chartKind: "timeline",
    axes: { x: "Year", y: "Milestone" },
    dataSources: ["Internal history", "Fort Point Capital overview", "MOR acquisition releases"],
    metrics: ["Founding year", "Expansion events", "Acquisition milestones"],
    businessAngles: ["Platform growth", "Regional scale", "Reliability legacy"],
  },
  stewardsOfSewers: {
    chartKind: "footprint",
    axes: { x: "Region/State", y: "Operational presence" },
    dataSources: ["M&A notes", "Regional ops summaries"],
    metrics: ["New states added", "Integration cadence"],
  },
  engineeringTomorrow: {
    chartKind: "financial-bridge",
    axes: { x: "Growth lever", y: "Revenue contribution (USD M)" },
    dataSources: ["Deck internal projections"],
  },
};

// Universal internal tab IDs per slide to enable precise section targeting.
// If STORY_CONFIG provides `tabs` for a slide, use those; otherwise provide sensible defaults.
export const TAB_IDS = (STORY_CONFIG.slides || []).reduce((acc, s, index) => {
  const slideNumber = index + 1;
  const slideId = s.id || `slide_${slideNumber}`;
  const providedTabs = Array.isArray(s.tabs)
    ? s.tabs.filter((t) => typeof t === "string" && t.trim().length > 0)
    : [];
  const defaults = [
    "overview",
    "chart",
    "image",
    "evidence",
  ];
  acc[slideId] = providedTabs.length ? providedTabs : defaults;
  return acc;
}, {});

export function getTabIdsForSlide(slideIdOrNumber) {
  if (typeof slideIdOrNumber === "number") {
    const s = (STORY_CONFIG.slides || [])[slideIdOrNumber - 1];
    const sid = s?.id || `slide_${slideIdOrNumber}`;
    return TAB_IDS[sid] || [];
  }
  if (typeof slideIdOrNumber === "string") {
    const trimmed = slideIdOrNumber.trim().toLowerCase();
    const entry = (STORY_CONFIG.slides || []).find(
      (e, i) =>
        (e.id && String(e.id).toLowerCase() === trimmed) ||
        (String(i + 1) === trimmed) ||
        (e.title && e.title.toLowerCase() === trimmed)
    );
    const sid = entry?.id || null;
    if (!sid) return [];
    return TAB_IDS[sid] || [];
  }
  return [];
}

export const CHART_REGISTRY = (STORY_CONFIG.slides || []).map((s, index) => {
  const slideNumber = index + 1;

  const base = {
    slideId: s.id || `slide_${slideNumber}`,
    slideNumber,
    title: s.title || `Slide ${slideNumber}`,
    chartId: s.chartId || s.id || `chart_${slideNumber}`,
    chartKind: s.chartKind || "generic",
    navItem: s.navItem || null,
    dataSources: Array.isArray(s.dataSources) ? s.dataSources : [],
    axes: s.axes || { x: "Time", y: "Value / Metric" },
    metrics: Array.isArray(s.metrics) ? s.metrics : [],
    businessAngles: Array.isArray(s.businessAngles) ? s.businessAngles : [],
  };

  const override = CHART_OVERRIDES[base.slideId] || null;
  return override ? { ...base, ...override } : base;
});

/**
 * Given a slide number (12) or slide id ("resilience-framework"),
 * returns a formatted chart context block for RAG/system prompts.
 */
export function getChartContextForSlide(slideIdOrNumber) {
  let entry = null;

  if (typeof slideIdOrNumber === "number") {
    entry = CHART_REGISTRY.find(
      (e) => e.slideNumber === slideIdOrNumber
    );
  } else if (typeof slideIdOrNumber === "string") {
    const trimmed = slideIdOrNumber.trim().toLowerCase();

    // Try "12" → slideNumber
    const maybeNum = parseInt(trimmed, 10);
    if (!Number.isNaN(maybeNum)) {
      entry = CHART_REGISTRY.find((e) => e.slideNumber === maybeNum);
    }

    // Try exact id or title matches
    if (!entry) {
      entry = CHART_REGISTRY.find(
        (e) =>
          (e.slideId && String(e.slideId).toLowerCase() === trimmed) ||
          (e.title && e.title.toLowerCase() === trimmed)
      );
    }

    // Try "page 12" / "slide 12" parsing
    if (!entry) {
      const numMatch = trimmed.match(/(\d{1,3})/);
      if (numMatch) {
        const n = parseInt(numMatch[1], 10);
        entry = CHART_REGISTRY.find((e) => e.slideNumber === n);
      }
    }
  }

  if (!entry) {
    return null;
  }

  const {
    slideNumber,
    title,
    chartId,
    chartKind,
    dataSources,
    axes,
    metrics,
    businessAngles,
  } = entry;

  const dsText =
    dataSources && dataSources.length
      ? dataSources.join(", ")
      : "Deck mock CSVs and internal Visu-Sewer metrics.";
  const metricsText =
    metrics && metrics.length
      ? metrics.join(", ")
      : "Metrics not explicitly enumerated; infer from axis labels and slide narration.";
  const anglesText =
    businessAngles && businessAngles.length
      ? businessAngles.join(", ")
      : "Connect to safety, reliability, financial resilience, and growth thesis.";

  const tabsText = (TAB_IDS[entry.slideId] || []).join(", ");
  return `
SLIDE_CHART_CONTEXT
Slide: ${slideNumber} — "${title}"
Primary chart id: ${chartId}
Chart kind: ${chartKind}
Available tab IDs: ${tabsText}
Axes:
- X: ${axes.x}
- Y: ${axes.y}
Data sources: ${dsText}
Metrics tracked: ${metricsText}
Business interpretation angles: ${anglesText}

When the user says things like:
- "Go to page ${slideNumber} and explain the charts"
- "Explain this chart"
- "What does each data point mean here?"
you MUST:

1) Explicitly name the slide and chart (slide number + title).
2) Describe the overall shape/trend of the chart (up, down, stable, cyclical, etc.).
3) Explain what the axes represent in clear business language.
4) Point out at least 2–3 key data points or inflection points and what they mean.
5) Tie the chart back to Visu-Sewer's strengths, weaknesses, risks, and bottom line:
   - Safety & reliability
   - Cost per linear foot and ROI
   - Operational capacity and resilience
   - Growth potential and covenant with cities/customers.

Always keep explanations grounded in the verified knowledge base and the deck’s story.
If a precise number is not in the knowledge base, describe the direction and relative impact, not a fabricated exact value.
`;
}

export default {
  CHART_REGISTRY,
  TAB_IDS,
  getChartContextForSlide,
  getTabIdsForSlide,
};

// Optional: improve Vite HMR behavior for this non-React module
// by accepting updates without forcing a full page reload.
if (import.meta && import.meta.hot) {
  import.meta.hot.accept((newMod) => {
    try {
      // Re-expose updated registry and helpers to window for Agent Lee
      const api = {
        CHART_REGISTRY: newMod?.CHART_REGISTRY || CHART_REGISTRY,
        TAB_IDS: newMod?.TAB_IDS || TAB_IDS,
        getChartContextForSlide: newMod?.getChartContextForSlide || getChartContextForSlide,
        getTabIdsForSlide: newMod?.getTabIdsForSlide || getTabIdsForSlide,
      };
      (window || globalThis).AgentLeeChartRegistry = api;
    } catch {}
  });
}
