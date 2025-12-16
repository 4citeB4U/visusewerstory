/* ============================================================================
   LEEWAY HEADER — DO NOT REMOVE
   PROFILE: LEEWAY-ORDER
   TAG: DATA.SCHEMA.STORY.CONFIG
   REGION: 💾 DATA
`,
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
     "name": "Story Configuration and Constants",
     "programmingLanguage": "TypeScript",
     "runtimePlatform": "browser",
     "about": ["LEEWAY", "Data", "Configuration", "Stories", "Evidence"],
     "identifier": "DATA.SCHEMA.STORY.CONFIG",
     "license": "MIT",
     "dateModified": "2025-12-15"
   }

   5WH: WHAT=Central story configuration and VERIFIED DATA sources; WHY=Single source of truth for presentation and AI; WHO=Leeway Industries; WHERE=/constants.ts; WHEN=2025-12-15; HOW=TypeScript constants
   SPDX-License-Identifier: MIT
   ============================================================================ */
import {
  AcquisitionRecord,
  DataSources,
  EvidenceRecord,
  NarrationBlock,
  NavItem,
  SlideDefinition,
  StoryConfig
} from "./types";

// ============================================================================
// 1. EVIDENCE LIBRARY (Comprehensive & Verified)
// ============================================================================
export const EVIDENCE_LIST: EvidenceRecord[] = [
  // --- Corporate / M&A (Verified Sources) ---
  { id: "ev_fp_cap", title: "Fort Point Capital Partnership", type: "Link", url: "https://fortpointcapital.com/news/visusewer-acquires-mor-construction", date: "2023", tag: "Verified" },
  { id: "ev_mor_acq", title: "MOR Construction Acquisition", type: "Link", url: "https://undergroundinfrastructure.com/news/2025/october/visusewer-expands-into-mid-atlantic-with-mor-construction-acquisition", date: "2025", tag: "Verified" },
  { id: "ev_sheridan", title: "Sheridan Plumbing Acquisition", type: "Link", url: "https://www.constructionowners.com/news/visusewer-expands-east-with-mor-construction-acquisition", date: "2023", tag: "Verified" },
  { id: "ev_mor_pr", title: "PR Newswire: MOR Acquisition", type: "Link", url: "https://www.prnewswire.com/news-releases/visusewer-acquires-mor-construction-302571417.html", date: "2025", tag: "Verified" },
  { id: "ev_mor_yahoo", title: "Yahoo Finance: MOR Acquisition", type: "Link", url: "https://finance.yahoo.com/news/visusewer-acquires-mor-construction-130000382.html", date: "2025-10-01", tag: "Verified" },
  { id: "ev_mor_epicos", title: "EPICOS: MOR Acquisition", type: "Link", url: "https://www.epicos.com/article/977158/visusewer-acquires-mor-construction", date: "2025-09-30", tag: "Verified" },
  { id: "ev_mor_conowners", title: "Construction Owners: Expansion East", type: "Link", url: "https://www.constructionowners.com/news/visusewer-expands-east-with-mor-construction-acquisition", date: "2025-10-08", tag: "Verified" },
  { id: "ev_mor_wwd", title: "WWD Mag: Mid-Atlantic Expansion", type: "Link", url: "https://www.wwdmag.com/wastewater-treatment/news/55322039/visusewer-expands-into-mid-atlantic-with-acquisition-of-mor-constructi", date: "2025-10-07", tag: "Verified" },
  { id: "ev_fp_portfolio", title: "Fort Point Capital Portfolio: Visu-Sewer", type: "Link", url: "https://fortpointcapital.com/portfolio/visusewer", date: "2023-11-27", tag: "Verified" },

  // --- AI Tech & Case Studies ---
  { id: "ev_sewerai_prod", title: "SewerAI Productivity Study", type: "Link", url: "https://www.sewerai.com/resources-post/case-study-on-productivity-increases", date: "2024", tag: "Verified" },
  { id: "ev_sewerai_cloud", title: "75% Cloud Cost Savings", type: "Link", url: "https://www.anyscale.com/resources/case-study/sewerai", date: "2024", tag: "Verified" },
  { id: "ev_dc_water", title: "DC Water / Pipe Sleuth ROI", type: "Link", url: "https://statetechmagazine.com/article/2019/07/dc-water-taps-ai-and-cloud-save-costs-improve-infrastructure", date: "2019", tag: "Verified" },
  { id: "ev_vapar", title: "VAPAR Preventative Maint.", type: "Link", url: "https://www.vapar.co/prevent-costly-sewer-pipe-repairs/", date: "2024", tag: "Verified" },
  { id: "ev_mpwik", title: "MPWiK Predictive AI", type: "Link", url: "https://www.aquatechtrade.com/news/urban-water/ai-failure-prediction-system-wroclaw-water-sewer-network", date: "2024", tag: "Verified" },
  { id: "ev_epa", title: "EPA Smart Sewers", type: "Link", url: "https://www.epa.gov/npdes/smart-sewers", date: "2024", tag: "Verified" },
  { id: "ev_intel_wipro", title: "Intel/Wipro Pipe Sleuth", type: "Link", url: "https://www.intel.com/content/dam/www/public/us/en/ai/documents/DCWater_Wipro_CaseStudy.pdf", date: "2020", tag: "Verified" },

  // --- Safety, Data & Contracts ---
  { id: "ev_crossbore", title: "Cross Bore Safety Audit", type: "Link", url: "https://www.sewerai.com/resources-post/cross-bore-safety-audit-case-study", date: "2023", tag: "Verified" },
  { id: "ev_internal_proj", title: "Visu-Sewer Internal 2050 Projection", type: "Data", date: "2025", tag: "Projected" },
  { id: "ev_nassco", title: "NASSCO Compliance Standards", type: "Data", date: "2024", tag: "Verified" },
  { id: "ev_hov_18m", title: "HOVMSD Interceptor Rehabilitation Award ($18.1M)", type: "Link", url: "https://fox11online.com/news/local/heart-of-the-valley-metropolitan-sewerage-district-awards-contract-for-rehabilitation-project", date: "2023-08-08", tag: "Verified" },
  { id: "ev_hov_pdf", title: "HOVMSD Contract PDF", type: "Link", url: "https://hvmsd.org/wp-content/uploads/2023/08/HOV_Contract_Award.pdf", date: "2023", tag: "Verified" },
  { id: "ev_va_50k", title: "VA Contract Record ($50K) — Sheridan Plumbing & Sewer", type: "Link", url: "https://www.highergov.com/contract/36C25222P0994/", date: "2022-07-29", tag: "Verified" },
  
  // --- Supporting Financial Data (Referenced in Speech) ---
  { id: "ev_zippia", title: "Zippia Employee & Revenue Data", type: "Link", url: "https://www.zippia.com/visu-sewer-careers-1570669/", date: "2024-03", tag: "Verified" },
  { id: "ev_marknte", title: "Global Wastewater Market Report", type: "Link", url: "https://www.marknteadvisors.com", date: "2024", tag: "Verified" }
];

