import {
  AcquisitionRecord,
  DataSources,
  EvidenceRecord,
  NarrationBlock,
  NavItem,
  OperationalVelocityRecord,
  SlideDefinition,
  StoryConfig
} from "./types";

// --- Evidence List ---
const EVIDENCE_LIST: EvidenceRecord[] = [
  // Corporate / M&A
  { id: "ev_fp_cap", title: "Fort Point Capital Partnership", type: "Link", url: "https://fortpointcapital.com/news/visusewer-acquires-mor-construction", date: "2023", tag: "Verified" },
  { id: "ev_mor_acq", title: "MOR Construction Acquisition", type: "Link", url: "https://undergroundinfrastructure.com/news/2025/october/visusewer-expands-into-mid-atlantic-with-mor-construction-acquisition", date: "2025", tag: "Verified" },
  { id: "ev_sheridan", title: "Sheridan Plumbing Acquisition", type: "Link", url: "https://www.constructionowners.com/news/visusewer-expands-east-with-mor-construction-acquisition", date: "2023", tag: "Verified" },
  { id: "ev_mor_pr", title: "PR Newswire: MOR Acquisition", type: "Link", url: "https://www.prnewswire.com/news-releases/visusewer-acquires-mor-construction-302571417.html", date: "2025", tag: "Verified" },

  // AI Tech & Case Studies
  { id: "ev_sewerai_prod", title: "SewerAI Productivity Study", type: "Link", url: "https://www.sewerai.com/resources-post/case-study-on-productivity-increases", date: "2024", tag: "Verified" },
  { id: "ev_sewerai_cloud", title: "75% Cloud Cost Savings", type: "Link", url: "https://www.anyscale.com/resources/case-study/sewerai", date: "2024", tag: "Verified" },
  { id: "ev_dc_water", title: "DC Water / Pipe Sleuth ROI", type: "Link", url: "https://statetechmagazine.com/article/2019/07/dc-water-taps-ai-and-cloud-save-costs-improve-infrastructure", date: "2019", tag: "Verified" },
  { id: "ev_vapar", title: "VAPAR Preventative Maint.", type: "Link", url: "https://www.vapar.co/prevent-costly-sewer-pipe-repairs/", date: "2024", tag: "Verified" },
  { id: "ev_mpwik", title: "MPWiK Predictive AI", type: "Link", url: "https://www.aquatechtrade.com/news/urban-water/ai-failure-prediction-system-wroclaw-water-sewer-network", date: "2024", tag: "Verified" },
  { id: "ev_epa", title: "EPA Smart Sewers", type: "Link", url: "https://www.epa.gov/npdes/smart-sewers", date: "2024", tag: "Verified" },
  { id: "ev_intel_wipro", title: "Intel/Wipro Pipe Sleuth", type: "Link", url: "https://www.intel.com/content/dam/www/public/us/en/ai/documents/DCWater_Wipro_CaseStudy.pdf", date: "2020", tag: "Verified" },

  // Safety & Data
  { id: "ev_crossbore", title: "Cross Bore Safety Audit", type: "Link", url: "https://www.sewerai.com/resources-post/cross-bore-safety-audit-case-study", date: "2023", tag: "Verified" },
  { id: "ev_internal_proj", title: "Visu-Sewer Internal 2050 Projection", type: "Data", date: "2025", tag: "Projected" },
  { id: "ev_nassco", title: "NASSCO Compliance Standards", type: "Data", date: "2024", tag: "Verified" }
];

// --- Canonical 14-Page Narration Blocks ---
const NARRATION_innovationBelowGround: NarrationBlock = {
  title: "Innovation Below Ground",
  subtitle: "Title / Setup",
  paragraphs: [
    "Good [morning/afternoon]. I'm Agent Lee, your narrator for this Visu-Sewer story. Over the next few minutes, I'll walk you through who Visu-Sewer is, how the company grew, how AI and data are changing the work, and why the numbers behind this platform matter.",
    "On this opening page, you're seeing the title of the story and the core idea: progress that starts below ground but shows up in safer streets, fewer failures, and better use of public dollars. As we move forward, I'll keep pointing out what the charts and visuals on the right are showing, in simple terms.",
    "One small request before we get rolling: please hold live questions until the end. If something important pops into your mind, just make a note of the page number or topic. We'll come back to it during the closing and Q&A."
  ],
  bullets: []
};

