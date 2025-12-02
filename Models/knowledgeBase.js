// knowledgeBase.js
// Front-end friendly knowledge base generator for Agent Lee
// - Uses STORY_CONFIG + MOCK_DATA for deck-specific facts
// - Adds AI sewer maintenance evidence summary
// - Includes a lightweight text search helper for local-only models

import { MOCK_DATA, STORY_CONFIG } from "../constants";

/**
 * Build a strict, deck-aware knowledge base string.
 * This is fed into local models (Gemma, Llama, PHI-3, etc.) as context.
 */
export function GENERATE_KNOWLEDGE_BASE() {
  // 1) Slide navigation map (so models can align "page X" with slide IDs)
  const navigationMap = (STORY_CONFIG.slides || [])
    .map((s, i) =>
      `Slide ${i + 1}: "${s.title}" (ID: ${s.id}) - Topics: ${s.chartKind || "generic"}, ${s.navItem || "N/A"}`
    )
    .join("\n");

  // 2) Slide narrative + bullets
  const slidesContext = (STORY_CONFIG.slides || [])
    .map((s) => {
      const paragraphs = (s.narration && s.narration.paragraphs) || [];
      const bullets = (s.narration && s.narration.bullets) || [];
      return `SLIDE [${s.title}] (ID=${s.id}):\n${paragraphs.join(" ")}\nKey points: ${bullets.join("; ")}`;
    })
    .join("\n\n");

  // 3) Evidence locker from MOCK_DATA
  const evidenceContext = (MOCK_DATA.evidenceItems || [])
    .map(
      (e) =>
        `EVIDENCE [${e.tag}] ${e.title}: ${e.url || "Internal Data"} (${e.date || "n.d."})`
    )
    .join("\n");

  // 4) Financials (high-level)
  const financialContext = (MOCK_DATA.financials || [])
    .map(
      (f) =>
        `FINANCIAL: ${f.category} = ${f.value}M (${f.type || "metric"})`
    )
    .join("\n");

  // 5) Acquisitions / geographic footprint
  const acquisitionContext = (MOCK_DATA.acquisitions || [])
    .map(
      (a) =>
        `ACQUISITION: ${a.name} in ${a.region} (${a.year}). Coordinates: ${a.coordinates?.x}, ${a.coordinates?.y}`
    )
    .join("\n");

  // 6) Case studies from MOCK_DATA (deck-specific)
  const caseStudyContext = (MOCK_DATA.caseStudies || [])
    .map(
      (c) =>
        `CASE STUDY: ${c.study} reduced cost from $${c.costPerFootBefore} to $${c.costPerFootAfter}/ft (${c.savingsPercent}% savings).`
    )
    .join("\n");

  // 7) Operational velocity (crew count trajectory)
  const opVel = MOCK_DATA.operationalVelocity || [];
  let velocityContext = "";
  if (opVel.length > 0) {
    const first = opVel[0];
    const last = opVel[opVel.length - 1];
    velocityContext = `OPERATIONAL VELOCITY (2020–2050): Growing from ${first.crewCount} crews to ${last.crewCount} crews over the planning horizon.`;
  }

  // 8) AI sewer infrastructure evidence summary
  const aiSewerEvidence = `
AI SEWER INFRASTRUCTURE EVIDENCE (SUMMARY)

FINANCIAL IMPACT & ROI
- DC Water / PipeSleuth: Processing cost per linear foot cut from $7–$9 to $2–$3 (~70% reduction). AI analysis ~10x faster than manual review.
- SewerAI: Cloud / ML optimizations achieving ~75% reduction in cloud TCO, up to 3x faster ML pipelines, and significant labor savings.
- Pacific Northwest Utility (SewerAI Pioneer): Margin of error <10%; AI missed 90.13% fewer defect conditions than manual surveys and identified ~33% more defects. ~125,775 hours of utility capacity unlocked and >$1.8M in time savings.
- Hampton, VA (GraniteNet AI): ~40% reduction in consultant spend by proving that ~40% of inspected pipe required no action, enabling smarter, budget-aligned rehab decisions.
- Phoenix, AZ (SewerAI): AI vendor selection based on accuracy and cost/lf; SewerAI emerged with highest accuracy and lowest net cost per foot, supporting a jump in rehab budget from low millions to >$30M due to better data.

PREDICTIVE MAINTENANCE ECONOMICS
- Predictive maintenance can reduce unplanned downtime by ~30–50% and maintenance costs by ~18–25%, with some industries citing ~$125,000 per hour for unplanned downtime.
- Real-time monitoring + ML can cut water loss by 25–30% and extend asset life by 20–40% through early intervention and risk-based rehab plans.

PLATFORM & TECHNOLOGY LANDSCAPE
- SewerAI AutoCode/Pioneer: AI-based defect detection from CCTV, tens of thousands of feet per hour, ~97% defect detection accuracy, 3D modeling, and workflow APIs.
- Wipro PipeSleuth: Deep-learning based defect classification integrated with NASSCO PACP coding standards; deployed at DC Water with Intel, generating automated, compliant inspection reports.
- VAPAR: AI-enabled asset management platform; Knox City Council completed ~900 inspections in ~3 days, flagged 179 critical assets, and shifted to proactive maintenance.
- PipeAid (Burgess & Niple): Digital twins + AI defect detection, integrated with GIS for system-wide decision-making.
- CUES GraniteNet: AI-assisted defect coding and cloud upload, generating prioritized, time-based rehab and budget plans.

NASSCO & STANDARDS
- PACP is the North American standard for CCTV sewer inspection; tens of thousands certified.
- NASSCO is actively working on AI quality/rating frameworks for automated assessment tools, but currently no AI solution is certified for all PACP/LACP/MACP observations.
- AI is already used to validate header data, operator certifications, and video quality and to flag critical defects for certified human review.

WORKFORCE TRANSFORMATION
- A large portion of utility workforce is nearing retirement; technical skills are going stale faster (~<5 years).
- AI supports upskilling by removing repetitive coding work and enabling staff to focus on high-value tasks like planning and communication.
- Surveys show strong demand for AI skills from both workers and employers; upskilling/reskilling programs are key to retention.

KEY THEMES FOR VISU-SEWER
- AI + trenchless expertise = lower cost per foot, higher accuracy, better use of capital, and stronger safety/compliance posture.
- AI-backed inspection and predictive analytics support the “Roots to Resilience” story: covenant, craft, operational excellence, and technology-driven growth.
`;

  return `
*** STRICT KNOWLEDGE BASE ***
You must answer based on the following verified facts about Visu-Sewer, the deck, and the AI sewer infrastructure evidence. Do NOT hallucinate company-specific numbers that are not present here. When data is not present, say so and reason conceptually.

=== NAVIGATION MAP (Slide Index) ===
${navigationMap}

=== EVIDENCE LOCKER (Deck Evidence Items) ===
${evidenceContext}

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
`;
}

/**
 * Simple local text search helper over the knowledge base string.
 * Useful for very small local models that benefit from pre-filtered context.
 */
export function simpleKnowledgeSearch(query, maxLines = 40) {
  const kb = GENERATE_KNOWLEDGE_BASE();
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
 * @param {string} query
 * @param {number} maxLines
 * @returns {string[]} Array of matching lines
 */
export function SEARCH_KNOWLEDGE_BASE(query, maxLines = 20) {
  const kb = GENERATE_KNOWLEDGE_BASE();
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

export default {
  GENERATE_KNOWLEDGE_BASE,
  simpleKnowledgeSearch,
  SEARCH_KNOWLEDGE_BASE,
};