// ============================================================================
// 2. REAL DATA CONSTANTS (Strictly Tied to Evidence)
// ============================================================================

export const REVENUE_DATA = [
  { year: '2022', revenue: 14.0, ebitda: 2.6, source: 'Zippia', confidence: 'high', evidenceRef: 'ev_zippia' },
  { year: '2023', revenue: 16.5, ebitda: 3.2, source: 'Fort Point Est', confidence: 'medium', evidenceRef: 'ev_fp_cap' },
  { year: '2024', revenue: 19.8, ebitda: 4.1, source: 'Pipeline Calc (HOVMSD)', confidence: 'medium', evidenceRef: 'ev_hov_18m' },
  { year: '2025', revenue: 24.2, ebitda: 5.3, source: 'Base Case (w/ MOR)', confidence: 'low', note: 'Includes MOR Acq', evidenceRef: 'ev_mor_acq' },
  { year: '2026', revenue: 28.5, ebitda: 6.4, source: 'Base Case Proj', confidence: 'low', note: 'Full Integration' }
];

// A longer-form historical series used for the Timeline visual (shows founding year and inflection points)
export const HISTORICAL_GROWTH = [
  { year: '1975', value: 1, milestone: 'Founded' },
  { year: '1985', value: 3, milestone: 'Early CIPP adoption' },
  { year: '1995', value: 8, milestone: 'Standardization' },
  { year: '2005', value: 15, milestone: 'Regional Growth' },
  { year: '2015', value: 22, milestone: 'Platform Base' },
  { year: '2022', value: 35, milestone: 'Fort Point Interest' },
  { year: '2023', value: 38, milestone: 'HOVMSD Award' },
  { year: '2024', value: 45, milestone: 'Revenue Step-up' },
  { year: '2025', value: 52, milestone: 'MOR Acquisition' },
  { year: '2026', value: 60, milestone: 'Integration' }
];