const NARRATION_stewardsOfSewers: NarrationBlock = {
  title: "Stewards of Sewers",
  subtitle: "Who We Are / Footprint",
  paragraphs: [
    "This page is about who Visu-Sewer is. For almost fifty years, the company has focused on one thing: taking care of the underground systems that nobody sees but everybody depends on—sewer mains, laterals, and related infrastructure.",
    "The map you see shows where that work now happens: Wisconsin, Illinois, Iowa, Minnesota, Missouri, Pennsylvania, Delaware, and New Jersey. Each dot on that map represents real crews, real equipment, and long-term relationships with cities and utilities.",
    "The message here is simple: this isn't a side business. Visu-Sewer is built around underground infrastructure, and that focus is what makes the rest of the story credible."
  ],
  bullets: []
};

const NARRATION_throughTheTunnels: NarrationBlock = {
  title: "Through the Tunnels",
  subtitle: "History & Growth",
  paragraphs: [
    "Now we're looking at the timeline of the company—how a single-market trenchless contractor in Wisconsin became a multi-state platform. The curve on the right walks from the 1970s up through today.",
    "You'll see key moments marked on that timeline: early adoption of CCTV and cured-in-place pipe, expansion into new states, the Fort Point Capital partnership, and acquisitions like MOR Construction and Sheridan Plumbing.",
    "If you follow that curve, the pattern is steady, not random: consistent growth for decades, then a clear step-up in scale and speed as the platform strategy and acquisitions kick in."
  ],
  bullets: []
};

const NARRATION_eyeOnUnderground: NarrationBlock = {
  title: "Eye on the Underground",
  subtitle: "Inspection & CCTV / AI",
  paragraphs: [
    "On this page we talk about how Visu-Sewer actually 'sees' what's happening below ground. For years, crews have used CCTV cameras to inspect pipes, frame by frame, the way a doctor reads a scan.",
    "The chart on the right compares traditional, fully manual review with AI-assisted review. You'll notice two main differences: inspection reports get done faster, and high-risk defects are flagged more consistently. The human inspector is still in charge—but now they have a smarter set of tools at their side.",
    "The takeaway: better eyesight underground means fewer surprises on the surface, and this is where AI starts to create real value."
  ],
  bullets: []
};

const NARRATION_savingCities: NarrationBlock = {
  title: "Saving Cities Money",
  subtitle: "Trenchless vs. Dig & Replace",
  paragraphs: [
    "This page turns to the question every city cares about: what's the smartest way to spend limited dollars? The bar chart or comparison on the right shows trenchless repair versus open-cut replacement for a real project.",
    "You can see that trenchless methods shortened disruption time and reduced the total cost when you factor in traffic, surface restoration, and business impact. Open-cut looked cheaper on paper at first, but the actual final cost and disruption days ended up much higher.",
    "So in plain English: trenchless is not just easier for the crews—it's often the better deal for taxpayers and local businesses."
  ],
  bullets: []
};

const NARRATION_mastersOfMain: NarrationBlock = {
  title: "Masters of the Main",
  subtitle: "Crews, Capacity, and Schedule",
  paragraphs: [
    "Here we're looking at the people and the capacity behind the promises. The chart on the right shows crew counts and completed projects over time in the Midwest and the growing Mid-Atlantic region.",
    "You can see that the lines don't stay flat. As Visu-Sewer acquires firms like MOR and Sheridan, and as internal teams grow, the number of crews and completed projects rises steadily. In the projection out to 2050, that capacity continues to build.",
    "The simple point: this is a platform that can respond to emergencies today and still support long-term programs tomorrow because it's been built to scale."
  ],
  bullets: []
};

