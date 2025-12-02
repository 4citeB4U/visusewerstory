// chartRegistry.js
// Slide → chart mapping to help local models understand "page X" and charts.

import { STORY_CONFIG } from "../../constants";

export const CHART_REGISTRY = (STORY_CONFIG.slides || []).map((s, index) => {
  const slideNumber = index + 1;

  return {
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

  return `
SLIDE_CHART_CONTEXT
Slide: ${slideNumber} — "${title}"
Primary chart id: ${chartId}
Chart kind: ${chartKind}
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
  getChartContextForSlide,
};