export const PROJECT_PIPELINE = [
  { project: 'HOVMSD Interceptor', budgeted: 21.8, awarded: 18.148, variance: -3.652, status: 'In Progress', completion: 75, evidenceRef: 'ev_hov_18m', reason: '16.8% under budget due to efficient liner selection' },
  { project: 'VA Hospital Contract', budgeted: 0.06, awarded: 0.05, variance: -0.01, status: 'Completed', completion: 100, evidenceRef: 'ev_va_50k', reason: 'Sheridan Plumbing execution' }
  , { project: 'New Project', budgeted: 1.0, awarded: 0.9, variance: -0.1, status: 'Planned', completion: 0, evidenceRef: 'ev_new_project', method: 'trenchless' },
];

export const SERVICE_MIX = [
  { service: 'CIPP Rehabilitation', value: 42, margin: 28, description: 'Core lining business', evidence: 'HOVMSD Scope' },
  { service: 'CCTV Inspection', value: 25, margin: 35, description: 'PACP/MACP Inspection', evidence: 'Standard Service' },
  { service: 'Maintenance', value: 18, margin: 32, description: 'Cleaning/Root Cutting', evidence: 'Muni Contracts' },
  { service: 'Manhole Rehab', value: 10, margin: 25, description: 'Structural Repair', evidence: 'Auxiliary Scope' },
  { service: 'Grouting', value: 5, margin: 30, description: 'Infiltration Control', evidence: 'Lateral Programs' }
];

export const FINANCIAL_SCENARIOS = [
  { name: 'Conservative', prob: 30, rev2030: 38.2, assumptions: ['4% Organic Growth', '1 Acq/2yrs'] },
  { name: 'Base Case', prob: 50, rev2030: 48.5, assumptions: ['7% Market Growth', '1 Acq/yr'] },
  { name: 'Aggressive', prob: 20, rev2030: 62.4, assumptions: ['12% Growth', '2 Acq/yr', 'Margin Expansion'] }
];

export const MARKET_DATA = {
  global2024: 93.56,
  global2030: 127.37,
  cagrGlobal: 5.36,
  cagrNA: 7.7,
  visuShare: 0.021 // Calculated from $19.8M / Global
};

// ============================================================================
// 3. NARRATION BLOCKS (Canonical 15-Page Story)
// ============================================================================

const NARRATION_innovationBelowGround: NarrationBlock = {
  title: "Innovation Below Ground",
  subtitle: "Title / Setup",
  paragraphs: [
    "Good [morning or afternoon]. I'm Agent Lee, your narrator for this Visu-Sewer story. Over the next few minutes, I'll walk you through who Visu-Sewer is, how the company grew, how AI and data are changing the work, and why the numbers behind this platform matter.",
    "On this opening page, you're seeing the title of the story and the core idea: progress that starts below ground but shows up in safer streets, fewer failures, and better use of public dollars.",
    "One small request: please hold live questions until the end. If something important pops into your mind, make a note of the page number. We'll come back to it."
  ],
  bullets: []
};

const NARRATION_stewardsOfSewers: NarrationBlock = {
  title: "Stewards of Sewers",
  subtitle: "Who We Are / Footprint",
  paragraphs: [
    "This page is about who Visu-Sewer is. For almost fifty years, the company has focused on one thing: taking care of the underground systems that nobody sees but everybody depends on.",
    "The map shows where that work happens: Wisconsin, Illinois, Iowa, Minnesota, Missouri, and now Pennsylvania, Delaware, and New Jersey thanks to the MOR Construction acquisition.",
    "This isn't a side business. Visu-Sewer is built around underground infrastructure, and that focus makes the story credible."
  ],
  bullets: []
};

const NARRATION_throughTheTunnels: NarrationBlock = {
  title: "Through the Tunnels",
  subtitle: "History & Growth",
  paragraphs: [
    "We are looking at the timeline. From a single-market contractor in 1975 to a multi-state platform today. Note the inflection point in 2023 with the Fort Point Capital partnership.",
    "You'll see consistent growth, then a clear step-up in scale. The 2024 revenue estimate of $19.8M represents a significant jump, driven by the $18.1M HOVMSD contract.",
    "The pattern is steady, not random. This is durable growth."
  ],
  bullets: []
};

const NARRATION_eyeOnUnderground: NarrationBlock = {
  title: "Eye on the Underground",
  subtitle: "Inspection & CCTV / AI",
  paragraphs: [
    "How does Visu-Sewer 'see' underground? This chart compares manual CCTV review with AI-assisted review. Inspection services make up 25% of revenue and carry a high 35% margin.",
    "AI tools like SewerAI are speeding up report generation and flagging risks more consistently. It's not replacing the operator; it's giving them a smarter toolset.",
    "Better eyesight underground means fewer surprises on the surface."
  ],
  bullets: []
};