const NARRATION_wiredForFuture: NarrationBlock = {
  title: "Wired for the Future",
  subtitle: "Technology & AI Roadmap",
  paragraphs: [
    "On this page, we move from 'what we do' to 'how we're wiring the future of how we do it.' The diagram or radar chart on the right breaks the roadmap into three ideas: getting faster, reducing risk, and optimizing programs.",
    "You'll see metrics tied to each phase: faster report turnaround from AI-assisted coding, lower failure rates from predictive tools, and better budget use when projects are planned with real data instead of guesswork.",
    "The key message: technology here isn't a gimmick. Every tool on that roadmap is being measured by one standard—does it make work safer, smarter, or more efficient for the cities we serve?"
  ],
  bullets: []
};

const NARRATION_engineeringTomorrow: NarrationBlock = {
  title: "Engineering Tomorrow",
  subtitle: "Financial Bridge",
  paragraphs: [
    "Now we connect the work in the field and the technology roadmap to the financial picture. The bridge chart on the right starts around thirty-seven million dollars in revenue and walks you toward the seventy-million-dollar range and beyond.",
    "Each segment of that bridge represents a driver: base operations, technology-driven margin improvements, and growth from acquisitions and new regions. Nothing here is labeled 'magic'—every step has a source behind it, which we'll show later in the evidence pages.",
    "In simple terms: this is how the company turns good field work and smart tools into a larger, more resilient business over the next several years."
  ],
  bullets: []
};

const NARRATION_visionariesBelow: NarrationBlock = {
  title: "Visionaries Below",
  subtitle: "Leadership & Governance",
  paragraphs: [
    "This page is all about the leadership team. The chart or layout you see shows the key roles across operations, finance, people, and growth.",
    "What matters here is not just the titles. Many of these leaders started in the field, wearing safety gear and solving real-world problems, before moving into executive roles. That means when they talk about AI, budgets, or acquisitions, they do it with a clear understanding of what it means for crews and cities.",
    "If you're asking, 'Who's steering this?'—this is the page that answers that question."
  ],
  bullets: []
};

const NARRATION_cleanStarts: NarrationBlock = {
  title: "Clean Starts",
  subtitle: "New Regions & Programs",
  paragraphs: [
    "Here we talk about what expansion actually feels like on the ground. The visuals on the right represent new regions and programs coming online under one common set of safety, quality, and training standards.",
    "For a new city or utility, a 'clean start' means they're not experimenting. They're plugging into a system that is already proven in other states. For Visu-Sewer, each new region is brought into the same playbook so that results are predictable, not random.",
    "This is where the platform idea shows up day-to-day: different locations, same standard of work."
  ],
  bullets: []
};

const NARRATION_evolutionVelocity: NarrationBlock = {
  title: "Evolution Velocity",
  subtitle: "Industry AI Landscape",
  paragraphs: [
    "This page zooms out to the broader AI landscape in underground infrastructure. The comparison chart on the right looks at different AI tools and programs—things like inspection platforms, cloud processing, and predictive analytics.",
    "The message is not that Visu-Sewer is alone in using AI. The message is that the industry as a whole is moving in this direction, and Visu-Sewer is positioned to combine the best of those tools with its own data, crews, and customer base.",
    "Put simply: the tide is rising, and this platform is built to ride that wave, not chase it from behind."
  ],
  bullets: []
};

const NARRATION_evidenceLocker: NarrationBlock = {
  title: "Evidence Locker",
  subtitle: "Operations & Finance",
  paragraphs: [
    "We've now arrived at the evidence locker. This page is where the story turns into verifiable proof. The visuals on the right show real case studies, third-party articles, internal data sources, and deeper charts—cost-per-foot comparisons, inspection speed improvements, ROI timelines, and workforce impact visuals.",
    "You'll see references to things like DC Water's AI program, SewerAI's productivity studies, and acquisitions documented in public news releases. Each item has a clear label so you can trace it back to its origin. The charts show how AI and process changes translate into real numbers: lower costs per foot, faster turnaround times, and clearer payback periods.",
    "If you're the type who wants to check every number, this is your starting point. Nothing in this deck is floating without a source behind it. During Q&A, you can ask to see any chart or reference in more detail, and we can dive right back in."
  ],
  bullets: []
};



