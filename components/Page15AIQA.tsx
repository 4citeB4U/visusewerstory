/* ============================================================================
   LEEWAY HEADER — DO NOT REMOVE
   PROFILE: LEEWAY-ORDER
   TAG: AI.QAPAGE.PAGE15.PERFORMANCE_MATRIX
   REGION: 🧠 AI

   STACK: LANG=tsx; FW=react; UI=tailwind; BUILD=vite
  RUNTIME: browser

  TARGET: in-app evidence-backed Q&A (static, click-to-expand)

   DISCOVERY_ARCH (v12):
     PIPELINE=Voice>Intent>Location>Vertical>Ranking>Render;
     ROLE=primary;
     INTENT=explain,defend,source,respond;
     LOCATION_DEP=none;
     VERTICALS=infra-ai,utilities,asset-management,roi,procurement;
     RANKING=deterministic(static);
     RENDER=accordion+links;
     SCHEMAS=QAPage,SoftwareApplication,Dataset;
     SPEC_REF=LEEWAY.v12.DiscoveryArchitecture

   GOVERNANCE:
     - "Static evidence first": answers are pre-authored and always available.
     - "No hallucinated sources": every link shown is explicit in the evidence list.
     - "Evidence grading": external/public vs deck/internal.
     - "Agent Lee optional": may narrate / expand, but page remains self-sufficient.

   SPDX-License-Identifier: MIT
   ============================================================================ */



/**
 * Page 15 AI Q&A — Static Evidence Model
 * ------------------------------------
 * You asked for:
 * - NO freeform “ask the AI” that can miss facts.
 * - Click a question -> see the full answer + explicit, clickable evidence links.
 * - 20+ questions (not a short list).
 * - Leeway Standards header included (above).
 *
 * Integration note:
 * - If your global Agent Lee UI exists, this component can dispatch narration events.
 * - If not, it can optionally fall back to browser speechSynthesis (guarded).
 */

import { useMemo, useRef, useState } from "react";

// -------------------------------------
// Types
// -------------------------------------
type EvidenceType = "external" | "deck" | "internal";
type Confidence = "high" | "medium" | "low";

type EvidenceItem = {
  label: string;
  url: string;
  type: EvidenceType;
  note?: string;
};

type QAItem = {
  id: string;
  tab: TabKey;
  question: string;
  shortAnswer: string;
  fullAnswer: string; // already formatted (plain text, with newlines)
  keyNumbers: Array<{ label: string; value: string }>;
  confidence: Confidence;
  relatedCharts: string[];
  evidence: EvidenceItem[];
};

type TabKey =
  | "evidence"
  | "performance"
  | "cost"
  | "workforce"
  | "roi"
  | "technology"
  | "all";

type TabDef = { key: TabKey; label: string; icon: string };

// -------------------------------------
// Evidence links (central registry)
// -------------------------------------
const E = {
  // Vendor / industry sources for sewer inspection AI
  seweraiAutocode: {
    label: "SewerAI AutoCode™ product page (tens of thousands LF/hour)",
    url: "https://www.sewerai.com/products/autocode",
    type: "external" as const,
  },
  seweraiFeetPerHour: {
    label: "Underground Infrastructure: SewerAI processing 25k–50k ft/hour (article quote)",
    url: "https://undergroundinfrastructure.com/magazine/2022/october-2022-vol-77-no-10/features/artificial-intelligence-speeds-houston-s-sewer-inspections-under-sharp-eye-of-epa",
    type: "external" as const,
  },
  nasscoPACP: {
    label: "NASSCO: Pipeline Assessment Certification Program (PACP®) overview",
    url: "https://www.nassco.org/resource/nasscos-pipeline-assessment-certification-program/",
    type: "external" as const,
  },
  nasscoAIPaper: {
    label: "NASSCO PACP™ AI Position Paper (PDF)",
    url: "https://www.nassco.org/wp-content/uploads/2023/04/NASSCO_PACP_AI_PositionPaper-002-1.pdf",
    type: "external" as const,
  },
  vaparCase: {
    label: "VAPAR: AI in sewer asset management (case study: ~900 inspections in ~2.8 days)",
    url: "https://www.vapar.co/integration-of-ai-in-sewer-asset-management/",
    type: "external" as const,
  },
  cuesGraniteNet: {
    label: "Municipal Sewer & Water: CUES GraniteNet defect coding as a service (process overview)",
    url: "https://www.mswmag.com/online_exclusives/2024/07/let-machines-help-you-process-and-determine-critical-infrastructure_sc_000s4",
    type: "external" as const,
  },

  // Macro AI impact sources
  pwcAI157T: {
    label: "PwC: AI contribution up to $15.7T to the global economy by 2030 (report)",
    url: "https://www.pwc.com/gx/en/issues/analytics/assets/pwc-ai-analysis-sizing-the-prize-report.pdf",
    type: "external" as const,
  },

  // Company sources (Visu-Sewer)
  visuSewerSite: {
    label: "Visu-Sewer official website",
    url: "https://visu-sewer.com",
    type: "external" as const,
  },
  zippiaVisuSewer: {
    label: "Zippia: Visu-Sewer company profile (revenue estimate, headcount)",
    url: "https://www.zippia.com/visu-sewer-careers-1570669/",
    type: "external" as const,
  },
  hvmsdProject: {
    label: "HOVMSD Interceptor Rehabilitation project page",
    url: "https://hvmsd.org/interceptor-rehabilitation-project",
    type: "external" as const,
  },
  hvmsdAwardPdf: {
    label: "HOVMSD Contract Award document (PDF)",
    url: "https://hvmsd.org/wp-content/uploads/2023/08/HOV_Contract_Award.pdf",
    type: "external" as const,
  },
  fortPointPortfolio: {
    label: "Fort Point Capital portfolio page (Visu-Sewer)",
    url: "https://fortpointcapital.com/portfolio/visusewer",
    type: "external" as const,
  },

  // Deck-only / internal placeholders (still shown transparently)
  deckMetrics: {
    label: "Deck metrics: Page 15 charts (Performance/Cost/Workforce/ROI/Tech)",
    url: "#",
    type: "deck" as const,
    note: "These values are from your slide chart inputs. If you want external corroboration for specific %s, add the source link here.",
  },
};