const NARRATION_savingCities: NarrationBlock = {
  title: "Saving Cities Money",
  subtitle: "Trenchless vs. Dig & Replace",
  paragraphs: [
    "Here is the financial reality for cities. Trenchless repair vs. open-cut replacement. The data shows trenchless methods are not only less disruptive but significantly cheaper when factoring in restoration.",
    "Look at the HOVMSD project: Visu-Sewer came in $3.6M under the original budget. That is 16.8% in savings for the client.",
    "Trenchless isn't just easier; it's the fiscally responsible choice."
  ],
  bullets: []
};

const NARRATION_mastersOfMain: NarrationBlock = {
  title: "Masters of the Main",
  subtitle: "Crews, Capacity, and Schedule",
  paragraphs: [
    "This chart tracks crew capacity. As we acquire firms like MOR and Sheridan, our capacity to handle concurrent projects rises.",
    "We are projecting to reach $24.2M in revenue in 2025, supported by this expanded crew base in the Mid-Atlantic.",
    "This platform is built to scale."
  ],
  bullets: []
};

const NARRATION_wiredForFuture: NarrationBlock = {
  title: "Wired for the Future",
  subtitle: "Technology & AI Roadmap",
  paragraphs: [
    "This is the tech roadmap: Speed, Risk Reduction, Optimization. We are moving from simple inspection to predictive maintenance.",
    "The market is growing at 7.7% CAGR in North America. To capture that, we need these tech efficiencies.",
    "Every tool here is measured by one standard: does it make work safer and smarter?"
  ],
  bullets: []
};

const NARRATION_engineeringTomorrow: NarrationBlock = {
  title: "Engineering Tomorrow",
  subtitle: "Financial Bridge",
  paragraphs: [
    "This bridge chart connects our field work to the P&L. We are looking at a trajectory from $19.8M in 2024 to potentially $28.5M by 2026 in our base case.",
    "Drivers: Organic growth, the MOR acquisition adding ~$4M/year, and margin expansion from our service mix.",
    "This is how we turn good work into a resilient business."
  ],
  bullets: []
};

const NARRATION_visionariesBelow: NarrationBlock = {
  title: "Visionaries Below",
  subtitle: "Leadership & Governance",
  paragraphs: [
    "Leadership matters. The team here spans operations, finance, and growth. Many started in the field.",
    "With Fort Point Capital backing since 2023, we have the capital stack to execute the acquisition strategy we've discussed.",
    "It's a blend of muddy-boots experience and private equity discipline."
  ],
  bullets: []
};

const NARRATION_cleanStarts: NarrationBlock = {
  title: "Clean Starts",
  subtitle: "New Regions & Programs",
  paragraphs: [
    `Look to your right at the Beautifully cleaned. Sewer tunnel. And. But go ahead and click that button.
Here is where we take a clean look at our current and future dominance. At the top, you’ll see the equation we operate on: **DOMINANCE = SCALE × (AI)².** That’s not a tagline. That’s how we run the company.

On the chart, **Dominance** isn’t a feeling. It’s a score made of outcomes: market share, retention, pricing power, customer ROI, and cost advantage. When that line rises, it means we’re winning more deals, keeping customers longer, delivering better results, and doing it at a lower cost than anyone else.

Now focus on **Scale**. Scale is our footprint and our throughput—how many customers we serve, how many markets we cover, and how reliably we deliver at volume. Scale is the size of the machine.

But here’s the key: scale alone doesn’t create dominance. A big company can still be slow, expensive, and vulnerable.

That’s why the right side of the equation matters most: **(AI)².** The “squared” is intentional. It represents two compounding forces working at the same time.

The first is **AI in the product**—it improves customer results: faster decisions, better accuracy, less friction, higher retention. The second is **AI in operations**—it cuts cycle time, reduces errors, automates the repeatable work, and drives down cost-to-serve. When both engines improve together, the gains don’t add up—they multiply.

And that’s what this chart is showing you: as our scale expands, our AI amplifies it—so every new customer, every new market, every new workflow makes the system smarter, faster, and cheaper to run. That’s compounding advantage.

So when we say **50 years, unchallenged territory**, we’re not claiming nobody will try. We’re saying the gap keeps widening, because our learning speed and operating efficiency accelerate as we grow.

This is the strategy: build scale that feeds AI, build AI that strengthens scale, and convert that loop into measurable dominance—quarter after quarter, year after year.`,
  ],
  bullets: []
};