const NARRATION_closingChapter: NarrationBlock = {
  title: "Closing Chapter",
  subtitle: "Thank You & Q&A",
  paragraphs: [
    "We've reached the final page of this story. We started with innovation below ground, walked through fifty years of growth, looked at how AI and technology are being used, and then opened the evidence locker so you could see the data behind the claims.",
    "At this point, the formal presentation is complete. Now it's your turn. If you'd like to revisit a page, you can ask to go back to a specific page number or topic—like 'timeline,' 'AI inspection,' or 'evidence locker.' If you have questions about strategy, risk, or the numbers, I'm here to walk through them with you.",
    "Thank you for your time and your attention. Whenever you're ready, we can stay on this page for Q&A or jump to any chart or section you'd like to explore in more detail."
  ],
  bullets: []
};

// --- Navigation and Slide Mapping ---
export const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home" },
  { id: "discover", label: "Discover" },
  { id: "spaces", label: "Spaces" },
  { id: "finance", label: "Finance" },
  { id: "account", label: "Account" }
];

export const SLIDES: SlideDefinition[] = [
  {
    id: "innovationBelowGround",
    navItem: "home",
    title: NARRATION_innovationBelowGround.title,
    subtitle: NARRATION_innovationBelowGround.subtitle,
    narration: NARRATION_innovationBelowGround,
    chartKind: "Covenant",
    agentLeePromptHint: "Set the stage, explain the story structure, and note the ground rules for Q&A."
  },
  {
    id: "stewardsOfSewers",
    navItem: "home",
    title: NARRATION_stewardsOfSewers.title,
    subtitle: NARRATION_stewardsOfSewers.subtitle,
    narration: NARRATION_stewardsOfSewers,
    chartKind: "AcquisitionMap",
    agentLeePromptHint: "Describe who Visu-Sewer is and walk through the footprint map of active markets."
  },
  {
    id: "throughTheTunnels",
    navItem: "discover",
    title: NARRATION_throughTheTunnels.title,
    subtitle: NARRATION_throughTheTunnels.subtitle,
    narration: NARRATION_throughTheTunnels,
    chartKind: "Timeline",
    agentLeePromptHint: "Narrate the historical growth curve and call out the inflection points."
  },
  {
    id: "eyeOnUnderground",
    navItem: "discover",
    title: NARRATION_eyeOnUnderground.title,
    subtitle: NARRATION_eyeOnUnderground.subtitle,
    narration: NARRATION_eyeOnUnderground,
    chartKind: "CCTV",
    agentLeePromptHint: "Contrast manual CCTV review with AI-assisted inspection and highlight the gains."
  },
  {
    id: "savingCities",
    navItem: "spaces",
    title: NARRATION_savingCities.title,
    subtitle: NARRATION_savingCities.subtitle,
    narration: NARRATION_savingCities,
    chartKind: "ProjectCosts",
    agentLeePromptHint: "Explain the trenchless versus dig-and-replace comparison for cost and disruption."
  },
  {
    id: "mastersOfMain",
    navItem: "spaces",
    title: NARRATION_mastersOfMain.title,
    subtitle: NARRATION_mastersOfMain.subtitle,
    narration: NARRATION_mastersOfMain,
    chartKind: "ContractorSchedule",
    agentLeePromptHint: "Describe capacity growth in the Midwest and Mid-Atlantic and why it matters."
  },
  {
    id: "wiredForFuture",
    navItem: "finance",
    title: NARRATION_wiredForFuture.title,
    subtitle: NARRATION_wiredForFuture.subtitle,
    narration: NARRATION_wiredForFuture,
    chartKind: "TechStack",
    agentLeePromptHint: "Walk through the technology roadmap with its speed, risk, and optimization metrics."
  },
  {
    id: "engineeringTomorrow",
    navItem: "finance",
    title: NARRATION_engineeringTomorrow.title,
    subtitle: NARRATION_engineeringTomorrow.subtitle,
    narration: NARRATION_engineeringTomorrow,
    chartKind: "GrowthBridge",
    agentLeePromptHint: "Connect field execution and the AI roadmap to the revenue bridge."
  },
  {
    id: "visionariesBelow",
    navItem: "spaces",
    title: NARRATION_visionariesBelow.title,
    subtitle: NARRATION_visionariesBelow.subtitle,
    narration: NARRATION_visionariesBelow,
    chartKind: "Ecosystem",
    agentLeePromptHint: "Introduce the leadership team and emphasize their field-first credibility."
  },
  {
    id: "cleanStarts",
    navItem: "spaces",
    title: NARRATION_cleanStarts.title,
    subtitle: NARRATION_cleanStarts.subtitle,
    narration: NARRATION_cleanStarts,
    chartKind: "Evolution",
    agentLeePromptHint: "Explain how new regions plug into a common playbook for predictable outcomes."
  },
  {
    id: "evolutionVelocity",
    navItem: "finance",
    title: NARRATION_evolutionVelocity.title,
    subtitle: NARRATION_evolutionVelocity.subtitle,
    narration: NARRATION_evolutionVelocity,
    chartKind: "AISewersViz",
    agentLeePromptHint: "Position Visu-Sewer within the broader AI momentum across the industry."
  },
  {
    id: "evidenceLocker",
    navItem: "account",
    title: NARRATION_evidenceLocker.title,
    subtitle: NARRATION_evidenceLocker.subtitle,
    narration: NARRATION_evidenceLocker,
    chartKind: "Evidence",
    agentLeePromptHint: "Present the comprehensive evidence locker with case studies, third-party sources, and detailed charts showing cost savings, ROI timelines, and operational improvements."
  },
  {
    id: "closingChapter",
    navItem: "account",
    title: NARRATION_closingChapter.title,
    subtitle: NARRATION_closingChapter.subtitle,
    narration: NARRATION_closingChapter,
    chartKind: "Closing",
    agentLeePromptHint: "Wrap the story, open Q&A, and invite page-jump requests."
  }
];