// -------------------------------------
// Tabs
// -------------------------------------
const TABS: TabDef[] = [
  { key: "evidence", label: "Evidence Overview", icon: "📌" },
  { key: "performance", label: "Performance Metrics", icon: "⚡" },
  { key: "cost", label: "Cost Analysis", icon: "💸" },
  { key: "workforce", label: "Workforce Impact", icon: "👷" },
  { key: "roi", label: "ROI & Savings", icon: "📈" },
  { key: "technology", label: "Technology Comparison", icon: "🧪" },
  { key: "all", label: "All Q&A", icon: "🗂️" },
];

// -------------------------------------
// Q&A Pack (25 questions, all with full answers + evidence)
// -------------------------------------
function buildQAPack(): QAItem[] {
  const qa: QAItem[] = [];

  // Evidence Overview
  qa.push({
    id: "ev-01",
    tab: "evidence",
    question: "What is this page, and how should I use it while presenting Page 15?",
    shortAnswer:
      "This is a click-to-expand Evidence Q&A page: pick a tab, click a question, and read a pre-written answer with clickable sources.",
    fullAnswer:
      [
        "This Page 15 panel is designed to support live presenting.",
        "",
        "How to use it:",
        "1) Choose the tab that matches the chart the audience is viewing (Performance, Cost, Workforce, ROI, Technology).",
        "2) Click a question. The answer appears immediately—no AI guessing, no missing facts.",
        "3) Every answer includes key numbers pulled directly from the chart plus evidence links (public sources where available).",
        "",
        "If you want narration, use the “Narrate” button. It can hand off to your Agent Lee UI (if wired), or optionally use browser speech as a fallback.",
      ].join("\n"),
    keyNumbers: [
      { label: "Q&A Style", value: "Static (deterministic)" },
      { label: "Evidence", value: "Clickable links + grading" },
    ],
    confidence: "high",
    relatedCharts: ["All Page 15 tabs"],
    evidence: [E.deckMetrics, E.nasscoPACP, E.seweraiAutocode],
  });

  qa.push({
    id: "ev-02",
    tab: "evidence",
    question: "Which numbers are chart-derived vs externally sourced?",
    shortAnswer:
      "Most chart percentages (speed, accuracy, cost reduction, ROI) are deck-derived; standards and vendor capabilities (PACP, AutoCode throughput, VAPAR 2.8-day review) have public sources linked.",
    fullAnswer:
      [
        "This page uses two evidence classes:",
        "",
        "A) Deck-derived metrics (from your charts):",
        "- Speed multipliers (1x / 3x / 10x / 6x)",
        "- AI AutoCode accuracy (97%) and +33% additional defects",
        "- Cost reduction (70%, 40%, 75%, 30%)",
        "- ROI payback months and savings by case study",
        "- Platform comparison scores (Accuracy/Speed/Cost Efficiency/Compliance)",
        "",
        "B) Public sources (linked) used to defend standards and claims where possible:",
        "- NASSCO PACP standard and NASSCO’s AI position paper (inspection/coding standards).",
        "- SewerAI AutoCode capability statements (including throughput language and PACP/LACP framing).",
        "- VAPAR case study describing ~900 inspections reviewed in ~2.8 days.",
        "- PwC macroeconomic AI impact framing ($15.7T by 2030).",
        "",
        "If you want every numeric claim to have a public corroboration, you can add specific citations per metric into the Evidence Registry (E.*) above.",
      ].join("\n"),
    keyNumbers: [
      { label: "Evidence Classes", value: "Deck vs External" },
      { label: "External Core", value: "NASSCO, SewerAI, VAPAR, PwC" },
    ],
    confidence: "high",
    relatedCharts: ["All Page 15 tabs"],
    evidence: [E.deckMetrics, E.nasscoPACP, E.nasscoAIPaper, E.seweraiAutocode, E.vaparCase, E.pwcAI157T],
  });

  // Performance Metrics
  qa.push({
    id: "pm-01",
    tab: "performance",
    question: "What does the “Processing Speed Comparison” chart actually prove?",
    shortAnswer:
      "It shows the productivity step-change from manual review (1x) to AI coding and detection workflows (3x to 10x), meaning the same team can clear more footage per day.",
    fullAnswer:
      [
        "The Processing Speed Comparison chart is a throughput argument.",
        "",
        "It communicates a simple operational truth: when inspection video coding becomes automated, your bottleneck shifts from analysts to data capture and QA/QC.",
        "",
        "Chart readout (speed multiplier):",
        "- Manual analysis: 1x",
        "- AI with AutoCode: 3x",
        "- Pipe Sleuth: 10x",
        "- SewerAI detection: 6x",
        "",
        "In practice: higher throughput means faster condition ratings, faster work order generation, and better use of crews—especially when you can process tens of thousands of linear feet per hour in parallel systems.",
      ].join("\n"),
    keyNumbers: [
      { label: "Manual", value: "1x" },
      { label: "AI AutoCode", value: "3x" },
      { label: "Pipe Sleuth", value: "10x" },
      { label: "SewerAI Detection", value: "6x" },
    ],
    confidence: "medium",
    relatedCharts: ["Processing Speed Comparison"],
    evidence: [E.deckMetrics, E.seweraiAutocode, E.seweraiFeetPerHour],
  });

  qa.push({
    id: "pm-02",
    tab: "performance",
    question: "How do we defend the 97% accuracy and “+33% additional defects found” claims?",
    shortAnswer:
      "We present them as chart-derived performance outcomes, then support the plausibility with NASSCO’s AI guidance and vendor documentation for PACP-aligned AI coding workflows.",
    fullAnswer:
      [
        "On your chart, AI AutoCode is shown at 97% accuracy and +33% additional defects found vs baseline.",
        "",
        "How to defend it responsibly:",
        "1) State what it is: “This is the measured outcome in the deck’s model/case-work.”",
        "2) Anchor standards: PACP provides a consistent defect-coding framework; AI tools operate within that standards environment (with QA/QC).",
        "3) Anchor vendor capability: SewerAI and similar platforms describe automated defect detection and PACP/LACP assessment workflows, often with human review.",
        "",
        "If the audience asks for a specific public benchmark for 97%, the correct answer is: “Accuracy varies by dataset and defect class—our number is from our internal evaluation. Here are the standards and the tooling references.”",
      ].join("\n"),
    keyNumbers: [
      { label: "AI AutoCode Accuracy", value: "97%" },
      { label: "Additional Defects Found", value: "+33%" },
    ],
    confidence: "medium",
    relatedCharts: ["Accuracy & Defect Detection Rates"],
    evidence: [E.deckMetrics, E.nasscoPACP, E.nasscoAIPaper, E.seweraiAutocode],
  });

  qa.push({
    id: "pm-03",
    tab: "performance",
    question: "What is the operational meaning of “Asset lifespan extension: 25 → 35 years”?",
    shortAnswer:
      "It’s a predictive-maintenance argument: earlier detection and targeted rehab shifts failures left, extending useful life and deferring replacement cycles.",
    fullAnswer:
      [
        "The chart compares a baseline asset life (25 years) to a predictive-AI scenario (35 years), framed as a 40% increase.",
        "",
        "Operationally, this implies:",
        "- Earlier identification of structural issues (cracks, corrosion, infiltration indicators).",
        "- Better prioritization: rehab the right assets earlier, instead of reactive failure repair.",
        "- Reduced catastrophic failures that shorten service life.",
        "",
        "In a capital planning conversation, that translates to deferring replacement and smoothing the capex curve.",
      ].join("\n"),
    keyNumbers: [
      { label: "Without AI", value: "25 years" },
      { label: "With Predictive AI", value: "35 years" },
      { label: "Increase", value: "~40%" },
    ],
    confidence: "medium",
    relatedCharts: ["Asset Lifespan Extension"],
    evidence: [E.deckMetrics, E.nasscoAIPaper],
  });

  qa.push({
    id: "pm-04",
    tab: "performance",
    question: "Why do we repeat “Infrastructure Failure Reduction: 73%” across multiple tabs?",
    shortAnswer:
      "Because it is the headline risk-outcome metric: if monitoring improves failure prevention, it cascades into cost reduction, downtime reduction, and ROI acceleration.",
    fullAnswer:
      [
        "The 73% failure reduction is used as a cross-cutting KPI because it ties the entire story together:",
        "",
        "- Performance: fewer defects missed -> fewer critical failures.",
        "- Cost: fewer emergency repairs and less unplanned work.",
        "- Workforce: safer conditions and fewer dangerous reactive events.",
        "- ROI: fewer failures -> faster payback.",
        "",
        "When challenged, treat the 73% as a chart KPI and point to the standards + tooling evidence; then offer to attach the specific internal case study source as a deck appendix.",
      ].join("\n"),
    keyNumbers: [{ label: "Failure Reduction", value: "73%" }],
    confidence: "medium",
    relatedCharts: ["KPI Callouts (Failure Reduction)"],
    evidence: [E.deckMetrics, E.nasscoAIPaper],
  });

  // Cost Analysis
  qa.push({
    id: "ca-01",
    tab: "cost",
    question: "What does the “Cost Reduction Comparison” chart show in one sentence?",
    shortAnswer:
      "AI-enabled inspection and asset management consistently outperform traditional maintenance cost baselines, with 40–75% reductions in the examples shown.",
    fullAnswer:
      [
        "The Cost Reduction Comparison chart is a direct cost-index argument.",
        "",
        "Chart readout (cost reduction):",
        "- DC Water Pipe Sleuth: 70%",
        "- Hampton VA GraniteNet: 40%",
        "- SewerAI Cloud Ops: 75%",
        "- Industry Avg Maintenance: 30%",
        "",
        "The key point is not that every utility will land at the same percent; it’s that AI shifts cost from reactive/consultant-heavy work to automated detection + targeted interventions.",
      ].join("\n"),
    keyNumbers: [
      { label: "DC Water (Pipe Sleuth)", value: "70% reduction" },
      { label: "Hampton VA (GraniteNet)", value: "40% reduction" },
      { label: "SewerAI Cloud Ops", value: "75% reduction" },
      { label: "Industry Avg", value: "30% reduction" },
    ],
    confidence: "medium",
    relatedCharts: ["Cost Reduction Comparison"],
    evidence: [E.deckMetrics, E.cuesGraniteNet, E.seweraiAutocode],
  });

  qa.push({
    id: "ca-02",
    tab: "cost",
    question: "How do I explain the 5-year projection showing $220K+ savings by Year 5?",
    shortAnswer:
      "It illustrates compounding: early detection reduces emergency costs, and those avoided costs accumulate annually—so savings are modest early and larger later.",
    fullAnswer:
      [
        "The 5-year projection compares traditional costs to AI-enhanced costs and shows cumulative savings reaching $220K+ by Year 5.",
        "",
        "How to narrate it:",
        "- Year 1–2: you pay for onboarding and you start capturing quick wins.",
        "- Year 3–5: the savings compound as backlogs shrink, failures drop, and planning improves.",
        "",
        "If asked: “Is $220K realistic?”",
        "Answer: “It depends on footage volume, asset condition, and labor costs—this is a modeled projection. The mechanism (avoid reactive work) is the important part, and we can tune the model to your utility’s baseline.”",
      ].join("\n"),
    keyNumbers: [{ label: "Projected Savings", value: "$220K+ by Year 5" }],
    confidence: "medium",
    relatedCharts: ["Cumulative Financial Impact (5-Year Projection)"],
    evidence: [E.deckMetrics],
  });

  qa.push({
    id: "ca-03",
    tab: "cost",
    question: "If a CFO challenges the cost reduction percentages, what do I say?",
    shortAnswer:
      "Acknowledge variability, then pivot to the driver metrics: throughput, defect detection, and fewer unplanned events—those drivers are observable and auditable.",
    fullAnswer:
      [
        "A CFO challenge is normal: “Your 70% / 75% sounds high.”",
        "",
        "Use a three-step response:",
        "1) Validate: “Absolutely—results vary by network condition and process maturity.”",
        "2) Ground in drivers: “The drivers are measurable: processing throughput, defects found, and unplanned downtime reduction.”",
        "3) Offer an audit path: “We can run a limited pilot and measure savings against your baseline.”",
        "",
        "This keeps the story defensible even if a specific percentage is debated.",
      ].join("\n"),
    keyNumbers: [
      { label: "Key Drivers", value: "Throughput + Defects + Downtime" },
      { label: "Best Practice", value: "Pilot + baseline comparison" },
    ],
    confidence: "high",
    relatedCharts: ["Cost Reduction Comparison", "Cumulative Savings"],
    evidence: [E.deckMetrics, E.nasscoAIPaper, E.seweraiAutocode],
  });

  qa.push({
    id: "ca-04",
    tab: "cost",
    question: "What do I say about “Global Maintenance Savings: $300B projected by 2030” if asked for proof?",
    shortAnswer:
      "Treat it as a deck headline estimate unless you have a specific external report attached; offer to add the exact citation in the appendix.",
    fullAnswer:
      [
        "Your charts include: “Global Maintenance Savings: $300B projected by 2030.”",
        "",
        "If asked for proof, the correct approach is transparency:",
        "- “That figure is a deck-level benchmark we use to represent the scale of maintenance opportunity.”",
        "- “We can attach the specific industry study we’re relying on, or we can remove the number and keep the mechanism-based argument.”",
        "",
        "In an investor setting, credibility improves when you either (a) provide the exact source, or (b) clearly label it as a modeled/benchmark figure.",
      ].join("\n"),
    keyNumbers: [{ label: "Global Maintenance Savings", value: "$300B (deck metric)" }],
    confidence: "low",
    relatedCharts: ["KPI Callouts (Global Savings)"],
    evidence: [E.deckMetrics],
  });

  // Workforce Impact
  qa.push({
    id: "wf-01",
    tab: "workforce",
    question: "What is the main workforce message on this tab?",
    shortAnswer:
      "AI shifts the workforce from repetitive coding and reactive response into higher-value tasks: QA/QC, planning, prioritization, and safer field execution.",
    fullAnswer:
      [
        "The workforce tab is about transformation, not replacement.",
        "",
        "Your chart emphasizes:",
        "- AI skills demand: 83% say AI skills impact employability.",
        "- Productivity gain: 125K hours of utility capacity unlocked (PNW case).",
        "- Safety improvement: 75% improvement.",
        "- Downtime reduction: 30–50% less unplanned downtime with predictive maintenance.",
        "",
        "Narrative: the same team becomes more effective, safer, and more promotable because the work shifts from manual inspection coding to decision-grade outputs.",
      ].join("\n"),
    keyNumbers: [
      { label: "AI Skills Demand", value: "83%" },
      { label: "Capacity Unlocked", value: "125K hours (PNW case)" },
      { label: "Safety Improvement", value: "75%" },
      { label: "Unplanned Downtime Reduction", value: "30–50%" },
    ],
    confidence: "medium",
    relatedCharts: ["Workforce Transformation Metrics", "Downtime Reduction"],
    evidence: [E.deckMetrics],
  });

  qa.push({
    id: "wf-02",
    tab: "workforce",
    question: "How do we justify the idea that AI improves safety by 75%?",
    shortAnswer:
      "The safety claim is chart-derived and logically supported: fewer emergency callouts and fewer hazardous reactive events generally improve safety outcomes.",
    fullAnswer:
      [
        "Your chart states: “Safety Improvement: 75% improvement in workplace safety.”",
        "",
        "How to defend it without overreaching:",
        "- Treat 75% as a KPI from your internal dataset/model.",
        "- Explain the mechanism: predictive maintenance reduces emergency events, and emergency events are disproportionately risky.",
        "- Offer a measurement plan: incident rates, near-miss reports, and emergency-callout frequency pre/post deployment.",
        "",
        "If you want an external citation, add it as an Evidence Registry entry once you pick the exact safety study or case report you’re using.",
      ].join("\n"),
    keyNumbers: [{ label: "Safety Improvement", value: "75% (deck KPI)" }],
    confidence: "low",
    relatedCharts: ["Workforce Transformation Metrics"],
    evidence: [E.deckMetrics],
  });

  qa.push({
    id: "wf-03",
    tab: "workforce",
    question: "What does “125K hours of utility capacity unlocked” mean in plain English?",
    shortAnswer:
      "It means the organization gets the equivalent of extra labor capacity because repetitive work is automated and downtime is reduced.",
    fullAnswer:
      [
        "When you unlock 125K hours, you’re effectively reclaiming time that was previously lost to:",
        "- manual video coding",
        "- rework due to inconsistent observations",
        "- unplanned downtime and emergency response",
        "- slow handoffs between field and office",
        "",
        "This reclaimed capacity can be reinvested into preventive cleaning programs, targeted rehab planning, or accelerating inspection cadence.",
      ].join("\n"),
    keyNumbers: [{ label: "Unlocked Capacity", value: "125K hours (PNW case)" }],
    confidence: "medium",
    relatedCharts: ["Workforce Transformation Metrics"],
    evidence: [E.deckMetrics],
  });

  qa.push({
    id: "wf-04",
    tab: "workforce",
    question: "How do we answer concerns about job loss or displacement?",
    shortAnswer:
      "We frame AI as augmentation: it reduces low-value repetitive coding, while demand increases for certified QA/QC, planners, and field execution.",
    fullAnswer:
      [
        "A safe, credible framing:",
        "- “This is not about layoffs. It’s about throughput, consistency, and safety.”",
        "- “Manual coding is a bottleneck. AI reduces that bottleneck.”",
        "- “You still need certified inspectors, QA/QC reviewers, planners, and crews to act on the findings.”",
        "",
        "To make it real, name the new work created:",
        "- data QA/QC and review queues",
        "- prioritized rehab plans (risk-based)",
        "- proactive maintenance scheduling",
        "- training and certification (PACP/MACP/LACP)",
      ].join("\n"),
    keyNumbers: [
      { label: "Work Rebalance", value: "Coding ↓, QA/Planning ↑" },
      { label: "Standards", value: "PACP/MACP/LACP pathways" },
    ],
    confidence: "high",
    relatedCharts: ["Workforce Transformation Metrics"],
    evidence: [E.nasscoPACP, E.nasscoAIPaper],
  });

  // ROI & Savings
  qa.push({
    id: "roi-01",
    tab: "roi",
    question: "What does the ROI timeline chart say about payback periods?",
    shortAnswer:
      "Payback is shown inside 6–15 months across the case studies listed, with total savings ranging from $45K to $1.872M.",
    fullAnswer:
      [
        "The ROI timeline summarizes how quickly AI investments return value.",
        "",
        "Chart readout (months to ROI + total savings):",
        "- Wastewater Plant: 6 months; $45K total savings",
        "- DC Water: 12 months; $250K total savings",
        "- Hampton VA: 9 months; $150K total savings",
        "- PNW Utility: 15 months; $1.872M total savings",
        "",
        "The presentation point is consistency: payback is measured in months, not years, when the baseline includes unplanned events and manual processing bottlenecks.",
      ].join("\n"),
    keyNumbers: [
      { label: "Fastest Payback", value: "6 months" },
      { label: "Largest Savings", value: "$1.872M" },
      { label: "Range", value: "6–15 months" },
    ],
    confidence: "medium",
    relatedCharts: ["ROI Timeline Across Case Studies", "Total Savings by Case Study"],
    evidence: [E.deckMetrics, E.pwcAI157T],
  });

  qa.push({
    id: "roi-02",
    tab: "roi",
    question: "Where do the ROI savings actually come from (mechanistically)?",
    shortAnswer:
      "Savings come from fewer failures, fewer emergency repairs, faster processing, and better targeting of rehab—meaning money shifts from reactive spend to planned spend.",
    fullAnswer:
      [
        "The core ROI mechanisms are:",
        "1) Reduced unplanned downtime (less emergency labor, fewer service disruptions).",
        "2) Faster processing of inspections (less analyst time per foot of pipe).",
        "3) Better defect detection (fix the right assets earlier, avoid catastrophic failure).",
        "4) Improved prioritization (risk-based rehab plans reduce wasted spend).",
        "",
        "This is why ROI can show up quickly: it’s not dependent on a single giant project—it’s the sum of many avoided reactive events.",
      ].join("\n"),
    keyNumbers: [
      { label: "Maintenance Cost Reduction", value: "18–25% (chart KPI)" },
      { label: "Downtime Reduction", value: "30–50% (chart KPI)" },
    ],
    confidence: "medium",
    relatedCharts: ["ROI Timeline", "Downtime Reduction", "Failure Reduction"],
    evidence: [E.deckMetrics, E.nasscoAIPaper],
  });

  qa.push({
    id: "roi-03",
    tab: "roi",
    question: "How should I handle the $15.7T global GDP impact statement?",
    shortAnswer:
      "Use it as macro context: AI is a proven economic driver; then bring the focus back to utility-specific operational savings and payback months.",
    fullAnswer:
      [
        "Your deck calls out: “Global GDP Impact: $15.7T AI contribution to global GDP by 2030.”",
        "",
        "How to use it correctly:",
        "- It’s not saying your utility captures $15.7T.",
        "- It establishes that AI adoption is a macro trend with measurable economic value.",
        "- Then you immediately pivot to your micro story: throughput, cost reduction, downtime reduction, and payback periods.",
        "",
        "If asked for evidence, point directly to the PwC report link.",
      ].join("\n"),
    keyNumbers: [{ label: "Global AI Impact", value: "$15.7T by 2030" }],
    confidence: "high",
    relatedCharts: ["Global GDP Impact Callout"],
    evidence: [E.pwcAI157T],
  });

  qa.push({
    id: "roi-04",
    tab: "roi",
    question: "If someone asks, “Why isn’t ROI immediate if AI is so powerful?”, what’s the best answer?",
    shortAnswer:
      "Because onboarding matters: data normalization, workflow integration, and QA/QC ramp-up take time—then compounding savings accelerate.",
    fullAnswer:
      [
        "A credible investor-grade answer:",
        "- “We don’t promise instant miracles.”",
        "- “The first phase is integration: ingesting video, mapping assets, configuring PACP workflows, training reviewers.”",
        "- “Then the value compounds as the backlog shrinks and the system gets ahead of failures.”",
        "",
        "This aligns with the chart: payback appears in 6–15 months rather than day one.",
      ].join("\n"),
    keyNumbers: [{ label: "Payback Window", value: "6–15 months (chart)" }],
    confidence: "high",
    relatedCharts: ["ROI Timeline Across Case Studies"],
    evidence: [E.deckMetrics, E.nasscoAIPaper],
  });

  // Technology Comparison
  qa.push({
    id: "tc-01",
    tab: "technology",
    question: "What does the Technology Platform Comparison chart show?",
    shortAnswer:
      "It positions four platforms across accuracy, speed, cost efficiency, integration, and compliance—showing different strengths by category.",
    fullAnswer:
      [
        "The Technology Platform Comparison chart is a decision matrix.",
        "",
        "Chart readout (selected highlights):",
        "- SewerAI: Accuracy 97%, Speed 90%, Cost Efficiency 85%, Compliance 90%",
        "- PipeSleuth: Accuracy 93%, Speed 95%, Cost Efficiency 75%, Compliance 98%",
        "- VAPAR: Accuracy 95%, Speed 80%, Cost Efficiency 80%, Compliance 92%",
        "- GraniteNet: Accuracy 90%, Speed 75%, Cost Efficiency 90%, Compliance 95%",
        "",
        "How to interpret it:",
        "- If your priority is speed and compliance: PipeSleuth scores highest on those in the chart.",
        "- If your priority is accuracy and throughput: SewerAI leads on accuracy in the chart and provides throughput references.",
        "- If your priority is cost efficiency: GraniteNet scores strongest on cost efficiency in the chart.",
      ].join("\n"),
    keyNumbers: [
      { label: "SewerAI Accuracy", value: "97%" },
      { label: "PipeSleuth Compliance", value: "98%" },
      { label: "GraniteNet Cost Efficiency", value: "90%" },
    ],
    confidence: "medium",
    relatedCharts: ["Technology Platform Comparison"],
    evidence: [E.deckMetrics, E.seweraiAutocode, E.vaparCase, E.cuesGraniteNet, E.nasscoPACP],
  });

  qa.push({
    id: "tc-02",
    tab: "technology",
    question: "What does “PACP compliance” actually mean to a buyer?",
    shortAnswer:
      "It means the defect coding follows NASSCO’s standard so results are transferable, comparable, and audit-friendly across teams and software.",
    fullAnswer:
      [
        "PACP is a standard for consistent assessment coding of underground infrastructure.",
        "",
        "To a buyer, PACP compliance means:",
        "- A shared defect language (codes, severity conventions).",
        "- Less subjectivity and fewer disputes about condition ratings.",
        "- Easier handoff between vendors and internal staff.",
        "- Better compatibility with certified reporting tools and databases.",
        "",
        "When AI is used, NASSCO’s position paper is useful to explain how AI can fit into a PACP environment with appropriate controls.",
      ].join("\n"),
    keyNumbers: [{ label: "Standard", value: "NASSCO PACP®" }],
    confidence: "high",
    relatedCharts: ["Compliance scores in Tech Comparison"],
    evidence: [E.nasscoPACP, E.nasscoAIPaper],
  });

  qa.push({
    id: "tc-03",
    tab: "technology",
    question: "How do we defend the “tens of thousands of linear feet per hour” throughput claim?",
    shortAnswer:
      "We cite the vendor documentation and a trade publication quote that provides an explicit feet-per-hour range.",
    fullAnswer:
      [
        "Throughput is the strongest measurable performance claim because it’s operationally observable.",
        "",
        "Evidence options:",
        "- SewerAI’s AutoCode product page states processing at ‘tens of thousands of linear feet per hour.’",
        "- A trade article quotes processing around 25,000 to 50,000 feet per hour and notes parallel inference capability.",
        "",
        "When presenting, you can say:",
        "“This is the throughput class we’re in—then the question becomes workflow integration and QA/QC.”",
      ].join("\n"),
    keyNumbers: [
      { label: "Throughput", value: "Tens of thousands LF/hour" },
      { label: "Quoted Range", value: "25,000–50,000 ft/hour" },
    ],
    confidence: "high",
    relatedCharts: ["Processing Speed Comparison", "Technology Features"],
    evidence: [E.seweraiAutocode, E.seweraiFeetPerHour],
  });

  qa.push({
    id: "tc-04",
    tab: "technology",
    question: "What is the best one-liner to explain why AI tools still need humans?",
    shortAnswer:
      "AI scales detection; humans own accountability—QA/QC, certification, and final decisions stay with trained professionals.",
    fullAnswer:
      [
        "A strong, non-threatening framing:",
        "“AI does the heavy lifting—humans do the judgment.”",
        "",
        "In sewer inspection and asset management, you still need:",
        "- certified coders / reviewers (quality and standards conformance)",
        "- engineers for rehab design and prioritization",
        "- field crews to execute work orders safely",
        "",
        "This aligns well with NASSCO’s discussion of subjectivity and the role of standards in producing consistent condition assessments.",
      ].join("\n"),
    keyNumbers: [
      { label: "Human Role", value: "QA/QC + accountability" },
      { label: "Standard Context", value: "PACP framework" },
    ],
    confidence: "high",
    relatedCharts: ["Key Technology Features", "Compliance"],
    evidence: [E.nasscoAIPaper, E.nasscoPACP],
  });

  // Company / context (extra questions to keep the pack > 20)
  qa.push({
    id: "cx-01",
    tab: "all",
    question: "What is Visu-Sewer, and why is it positioned as a rising force?",
    shortAnswer:
      "Visu-Sewer is a Midwest wastewater infrastructure company (founded 1975) with a long municipal track record and private equity backing, enabling scale and modernization.",
    fullAnswer:
      [
        "Visu-Sewer is positioned as a rising force because it combines:",
        "- long-standing operational credibility (decades of municipal work), and",
        "- modern capital strategy (Fort Point Capital partnership) for expansion and modernization.",
        "",
        "This matters for the AI infrastructure story because capital + operations capability is what turns technology into scaled delivery.",
      ].join("\n"),
    keyNumbers: [
      { label: "Founded", value: "1975" },
      { label: "Location", value: "Pewaukee, WI" },
    ],
    confidence: "medium",
    relatedCharts: ["Context / Company"],
    evidence: [E.visuSewerSite, E.zippiaVisuSewer, E.fortPointPortfolio],
  });

  qa.push({
    id: "cx-02",
    tab: "all",
    question: "What’s the best answer if someone asks: “Is this just vendor marketing?”",
    shortAnswer:
      "No: we anchor to standards (NASSCO PACP), measurable throughput, and pilot-ready ROI measurement against baseline KPIs.",
    fullAnswer:
      [
        "A clean investor response:",
        "- “We rely on standards (PACP) so results are auditable and transferable.”",
        "- “We rely on measurable operational KPIs (feet/hour, defects found, downtime reduction).”",
        "- “We can validate with a pilot and compare to baseline.”",
        "",
        "This keeps you grounded even when discussing vendor capability statements.",
      ].join("\n"),
    keyNumbers: [
      { label: "Standard Anchor", value: "NASSCO PACP" },
      { label: "Measurement Anchor", value: "throughput + baseline ROI" },
    ],
    confidence: "high",
    relatedCharts: ["All"],
    evidence: [E.nasscoPACP, E.nasscoAIPaper, E.seweraiAutocode],
  });

  qa.push({
    id: "cx-03",
    tab: "all",
    question: "What are the three KPIs I should repeat in every answer when challenged?",
    shortAnswer:
      "Throughput, detection quality, and unplanned events. Those three drive cost, safety, and ROI.",
    fullAnswer:
      [
        "When someone challenges a slide number, don’t argue the number—return to drivers:",
        "",
        "1) Throughput (how much pipe can be processed per hour/day).",
        "2) Detection quality (accuracy / additional defects / severity correctness).",
        "3) Unplanned events (downtime, emergency repairs, failures).",
        "",
        "These drivers connect every chart: performance → cost → workforce → ROI → platform choice.",
      ].join("\n"),
    keyNumbers: [
      { label: "KPI 1", value: "Throughput" },
      { label: "KPI 2", value: "Detection Quality" },
      { label: "KPI 3", value: "Unplanned Events" },
    ],
    confidence: "high",
    relatedCharts: ["All"],
    evidence: [E.deckMetrics, E.nasscoAIPaper],
  });

  // Duplicate "all" entries per-tab via rendering filter; ensure we have > 20 items
  // Add a few more targeted Qs (still evidence-backed)
  qa.push({
    id: "pm-05",
    tab: "performance",
    question: "If someone says “10x speed sounds impossible,” what should I say?",
    shortAnswer:
      "Explain that speed multipliers depend on workflow scope; AI runs in parallel and removes annotation bottlenecks, so the effective multiplier can be large.",
    fullAnswer:
      [
        "A strong response:",
        "- “10x reflects the end-to-end workflow when annotation is automated and processing is parallel.”",
        "- “The exact multiplier depends on whether you’re measuring: raw inference speed, report-ready output, or total cycle time.”",
        "- “What we can prove quickly is throughput class (feet/hour) and turnaround time.”",
        "",
        "Then point to throughput evidence and standards framing rather than debating the headline multiplier.",
      ].join("\n"),
    keyNumbers: [{ label: "Headline", value: "10x (deck metric)" }],
    confidence: "medium",
    relatedCharts: ["Processing Speed Comparison"],
    evidence: [E.deckMetrics, E.seweraiAutocode, E.seweraiFeetPerHour],
  });

  qa.push({
    id: "ca-05",
    tab: "cost",
    question: "How do I connect cost reduction to procurement-friendly language?",
    shortAnswer:
      "Talk in terms of avoided emergency costs, reduced consultant spend, measurable throughput, and audit-ready standards compliance.",
    fullAnswer:
      [
        "Procurement-friendly framing avoids hype and focuses on measurable items:",
        "- Reduce emergency callouts and reactive repairs (avoid overtime and disruption).",
        "- Reduce consultant-heavy manual coding (shift to automation + QA/QC).",
        "- Increase footage processed per unit time (higher output per headcount).",
        "- Maintain standards compliance (PACP) and audit trail (links, reports, logs).",
        "",
        "This aligns with how municipal buyers evaluate technology: risk reduction + predictable costs + compliance.",
      ].join("\n"),
    keyNumbers: [{ label: "Procurement Frame", value: "Risk + Predictability + Compliance" }],
    confidence: "high",
    relatedCharts: ["Cost Reduction Comparison"],
    evidence: [E.nasscoPACP, E.nasscoAIPaper],
  });

  qa.push({
    id: "wf-05",
    tab: "workforce",
    question: "What training message should I give to leadership when adopting AI tools?",
    shortAnswer:
      "Train for roles, not tools: certify inspectors, build QA/QC workflows, and upskill analysts into planners and asset strategists.",
    fullAnswer:
      [
        "A credible training message:",
        "- “We’re not training people to click buttons—we’re training them for upgraded roles.”",
        "- “Certification (PACP/MACP/LACP) + QA/QC discipline keeps outputs consistent.”",
        "- “Analysts move up the value chain: from manual coding to prioritization, risk scoring, and rehab planning.”",
      ].join("\n"),
    keyNumbers: [{ label: "Training Target", value: "Roles & standards" }],
    confidence: "high",
    relatedCharts: ["Workforce Transformation Metrics"],
    evidence: [E.nasscoPACP, E.nasscoAIPaper],
  });

  qa.push({
    id: "roi-05",
    tab: "roi",
    question: "What is the best 10-second investor summary of the ROI tab?",
    shortAnswer:
      "We see payback in months, not years, because AI reduces failure, reduces downtime, and accelerates inspection throughput.",
    fullAnswer:
      [
        "10-second script:",
        "“This tab shows payback in 6–15 months. The why is simple: fewer failures, less unplanned downtime, and much faster inspection processing—so savings compound fast.”",
        "",
        "Then point them to the right side of the chart and read one case study line out loud.",
      ].join("\n"),
    keyNumbers: [{ label: "Payback Window", value: "6–15 months" }],
    confidence: "high",
    relatedCharts: ["ROI Timeline Across Case Studies"],
    evidence: [E.deckMetrics],
  });

  qa.push({
    id: "tc-05",
    tab: "technology",
    question: "How do I explain the difference between “accuracy” and “compliance” on the tech chart?",
    shortAnswer:
      "Accuracy is detection quality; compliance is whether outputs align with standards (e.g., PACP) and can be used in municipal workflows without rework.",
    fullAnswer:
      [
        "A clean distinction:",
        "- Accuracy: how well the platform detects and classifies defects.",
        "- Compliance: how well the platform fits standards (PACP/LACP/MACP), reporting requirements, and audit trails.",
        "",
        "Compliance is often the deciding factor in government contexts because it reduces downstream friction, disputes, and rework.",
      ].join("\n"),
    keyNumbers: [
      { label: "Accuracy", value: "Detection quality" },
      { label: "Compliance", value: "Standards + auditability" },
    ],
    confidence: "high",
    relatedCharts: ["Technology Platform Comparison"],
    evidence: [E.nasscoPACP, E.nasscoAIPaper],
  });

  // Make "All" tab automatically include everything; we also keep a few explicitly tagged "all".
  return qa;
}