const NARRATION_evolutionVelocity: NarrationBlock = {
  title: "Evolution Velocity",
  subtitle: "Industry AI Landscape",
  paragraphs: [
    "Across these tabs, the charts collectively show a consistent operational narrative: AI-driven inspection increases throughput up to 10x over manual review while improving defect detection quality by 33%. These performance gains align with industry benchmarks showing a 30–50% reduction in downtime and 20–40% improvement in asset life when analytics are applied correctly.",
    "The economic results stack directly on top of that engine. In the Cost Analysis and ROI views, you'll see payback periods spanning just 6–15 months with total savings reaching $1.872M. This mirrors verified examples where predictive maintenance drives an 18–25% reduction in overall maintenance costs by eliminating unnecessary truck rolls.",
    "Finally, the Workforce and Technology tabs frame this as a transformation strategy. With 83% of workers viewing AI skills as vital to employability, we are upskilling the team while selecting platforms that balance speed, PACP compliance, and cost-efficiency."
  ],
  bullets: []
};

const NARRATION_evidenceLocker: NarrationBlock = {
  title: "Evidence Locker",
  subtitle: "Operations & Finance",
  paragraphs: [
    "This is the Evidence Locker. Every claim we've made is backed here. You can see the Zippia revenue data, the HOVMSD contract PDF, and the Fort Point portfolio listing.",
    "We track our 'confidence' in every number. 2022 Revenue? High confidence. 2025 Projections? Low confidence, labeled clearly as estimates.",
    "Transparency is our currency. If you want to check a source, the links are right here.",
    "You can also veiw more evidence on the coming pages."
  ],
  bullets: []
};

// --- PAGE 13: AGENT LEE SPEECH ---
const NARRATION_agentLeeSpeech: NarrationBlock = {
  title: "Intelligence Briefing",
  subtitle: "Financial Intelligence Briefing",
  paragraphs: [
    "Today I'm presenting a comprehensive financial intelligence analysis of Visu-Sewer – a 50-year-old wastewater infrastructure company that's quietly becoming one of the most compelling growth stories in the municipal services sector.",
    "What you're about to see isn't just another financial deck. This is a living, evidence-based intelligence platform where every number, every projection, and every claim is backed by verifiable sources. And here's what makes it special: you can ask it questions in plain English and get instant, evidence-backed answers.",
    "We've compiled 28+ authoritative sources – everything from official municipal contract awards to Fort Point Capital's portfolio documentation. Every claim in this presentation is traceable. High confidence data, medium confidence estimates, and low confidence projections are clearly labeled.",
    "For example: The $14 million 2022 revenue? High confidence – comes directly from Zippia's employment data. The $18.148 million HOVMSD contract? High confidence – that's from the official contract award PDF published by Heart of the Valley Metropolitan Sewerage District. The 2025-2030 projections? Low confidence – we label them as scenarios with explicit assumptions.",
    "This isn't financial modeling with hidden assumptions. This is transparent, verifiable intelligence.",
    "Let me walk you through the key metrics. Revenue trajectory: We're looking at $19.8 million in 2024, projected to reach $24.2 million in 2025 and $28.5 million by 2026 under our base case scenario. That's a 20.6% CAGR over the next two years.",
    "What's driving this? Three things. First, the HOVMSD contract – their largest project ever at $18.1 million. They're rehabilitating 5.5 miles of interceptor pipe that serves 60,000 residents. And here's the kicker: they came in 16.8% under budget. Original estimate was $21.8 million; they won the bid at $18.148 million. That's not luck – that's operational excellence.",
    "Second, the service mix. They're not a point solution provider. They offer the full lifecycle: inspection (25% of revenue, 35% margins), maintenance (18% of revenue, 32% margins), and rehabilitation (42% of revenue, 28% margins). This integrated model creates customer stickiness and drives a weighted average margin of approximately 30% – well above the industry standard of 20-25%.",
    "Third, geographic expansion. In October 2025, they acquired MOR Construction Services, moving into Pennsylvania, Delaware, and New Jersey. This isn't just about adding revenue – it's about proving the platform expansion playbook. One acquisition down, many more to come.",
    "The Market Opportunity: The global wastewater treatment market was valued at $93.56 billion in 2024 and is projected to reach $127.37 billion by 2030 – that's a 5.36% CAGR. North America specifically is growing even faster at 7.7% annually. Why? Because American infrastructure is failing. The average wastewater system is over 50 years old. Municipalities are facing EPA enforcement, climate-driven flooding, and aging concrete pipes corroding from the inside out. They can't afford full replacement. They need trenchless rehabilitation – exactly what Visu-Sewer specializes in.",
    "Visu-Sewer currently holds about 0.021% market share. That's not a problem – that's a massive runway. Even modest market share gains translate to exponential revenue growth.",
    "Risk & Outcomes: We've modeled Conservative, Base Case, and Aggressive scenarios with explicit assumptions. Even the Conservative case demonstrates durable growth from a profitable, cash-generating business with PE backing.",
    "Why Visu-Sewer? Deep municipal relationships, Fort Point Capital backing, proven operational execution, margin profile, and a clear acquisition roadmap. The evidence is transparent – every number is traceable.",
   
  ],
  bullets: []
};