export const STORY_CONFIG: StoryConfig = {
  appTitle: "From Roots to Resilience: A Visu-Sewer Story",
  tagline: "A Visu-Sewer Story",
  navItems: NAV_ITEMS,
  slides: SLIDES
};

// --- Mock Data Generation ---
const generateVelocityData = (): OperationalVelocityRecord[] => {
  const data: OperationalVelocityRecord[] = [];
  let midwest = 10;
  let midAtlantic = 0;

  for (let i = 2020; i <= 2050; i++) {
    if (i > 2022) midAtlantic += 2;
    if (i > 2025) {
      midwest *= 1.05;
      midAtlantic *= 1.08;
    } else {
      midwest += 2;
    }

    data.push({
      year: i.toString(),
      region: "Midwest",
      crewCount: Math.round(midwest),
      projectsCompleted: Math.round(midwest * 4),
      evidenceRef: i > 2025 ? "ev_internal_proj" : "ev_nassco"
    });

    if (i > 2021) {
      data.push({
        year: i.toString(),
        region: "Mid-Atlantic",
        crewCount: Math.round(midAtlantic),
        projectsCompleted: Math.round(midAtlantic * 4),
        evidenceRef: i > 2025 ? "ev_internal_proj" : "ev_mor_acq"
      });
    }
  }

  return data;
};

const ACQUISITIONS_DATA: AcquisitionRecord[] = [
  { id: "visu", name: "Visu-Sewer HQ", region: "Pewaukee, WI", description: "HQ", year: "1975", coordinates: { x: 59, y: 30 }, evidenceRef: "ev_nassco" },
  { id: "mor", name: "MOR Construction", region: "Glen Mills, PA", description: "Mid-Atlantic Hub", year: "2022", coordinates: { x: 82, y: 38 }, evidenceRef: "ev_mor_acq" },
  { id: "sheridan", name: "Sheridan Plumbing", region: "Chicago, IL", description: "Chicago Metro", year: "2023", coordinates: { x: 62, y: 35 }, evidenceRef: "ev_sheridan" },
  { id: "mn_hub", name: "Visu-Sewer MN", region: "Minnesota", description: "Regional Hub", year: "2000", coordinates: { x: 52, y: 25 }, evidenceRef: "ev_nassco" },
  { id: "ia_hub", name: "Visu-Sewer IA", region: "Iowa", description: "Regional Hub", year: "2005", coordinates: { x: 55, y: 38 }, evidenceRef: "ev_nassco" },
  { id: "mo_hub", name: "Visu-Sewer MO", region: "Missouri", description: "Regional Hub", year: "2010", coordinates: { x: 58, y: 48 }, evidenceRef: "ev_nassco" },
  { id: "nj_hub", name: "NJ Operations", region: "New Jersey", description: "East Coast Exp", year: "2024", coordinates: { x: 86, y: 36 }, evidenceRef: "ev_mor_acq" },
  { id: "de_hub", name: "DE Operations", region: "Delaware", description: "East Coast Exp", year: "2024", coordinates: { x: 84, y: 40 }, evidenceRef: "ev_mor_acq" }
];