// -------------------------------------
// Agent Lee narration dispatch (optional)
// -------------------------------------
type AgentLeeMode = "hybrid" | "local-only" | "agentlee-only";

function dispatchToAgentLee(text: string) {
  try {
    window.dispatchEvent(new Event("agentlee:open"));
    window.dispatchEvent(new CustomEvent("agentlee:narrate", { detail: { text } }));
  } catch {
    // no-op
  }
}

function safeSpeechSynthesis(text: string) {
  try {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    // no-op
  }
}

// -------------------------------------
// UI helpers
// -------------------------------------
function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/40 px-2 py-0.5 text-[11px] text-slate-200">
    {children}
  </span>
);

function EvidenceBadge({ type }: { type: EvidenceType }) {
  const cls =
    type === "external"
      ? "border-emerald-600/50 bg-emerald-500/10 text-emerald-200"
      : type === "deck"
        ? "border-amber-600/50 bg-amber-500/10 text-amber-200"
        : "border-slate-600/50 bg-slate-500/10 text-slate-200";

  const label = type === "external" ? "External" : type === "deck" ? "Deck" : "Internal";
  return <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", cls)}>{label}</span>;
}

// -------------------------------------
// Component
// -------------------------------------
export default function Page15AIQA(): React.ReactElement {
  let MODE: AgentLeeMode = "local-only"; // set to "hybrid" if you want Agent Lee narration events as well

  const qaPack = useMemo(() => buildQAPack(), []);
  const [tab, setTab] = useState<TabKey>("evidence");
  const [openId, setOpenId] = useState<string | null>(qaPack[0]?.id ?? null);
  const [filter, setFilter] = useState<string>("");

  const topRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();

    const inTab = (item: QAItem) => {
      if (tab === "all") return true;
      return item.tab === tab;
    };

    return qaPack
      .filter(inTab)
      .filter((item: QAItem) => {
        if (!q) return true;
        return (
          item.question.toLowerCase().includes(q) ||
          item.shortAnswer.toLowerCase().includes(q) ||
          item.fullAnswer.toLowerCase().includes(q)
        );
      });
  }, [qaPack, tab, filter]);

  const allCounts = useMemo(() => {
    const counts: Record<TabKey, number> = {
      evidence: 0,
      performance: 0,
      cost: 0,
      workforce: 0,
      roi: 0,
      technology: 0,
      all: qaPack.length,
    };
    for (const item of qaPack) counts[item.tab] += 1;
    return counts;
  }, [qaPack]);

  const open = (id: string) => {
    setOpenId((cur: string | null) => (cur === id ? null : id));
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const narrate = (item: QAItem) => {
    const text = `${item.question}\n\n${item.fullAnswer}`;
    const dispatchModes: AgentLeeMode[] = ["agentlee-only", "hybrid"];
    const speakModes: AgentLeeMode[] = ["local-only", "hybrid"];

    if (dispatchModes.includes(MODE)) dispatchToAgentLee(text);
    if (speakModes.includes(MODE)) safeSpeechSynthesis(text);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white">
      <div ref={topRef} />

      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-base font-semibold text-cyan-200">Page 15 — Evidence Q&amp;A (Static)</h1>
              <p className="text-xs text-slate-400">
                Click a question to reveal a complete answer with numbers + evidence links. No guessing.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Pill>Mode: {MODE}</Pill>
              <Pill>Total Q&amp;A: {qaPack.length}</Pill>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {TABS.map((t: TabDef) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  setOpenId(null);
                }}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs transition",
                  tab === t.key
                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-200"
                    : "border-slate-700 bg-slate-900/30 text-slate-200 hover:bg-slate-900/50"
                )}
              >
                <span className="mr-2">{t.icon}</span>
                {t.label}
                <span className="ml-2 text-[11px] text-slate-400">({t.key === "all" ? qaPack.length : allCounts[t.key]})</span>
              </button>
            ))}

            <div className="ml-auto w-full sm:w-80">
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500/60"
                placeholder="Search questions, numbers, keywords…"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Evidence Summary (always visible) */}
        <section className="mb-5 rounded-xl border border-slate-800 bg-slate-900/25 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Evidence Summary</h2>
              <p className="mt-1 text-xs text-slate-400">
                Use this as your “look to the right at the chart” support. When challenged, open the most relevant question and read the answer + show the links.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill>External sources are labeled</Pill>
              <Pill>Deck metrics are transparent</Pill>
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <div className="text-xs font-semibold text-cyan-200">Core external anchors (recommended to cite live)</div>
              <div className="mt-2 space-y-2 text-xs">
                {[E.nasscoPACP, E.nasscoAIPaper, E.seweraiAutocode, E.vaparCase, E.pwcAI157T].map((x: EvidenceItem) => (
                  <a key={x.url} href={x.url} target="_blank" rel="noreferrer" className="block truncate text-blue-300 hover:text-blue-200">
                    {x.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <div className="text-xs font-semibold text-amber-200">Deck metric anchors (chart-derived)</div>
              <div className="mt-2 text-xs text-slate-300">
                Speed multipliers, accuracy, defect uplift, cost reduction, ROI months, and platform scores come from your Page 15 charts.
                If you want any one of these to be externally corroborated, add its exact citation URL into the Evidence Registry at the top.
              </div>
            </div>
          </div>
        </section>

        {/* Q&A List */}
        <section className="space-y-3">
          {filtered.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/25 p-6 text-center text-sm text-slate-300">
              No matches. Try clearing the search or using a different keyword.
            </div>
          )}

          {filtered.map((item: QAItem) => {
            const isOpen = openId === item.id;

            return (
              <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/20">
                <button
                  onClick={() => open(item.id)}
                  className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-100">{item.question}</span>
                      <Pill>{item.confidence} confidence</Pill>
                      {item.relatedCharts.slice(0, 2).map((c: string) => (
                        <Pill key={c}>{c}</Pill>
                      ))}
                      {item.relatedCharts.length > 2 && <Pill>+{item.relatedCharts.length - 2} more</Pill>}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">{item.shortAnswer}</div>
                  </div>
                  <div className="mt-1 text-slate-400">{isOpen ? "−" : "+"}</div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-800 px-4 py-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      {/* Answer */}
                      <div className="md:col-span-2">
                        <div className="text-xs font-semibold text-cyan-200">Answer</div>
                        <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-200">
                          {item.fullAnswer}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => narrate(item)}
                            className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 hover:bg-cyan-500/15"
                          >
                            Narrate
                          </button>
                          <button
                            onClick={() => {
                              const anchor = item.relatedCharts[0] ?? "Page 15 charts";
                              safeSpeechSynthesis(`Look to the right at the chart: ${anchor}.`);
                            }}
                            className="rounded-lg border border-slate-700 bg-slate-900/30 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-900/50"
                          >
                            “Look right at the chart”
                          </button>
                        </div>
                      </div>

                      {/* Evidence + Numbers */}
                      <div>
                        <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                          <div className="text-xs font-semibold text-slate-100">Key numbers</div>
                          <div className="mt-2 space-y-2">
                            {item.keyNumbers.map((kn: { label: string; value: string }) => (
                              <div key={kn.label} className="flex items-start justify-between gap-2 text-xs">
                                <span className="text-slate-400">{kn.label}</span>
                                <span className="font-semibold text-slate-200">{kn.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-slate-100">Evidence</div>
                            <Pill>{item.evidence.length} links</Pill>
                          </div>

                          <div className="mt-2 space-y-2 text-xs">
                            {item.evidence.map((ev: EvidenceItem) => (
                              <div key={`${item.id}-${ev.label}`} className="flex items-start justify-between gap-2">
                                <a
                                  href={ev.url === "#" ? undefined : ev.url}
                                  target={ev.url === "#" ? undefined : "_blank"}
                                  rel={ev.url === "#" ? undefined : "noreferrer"}
                                  className={cn(
                                    "min-w-0 flex-1 truncate",
                                    ev.url === "#"
                                      ? "text-slate-400 cursor-default"
                                      : "text-blue-300 hover:text-blue-200"
                                  )}
                                >
                                  {ev.label}
                                </a>
                                <EvidenceBadge type={ev.type} />
                              </div>
                            ))}
                          </div>

                          {item.evidence.some((x: EvidenceItem) => x.url === "#") && (
                            <div className="mt-3 text-[11px] text-slate-400">
                              Note: “Deck” links are placeholders by design. Add your chosen citation URL(s) to the Evidence Registry to upgrade them.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer chips */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-3">
                      <Pill>Category: {item.tab}</Pill>
                      {item.relatedCharts.map((c: string) => (
                        <Pill key={`${item.id}-${c}`}>Chart: {c}</Pill>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Footer meta */}
        <footer className="mt-10 rounded-xl border border-slate-800 bg-slate-900/20 p-4">
          <div className="text-xs font-semibold text-slate-200">Implementation Notes</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-400">
            <li>This page is deterministic: answers are authored, not generated at runtime.</li>
            <li>Evidence is explicitly listed. If a metric has no link yet, it is labeled “Deck” transparently.</li>
            <li>To expand beyond 25 questions, add more QAItem entries in <code>buildQAPack()</code>.</li>
            <li>If you want Agent Lee to narrate (single voice), set MODE = <code>"hybrid"</code> and listen for <code>agentlee:narrate</code>.</li>
          </ul>
        </footer>
      </main>
    </div>
  );
}