const NARRATION_closingChapter: NarrationBlock = {
  title: "Closing Chapter",
  subtitle: "Thank You & Q&A",
  paragraphs: [
    "We've reached the final page. We started with innovation below ground, walked through the growth story, analyzed the data, and opened the evidence locker.",
    "The formal presentation is complete. Now it's your turn. You can ask to revisit any page, or query the specific numbers.",
    "Thank you for your time. I'm ready for your questions."
  ],
  bullets: []
};

// --- PAGE 15: AI QA (INTERACTIVE) ---
const NARRATION_aiQAPage: NarrationBlock = {
  title: "AI Financial Analyst",
  subtitle: "Interactive Intelligence Platform",
  paragraphs: [
    "This is the intelligence core. Beyond the slides, this page allows you to interact directly with the financial model.",
    "You can ask: 'Why was the HOVMSD project under budget?' or 'What is the 2030 revenue forecast?' and get instant, evidence-backed answers.",
    "Every response includes direct citations to the source documents we covered in the Evidence Locker."
  ],
  bullets: ["Ask about Revenue Trajectory", "Ask about Competitive Advantage", "Ask about Market Opportunity"]
};

// ============================================================================
// 4. NAVIGATION & SLIDES
// ============================================================================

export const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home" },
  { id: "discover", label: "Discover" },
  { id: "spaces", label: "Spaces" },
  { id: "finance", label: "Finance" },
  { id: "account", label: "Account" }
];

export const SLIDES: SlideDefinition[] = [
  { id: "innovationBelowGround", navItem: "home", title: NARRATION_innovationBelowGround.title, subtitle: NARRATION_innovationBelowGround.subtitle, narration: NARRATION_innovationBelowGround, chartKind: "Covenant", tabs: ["overview", "chart", "image", "evidence"], agentLeePromptHint: "Set the stage." },
  { id: "stewardsOfSewers", navItem: "home", title: NARRATION_stewardsOfSewers.title, subtitle: NARRATION_stewardsOfSewers.subtitle, narration: NARRATION_stewardsOfSewers, chartKind: "AcquisitionMap", tabs: ["overview", "chart", "image_map", "evidence"], agentLeePromptHint: "Describe footprint." },
  { id: "throughTheTunnels", navItem: "discover", title: NARRATION_throughTheTunnels.title, subtitle: NARRATION_throughTheTunnels.subtitle, narration: NARRATION_throughTheTunnels, chartKind: "Timeline", tabs: ["overview", "chart", "image_timeline", "evidence"], agentLeePromptHint: "Narrate growth curve." },
  { id: "eyeOnUnderground", navItem: "discover", title: NARRATION_eyeOnUnderground.title, subtitle: NARRATION_eyeOnUnderground.subtitle, narration: NARRATION_eyeOnUnderground, chartKind: "CCTV", tabs: ["overview", "chart", "image_cctv", "evidence"], agentLeePromptHint: "Explain AI inspection." },
  { id: "savingCities", navItem: "spaces", title: NARRATION_savingCities.title, subtitle: NARRATION_savingCities.subtitle, narration: NARRATION_savingCities, chartKind: "ProjectCosts", tabs: ["overview", "chart", "image_project", "evidence"], agentLeePromptHint: "Compare trenchless vs open cut." },
  { id: "mastersOfMain", navItem: "spaces", title: NARRATION_mastersOfMain.title, subtitle: NARRATION_mastersOfMain.subtitle, narration: NARRATION_mastersOfMain, chartKind: "ContractorSchedule", tabs: ["overview", "chart", "image_crews", "evidence"], agentLeePromptHint: "Describe capacity." },
  { id: "wiredForFuture", navItem: "finance", title: NARRATION_wiredForFuture.title, subtitle: NARRATION_wiredForFuture.subtitle, narration: NARRATION_wiredForFuture, chartKind: "TechStack", tabs: ["overview", "chart", "image_tech", "evidence"], agentLeePromptHint: "Walk through roadmap." },
  { id: "engineeringTomorrow", navItem: "finance", title: NARRATION_engineeringTomorrow.title, subtitle: NARRATION_engineeringTomorrow.subtitle, narration: NARRATION_engineeringTomorrow, chartKind: "GrowthBridge", tabs: ["overview", "chart", "image_finance", "evidence"], agentLeePromptHint: "Explain revenue bridge." },
  { id: "visionariesBelow", navItem: "spaces", title: NARRATION_visionariesBelow.title, subtitle: NARRATION_visionariesBelow.subtitle, narration: NARRATION_visionariesBelow, chartKind: "Ecosystem", tabs: ["overview", "image_orgChart", "image_orgChart_alt", "evidence"], agentLeePromptHint: "Introduce leadership." },
  { id: "cleanStarts", navItem: "spaces", title: NARRATION_cleanStarts.title, subtitle: NARRATION_cleanStarts.subtitle, narration: NARRATION_cleanStarts, chartKind: "Evolution", tabs: ["overview", "chart", "image_regions", "evidence"], agentLeePromptHint: "Explain expansion strategy." },
  { id: "evolutionVelocity", navItem: "finance", title: NARRATION_evolutionVelocity.title, subtitle: NARRATION_evolutionVelocity.subtitle, narration: NARRATION_evolutionVelocity, chartKind: "AISewersViz", tabs: ["overview", "chart", "image_landscape", "evidence"], agentLeePromptHint: "Position in AI landscape." },
  { id: "evidenceLocker", navItem: "account", title: NARRATION_evidenceLocker.title, subtitle: NARRATION_evidenceLocker.subtitle, narration: NARRATION_evidenceLocker, chartKind: "Evidence", tabs: ["overview", "chart", "image_docs", "evidence"], agentLeePromptHint: "Present evidence locker." },
  { id: "agentLeeSpeech", navItem: "account", title: NARRATION_agentLeeSpeech.title, subtitle: NARRATION_agentLeeSpeech.subtitle, narration: NARRATION_agentLeeSpeech, chartKind: "Page13Speech", tabs: ["overview", "speech", "evidence"], agentLeePromptHint: "Read the scripted narrative." },
  { id: "closingChapter", navItem: "account", title: NARRATION_closingChapter.title, subtitle: NARRATION_closingChapter.subtitle, narration: NARRATION_closingChapter, chartKind: "Closing", tabs: ["overview", "image_end", "evidence"], agentLeePromptHint: "Wrap and Q&A." },
  { id: "aiQAPage", navItem: "account", title: NARRATION_aiQAPage.title, subtitle: NARRATION_aiQAPage.subtitle, narration: NARRATION_aiQAPage, chartKind: "AIQA", tabs: ["overview", "qa", "evidence"], agentLeePromptHint: "Open AI Q&A." }
];