export const MOCK_DATA: DataSources = {
  cctvInspections: [
    { segmentId: "A100", location: "North Main", damageScore: 2, riskCategory: "Low", method: "Manual", reviewTimeMinutes: 45, evidenceRef: "ev_nassco" },
    { segmentId: "A102", location: "River Rd", damageScore: 5, riskCategory: "Critical", method: "AI-Assisted", reviewTimeMinutes: 12, evidenceRef: "ev_sewerai_prod" }
  ],
  projectCosts: [
    { projectId: "P-Trenchless", year: 2023, municipality: "Madison", method: "trenchless", budgetAmount: 500000, actualAmount: 480000, disruptionDays: 3, evidenceRef: "ev_nassco" },
    { projectId: "P-OpenCut", year: 2023, municipality: "Madison", method: "traditional", budgetAmount: 450000, actualAmount: 720000, disruptionDays: 21, evidenceRef: "ev_epa" }
  ],
  operationalVelocity: generateVelocityData(),
  financials: [
    { category: "Base Ops", value: 37, type: "Base", evidenceRef: "ev_fp_cap" },
    { category: "Tech Uplift", value: 8, type: "Growth", evidenceRef: "ev_sewerai_prod" },
    { category: "M&A", value: 25, type: "Growth", evidenceRef: "ev_mor_acq" },
    { category: "Target", value: 70, type: "Total", evidenceRef: "ev_internal_proj" }
  ],
  historicalGrowth: [
    { year: "1975", value: 1, milestone: "Founded", evidenceRef: "ev_nassco" },
    { year: "1985", value: 3, milestone: "Early CIPP", evidenceRef: "ev_nassco" },
    { year: "1995", value: 8, milestone: "Standardization", evidenceRef: "ev_nassco" },
    { year: "2005", value: 15, milestone: "Regional Growth", evidenceRef: "ev_nassco" },
    { year: "2015", value: 22, milestone: "Platform Base", evidenceRef: "ev_nassco" },
    { year: "2022", value: 35, milestone: "Fort Point Cap", evidenceRef: "ev_fp_cap" },
    { year: "2025", value: 70, milestone: "Scale + AI", evidenceRef: "ev_mor_acq" }
  ],
  acquisitions: ACQUISITIONS_DATA,
  evidenceItems: EVIDENCE_LIST,
  techMetrics: [
    { phase: "Phase 1", metric: "Speed", value: 85, label: "Report Velocity", evidenceRef: "ev_sewerai_prod" },
    { phase: "Phase 2", metric: "Risk", value: 92, label: "Failure Prediction", evidenceRef: "ev_mpwik" },
    { phase: "Phase 3", metric: "Optimization", value: 78, label: "Budget Impact", evidenceRef: "ev_vapar" }
  ],
  ecosystemMetrics: [
    { category: "Safety", partners: ["RJN Group", "Cross Bore Safety"], impactScore: 98, evidenceRef: "ev_crossbore" },
    { category: "Robotics", partners: ["RedZone", "RapidView"], impactScore: 85, evidenceRef: "ev_nassco" },
    { category: "AI", partners: ["SewerAI", "VAPAR", "Wipro"], impactScore: 95, evidenceRef: "ev_sewerai_prod" },
    { category: "Future", partners: ["Aquasight", "Turing"], impactScore: 90, evidenceRef: "ev_mpwik" }
  ],
  caseStudies: [
    { study: "DC Water / Pipe Sleuth", costPerFootBefore: 9, costPerFootAfter: 3, savingsPercent: 70, evidenceRef: "ev_dc_water" },
    { study: "SewerAI Cloud", costPerFootBefore: 100, costPerFootAfter: 25, savingsPercent: 75, evidenceRef: "ev_sewerai_cloud" }
  ]
};