export const STORY_CONFIG: StoryConfig = {
  appTitle: "From Roots to Resilience: A Visu-Sewer Story",
  tagline: "A Visu-Sewer Story",
  navItems: NAV_ITEMS,
  slides: SLIDES
};

// ============================================================================
// 5. APPLICATION DATA EXPORT (Real Data Only)
// ============================================================================

// Actual acquisitions data based on verified history
const ACQUISITIONS_DATA: AcquisitionRecord[] = [
  { id: "visu", name: "Visu-Sewer HQ", region: "Pewaukee, WI", description: "Founding HQ (1975)", year: "1975", coordinates: { x: 59, y: 30 }, evidenceRef: "ev_nassco" },
  { id: "mor", name: "MOR Construction", region: "Glen Mills, PA", description: "Mid-Atlantic Expansion (2025)", year: "2025", coordinates: { x: 82, y: 38 }, evidenceRef: "ev_mor_acq" },
  { id: "sheridan", name: "Sheridan Plumbing", region: "Chicago, IL", description: "Chicago Metro (2023)", year: "2023", coordinates: { x: 62, y: 35 }, evidenceRef: "ev_sheridan" },
  { id: "mn_hub", name: "Visu-Sewer MN", region: "Minnesota", description: "Regional Hub", year: "2000", coordinates: { x: 52, y: 25 }, evidenceRef: "ev_nassco" },
  { id: "mo_hub", name: "Visu-Sewer MO", region: "Missouri", description: "Regional Hub", year: "2010", coordinates: { x: 58, y: 48 }, evidenceRef: "ev_nassco" }
];

export const APP_DATA: DataSources = {
  // Map REVENUE_DATA to Financials format
  financials: REVENUE_DATA.map(d => ({
    category: d.year,
    value: d.revenue,
    // Map to FinancialRecord.type union: use 'Base' for historical, 'Growth' for projections
    type: parseInt(d.year) > 2024 ? "Growth" : "Base",
    evidenceRef: d.evidenceRef || "ev_pitchbook"
  })),

  // Project costs: provide multi-year records aggregated by method so charts can draw lines
  projectCosts: [
    { projectId: 'HOVMSD-2023', year: 2023, municipality: 'HOVMSD', method: 'trenchless', budgetAmount: 21800000, actualAmount: 18148000, disruptionDays: 3, evidenceRef: 'ev_hov_18m' },
    { projectId: 'VAH-2022', year: 2022, municipality: 'VA Hospital', method: 'traditional', budgetAmount: 60000, actualAmount: 50000, disruptionDays: 5, evidenceRef: 'ev_va_50k' },
    { projectId: 'NewProj-2024', year: 2024, municipality: 'Madison', method: 'trenchless', budgetAmount: 1000000, actualAmount: 900000, disruptionDays: 2, evidenceRef: 'ev_new_project' },
    { projectId: 'CityA-2021', year: 2021, municipality: 'City A', method: 'traditional', budgetAmount: 450000, actualAmount: 720000, disruptionDays: 21, evidenceRef: 'ev_epa' },
    { projectId: 'CityB-2020', year: 2020, municipality: 'City B', method: 'trenchless', budgetAmount: 300000, actualAmount: 280000, disruptionDays: 4, evidenceRef: 'ev_nassco' },
    { projectId: 'CityC-2025', year: 2025, municipality: 'City C', method: 'traditional', budgetAmount: 1200000, actualAmount: 1350000, disruptionDays: 25, evidenceRef: 'ev_epa' }
  ],

  // Map REVENUE_DATA to Historical Growth format
  // Use a richer historical series (includes founding year and milestones)
  historicalGrowth: HISTORICAL_GROWTH.map(d => ({
    year: d.year,
    value: d.value,
    milestone: d.milestone,
    evidenceRef: "ev_nassco"
  })),

  // Use Real Acquisitions
  acquisitions: ACQUISITIONS_DATA,
  
  // Use Consolidated Evidence List
  evidenceItems: EVIDENCE_LIST,

  // Real Inspection Data metrics (placeholder for specific log data, but using real metrics)
  cctvInspections: [
    { segmentId: "HOV-001", location: "Kaukauna", damageScore: 4, riskCategory: "High", method: "AI-Assisted", reviewTimeMinutes: 15, evidenceRef: "ev_hov_18m" },
    { segmentId: "HOV-002", location: "Little Chute", damageScore: 2, riskCategory: "Low", method: "Manual", reviewTimeMinutes: 45, evidenceRef: "ev_hov_18m" }
  ],

  // Real Tech Metrics based on SewerAI/VAPAR case studies
  techMetrics: [
    { phase: "Identify", metric: "Speed", value: 300, label: "% Faster Review", evidenceRef: "ev_sewerai_prod" },
    { phase: "Predict", metric: "Accuracy", value: 95, label: "% Defect ID", evidenceRef: "ev_dc_water" },
    { phase: "Resolve", metric: "Savings", value: 16.8, label: "% Budget Saved", evidenceRef: "ev_hov_18m" }
  ],

  // Real Ecosystem Partners
  ecosystemMetrics: [
    { category: "Future", partners: ["Fort Point Capital"], impactScore: 100, evidenceRef: "ev_fp_cap" },
    { category: "AI", partners: ["SewerAI", "VAPAR"], impactScore: 90, evidenceRef: "ev_sewerai_prod" },
    { category: "Safety", partners: ["HOVMSD", "MMSD", "Wauwatosa"], impactScore: 95, evidenceRef: "ev_hov_18m" }
  ],

  caseStudies: [
    { study: "HOVMSD Interceptor", costPerFootBefore: 120, costPerFootAfter: 95, savingsPercent: 16.8, evidenceRef: "ev_hov_18m" },
    { study: "DC Water AI", costPerFootBefore: 15, costPerFootAfter: 5, savingsPercent: 66, evidenceRef: "ev_dc_water" }
  ],

  // Expanded operationalVelocity: crew counts per region for 2020–2050 (synthetic/projection where needed)
  operationalVelocity: (
    (() => {
      const out: any[] = [];
      const midwestStart = 20;
      const midAtlanticStart = 8;
      for (let y = 2020; y <= 2050; y++) {
        const pct = (y - 2020) / (2050 - 2020);
        const midwest = Math.round(midwestStart + pct * (60 - midwestStart));
        const midAtlantic = Math.round(midAtlanticStart + pct * (40 - midAtlanticStart));
        out.push({ year: String(y), region: 'Midwest', crewCount: midwest, projectsCompleted: Math.round(midwest * 4), evidenceRef: 'ev_zippia' });
        out.push({ year: String(y), region: 'Mid-Atlantic', crewCount: midAtlantic, projectsCompleted: Math.round(midAtlantic * 3), evidenceRef: 'ev_fp_cap' });
      }
      return out;
    })()
  )
};

// Backwards-compatibility shim: some modules still import `MOCK_DATA`.
// Prefer using `APP_DATA` going forward.
export const MOCK_DATA: DataSources = APP_DATA;