/* ============================================================================
LEEWAY HEADER — DO NOT REMOVE
PROFILE: LEEWAY-ORDER
TAG: AI.RETRIEVAL.INDEX.CHARTS
REGION: 🧠 AI

STACK: LANG=ts; FW=none; UI=none; BUILD=node
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
  "name": "Agent Lee Chart Registry",
  "programmingLanguage": "TypeScript",
  "runtimePlatform": "browser",
  "about": ["LEEWAY", "AI", "Charts", "Registry", "Knowledge"],
  "identifier": "AI.RETRIEVAL.INDEX.CHARTS",
  "license": "MIT",
  "dateModified": "2025-12-09"
}

5WH: WHAT=Structured chart data per slide and context helpers for Agent Lee; WHY=Provide structured knowledge for precise chart answers; WHO=Leeway Industries; WHERE=/services/AgentLeeChartRegistry.ts; WHEN=2025-12-09; HOW=TypeScript registry + chart point data + context helpers
SPDX-License-Identifier: MIT
============================================================================ */
// AgentLeeChartRegistry: structured knowledge for charts per slide
// Exposes lightweight chart context + structured data points for precise answers.
import { APP_DATA, STORY_CONFIG } from "../constants";

export type ChartPoint = { x: number | string; y: number; label?: string };
export type ChartSeries = { name: string; points: ChartPoint[] };
export type ChartKnowledge = {
  id: string;
  title: string;
  description?: string;
  axes?: { x?: string; y?: string; unitY?: string };
  series: ChartSeries[];
  key_points?: { label: string; x: number | string; y: number; takeaway?: string }[];
};

type SlideCharts = Record<string, ChartKnowledge>;

const REGISTRY: Record<string, SlideCharts> = {
  // mastersOfMain (crew capacity / contractor schedule)
  mastersOfMain: {
    crewCapacity: {
      id: 'crewCapacity',
      title: 'Velocity: Crew Capacity (2020–2050)',
      description: 'Projected crew capacity growth as the platform scales nationally.',
      axes: { x: 'Year', y: 'Crew Capacity', unitY: 'crews' },
      series: [
        {
          name: 'Mid-Atlantic Capacity',
          points: [
            { x: 2020, y: 20 },
            { x: 2025, y: 45 },
            { x: 2030, y: 90 },
            { x: 2035, y: 160 },
            { x: 2040, y: 230 },
            { x: 2045, y: 300 },
            { x: 2050, y: 380 }
          ]
        },
        {
          name: 'Midwest Capacity',
          points: [
            { x: 2020, y: 15 },
            { x: 2025, y: 28 },
            { x: 2030, y: 50 },
            { x: 2035, y: 70 },
            { x: 2040, y: 95 },
            { x: 2045, y: 120 },
            { x: 2050, y: 150 }
          ]
        }
      ],
      key_points: [
        { label: 'Inflection ~2035', x: 2035, y: 160, takeaway: 'Mid-Atlantic capacity roughly doubles from 2030 to 2035.' },
        { label: 'Target 2050', x: 2050, y: 380, takeaway: 'Long-run capacity goal as the platform scales.' }
      ]
    }
    ,
    contractorSchedule: {
      id: 'contractorSchedule',
      title: 'Contractor Schedule Progress',
      description: 'Percent complete over time (fallback when CSV not yet loaded).',
      axes: { x: 'Date', y: '% Complete', unitY: '%' },
      series: [
        { name: 'Progress', points: [
          { x: '2025-01', y: 5 },
          { x: '2025-03', y: 18 },
          { x: '2025-06', y: 42 },
          { x: '2025-09', y: 67 },
          { x: '2025-12', y: 85 }
        ]}
      ],
      key_points: [
        { label: 'Mid-year ramp', x: '2025-06', y: 42, takeaway: 'Schedule acceleration with added crews.' }
      ]
    }
  },
  // engineeringTomorrow (financial bridge)
  engineeringTomorrow: {
    pathTo70M: {
      id: 'pathTo70M',
      title: 'Financial Bridge: Path to $70M',
      description: 'Bridge components from current base to target, including organic growth and M&A.',
      axes: { x: 'Component', y: 'Revenue', unitY: 'USD (M)' },
      series: [
        {
          name: 'Bridge Components',
          points: [
            { x: 'Base', y: 37 },
            { x: 'Organic', y: 12 },
            { x: 'Tech/Productivity', y: 6 },
            { x: 'M&A', y: 15 }
          ]
        }
      ],
      key_points: [
        { label: 'Base', x: 'Base', y: 37 },
        { label: 'Target', x: 'Total', y: 70, takeaway: 'Sum of components reaches $70M.' }
      ]
    },
    growthBridge: {
      id: 'growthBridge',
      title: 'Financial Bridge: Path to $70M',
      description: 'Alias of pathTo70M for slide chartKind alignment.',
      axes: { x: 'Component', y: 'Revenue', unitY: 'USD (M)' },
      series: [
        {
          name: 'Bridge Components',
          points: [
            { x: 'Base', y: 37 },
            { x: 'Organic', y: 12 },
            { x: 'Tech/Productivity', y: 6 },
            { x: 'M&A', y: 15 }
          ]
        }
      ],
      key_points: [
        { label: 'Base', x: 'Base', y: 37 },
        { label: 'Target', x: 'Total', y: 70, takeaway: 'Sum of components reaches $70M.' }
      ]
    }
  },
  // innovationBelowGround (Covenant) — stub
  innovationBelowGround: {
    covenant: {
      id: 'covenant',
      title: 'Safety Covenant Overview',
      description: 'Principles that govern trenchless operations and risk mitigation.',
      axes: { x: 'Principle', y: 'Emphasis' },
      series: [{ name: 'Emphasis', points: [] }],
      key_points: []
    }
  },
  // stewardsOfSewers (AcquisitionMap) — stub
  stewardsOfSewers: {
    acquisitionMap: {
      id: 'acquisitionMap',
      title: 'Footprint & Acquisitions Map',
      description: 'Geographic expansion across regions and major acquisitions.',
      axes: { x: 'Region', y: 'Sites' },
      series: [{ name: 'Locations', points: [
        { x: 'Midwest', y: 1, label: 'Core platform' },
        { x: 'Mid-Atlantic', y: 1, label: 'Entry via MOR (PA/DE/NJ)' }
      ] }],
      key_points: [
        { label: 'Platform base', x: 'Midwest', y: 1 },
        { label: 'New region', x: 'Mid-Atlantic', y: 1 }
      ]
    }
  },
  // throughTheTunnels (Timeline) — stub
  throughTheTunnels: {
    timeline: {
      id: 'timeline',
      title: 'Historical Growth Timeline',
      description: 'Milestones and inflection points in company growth.',
      axes: { x: 'Year', y: 'Milestones' },
      series: [{ name: 'Events', points: [
        { x: 1975, y: 1, label: 'Founded in Pewaukee, WI' },
        { x: 1990, y: 2, label: 'Early CCTV + hydro-jet adoption' },
        { x: 2005, y: 3, label: 'Expanded trenchless rehab platform' },
        { x: 2023, y: 4, label: 'Municipal momentum (HOVMSD award context)' },
        { x: 2025, y: 5, label: 'MOR acquisition expands into PA/DE/NJ' }
      ] }],
      key_points: [
        { label: 'Founding', x: 1975, y: 1 },
        { label: 'Mid-Atlantic Entry', x: 2025, y: 5, takeaway: 'Platform expansion into three new states.' }
      ]
    }
  },
  // eyeOnUnderground (CCTV)
  eyeOnUnderground: {
    cctv: {
      id: 'cctv',
      title: 'CCTV Inspection Improvements',
      description: 'Manual vs AI-assisted review efficiency and accuracy.',
      axes: { x: 'Segment', y: 'Time / Score' },
      series: [{ name: 'Inspection', points: [] }],
      key_points: []
    }
  },
  // savingCities (ProjectCosts)
  savingCities: {
    projectCosts: {
      id: 'projectCosts',
      title: 'Project Costs: Trenchless vs Traditional',
      description: 'Cost and disruption comparisons by method.',
      axes: { x: 'Year/Project', y: 'Cost' },
      series: [{ name: 'Cost', points: [] }],
      key_points: []
    }
  },
  // wiredForFuture (TechStack) — stub
  wiredForFuture: {
    techStack: {
      id: 'techStack',
      title: 'Technology Roadmap',
      description: 'Speed, risk, and optimization metrics over time.',
      axes: { x: 'Phase', y: 'Impact' },
      series: [{ name: 'Roadmap', points: [] }],
      key_points: []
    }
  },
  // visionariesBelow (Ecosystem) — stub
  visionariesBelow: {
    ecosystem: {
      id: 'ecosystem',
      title: 'Leadership Ecosystem',
      description: 'Team composition and capability areas.',
      axes: { x: 'Capability', y: 'Depth' },
      series: [{ name: 'Leaders', points: [] }],
      key_points: []
    }
  },
  // cleanStarts (Evolution) — stub
  cleanStarts: {
    evolution: {
      id: 'evolution',
      title: 'Regional Expansion Playbook',
      description: 'Stages as new regions plug into the platform.',
      axes: { x: 'Stage', y: 'Maturity' },
      series: [{ name: 'Stages', points: [] }],
      key_points: []
    }
  },
  // evolutionVelocity (AISewersViz) — stub
  evolutionVelocity: {
    aiSewersViz: {
      id: 'aiSewersViz',
      title: 'AI Momentum in Sewers',
      description: 'AI adoption, cost savings, and workforce impact over time.',
      axes: { x: 'Phase / Year', y: 'Impact Index', unitY: 'index (0–100)' },
      series: [
        {
          name: 'AI Adoption Index',
          points: [
            { x: 'Phase 1', y: 45, label: 'Early pilots (SewerAI / VAPAR)' },
            { x: 'Phase 2', y: 72, label: 'Production CCTV AI in core regions' },
            { x: 'Phase 3', y: 88, label: 'Predictive models across platform' }
          ]
        },
        {
          name: 'Workforce Productivity Index',
          points: [
            { x: 'Phase 1', y: 55, label: 'Report velocity uplift' },
            { x: 'Phase 2', y: 78, label: 'Fewer hours per foot inspected' },
            { x: 'Phase 3', y: 90, label: 'Crews focused on highest‑value work' }
          ]
        },
        {
          name: 'Cost Savings Index',
          points: [
            { x: 'Phase 1', y: 40, label: 'DC Water / Pipe Sleuth baseline' },
            { x: 'Phase 2', y: 70, label: '70%+ inspection savings (DC Water)' },
            { x: 'Phase 3', y: 75, label: '75%+ cloud savings (SewerAI cloud)' }
          ]
        }
      ],
      key_points: [
        { label: 'AI in production', x: 'Phase 2', y: 72, takeaway: 'AI is running live in CCTV and rehab decisions.' },
        { label: 'Workforce leverage', x: 'Phase 3', y: 90, takeaway: 'Crews shift from low‑value review to high‑value field work.' },
        { label: 'ROI proof points', x: 'Phase 3', y: 75, takeaway: 'Case studies show 70–75% cost savings per foot inspected.' }
      ]
    }
  },
  // evidenceLocker (Evidence) — stub
  evidenceLocker: {
    evidence: {
      id: 'evidence',
      title: 'Evidence Locker Overview',
      description: 'Catalog of documents and datasets.',
      axes: { x: 'Type', y: 'Count' },
      series: [{ name: 'Items', points: [] }],
      key_points: []
    }
  },
  // closingChapter (Closing) — stub
  closingChapter: {
    closing: {
      id: 'closing',
      title: 'Closing: Commitment & Road Ahead',
      description: 'Wrap-up indicators and next steps.',
      axes: { x: 'Theme', y: 'Emphasis' },
      series: [{ name: 'Signals', points: [] }],
      key_points: []
    }
  }
};

function normalizeId(value: any): string {
  return String(value || '').replace(/\s+/g, '').replace(/[^A-Za-z0-9_-]/g, '');
}

function resolveSlideKey(idOrTitle: string): string | null {
  const raw = normalizeId(idOrTitle);
  const needle = raw.toLowerCase();
  // Prefer exact mapping from STORY_CONFIG for zero ambiguity
  try {
    const slides = Array.isArray(STORY_CONFIG?.slides) ? STORY_CONFIG.slides : [];
    const byId = new Map<string, string>();
    const byTitle = new Map<string, string>();
    slides.forEach(s => {
      const id = String(s.id);
      byId.set(normalizeId(id).toLowerCase(), id);
      byTitle.set(normalizeId(String(s.title)).toLowerCase(), id);
    });
    if (byId.has(needle)) return byId.get(needle)!;
    if (byTitle.has(needle)) return byTitle.get(needle)!;
  } catch {}
  // Direct hit
  if (REGISTRY[raw]) return raw;
  if (REGISTRY[needle as any]) return needle as any;
  // Title aliases (normalized)
  const TITLE_ALIASES: Record<string, string> = {
    throughthetunnels: 'throughTheTunnels',
    mastersofthemain: 'mastersOfMain',
    engineeringtomorrow: 'engineeringTomorrow',
    eyeonunderground: 'eyeOnUnderground',
    savingcities: 'savingCities',
    wiredforfuture: 'wiredForFuture',
    visionariesbelow: 'visionariesBelow',
    innovationbelowground: 'innovationBelowGround',
    stewardsofsewers: 'stewardsOfSewers',
    evidencelocker: 'evidenceLocker',
    closingchapter: 'closingChapter'
  };
  if (TITLE_ALIASES[needle]) return TITLE_ALIASES[needle];
  // Fallback: fuzzy match by removing case and comparing against keys
  const keys = Object.keys(REGISTRY);
  const match = keys.find(k => k.toLowerCase() === needle);
  return match || null;
}

export const AgentLeeChartRegistry = {
  getChartContextForSlide(idOrTitle: string): string | null {
    const key = resolveSlideKey(idOrTitle) || normalizeId(idOrTitle);
    const charts = REGISTRY[key];
    if (!charts) return null;
    const first = Object.values(charts)[0];
    if (!first) return null;
    const seriesNames = first.series.map(s => s.name).join(', ');
    return `${first.title} — ${first.description || ''} Series: ${seriesNames}.`;
  },
  getChartDataForSlide(idOrTitle: string): ChartKnowledge[] | null {
    const key = resolveSlideKey(idOrTitle) || normalizeId(idOrTitle);
    const charts = REGISTRY[key];
    if (!charts) return null;
    return Object.values(charts);
  }
};

try {
  // expose globally for legacy consumers
  (window as any).AgentLeeChartRegistry = AgentLeeChartRegistry;
} catch {}

// -----------------------------
// Option B: Bootstrap from local CSVs
// -----------------------------

async function fetchText(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}

function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((h, i) => row[h] = (cols[i] ?? '').trim());
    return row;
  });
}

function toNumber(value?: string) {
  const n = Number(String(value || '').replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : NaN;
}

function upsertSlideChart(slideId: string, chartId: string, data: Partial<ChartKnowledge>) {
  const key = normalizeId(slideId);
  REGISTRY[key] = REGISTRY[key] || {};
  const existing = (REGISTRY[key][chartId] as any) || { id: chartId, title: chartId, series: [] };
  REGISTRY[key][chartId] = { ...existing, ...data, id: chartId, series: data.series || existing.series || [] } as ChartKnowledge;
}

async function bootstrapFromLocalCSVs() {
  try {
    const base = (typeof import.meta !== 'undefined' && (import.meta as any).env?.BASE_URL) || '/';
    // Project costs (savingCities)
    try {
      const text = await fetchText(`${base}data/project_costs.csv`);
      const rows = parseCsv(text);
      // Expect columns like: year, method, actualAmount
      const byMethod: Record<string, Record<string, number>> = {};
      rows.forEach(r => {
        const year = (r.year || r.Year || '').trim();
        const method = (r.method || r.Method || '').trim() || 'Unknown';
        const actual = toNumber(r.actualAmount || r.actual || r.Actual || r.amount || r.Amount);
        if (!year || !Number.isFinite(actual)) return;
        byMethod[method] = byMethod[method] || {};
        byMethod[method][year] = (byMethod[method][year] || 0) + (actual as number);
      });
      const series: ChartSeries[] = Object.entries(byMethod).map(([method, byYear]) => ({
        name: method,
        points: Object.entries(byYear).sort((a,b)=>Number(a[0])-Number(b[0])).map(([y,v]) => ({ x: Number(y) || y, y: v as number }))
      }));
      if (series.length) {
        upsertSlideChart('savingCities', 'projectCosts', {
          title: 'Project Costs: Trenchless vs Traditional',
          description: 'Aggregated actual amounts by year and method from project_costs.csv',
          axes: { x: 'Year', y: 'Cost', unitY: 'USD' },
          series
        });
      }
    } catch {}

    // Fallback: Project costs from APP_DATA when CSV missing
    try {
      const pc = Array.isArray((APP_DATA as any)?.projectCosts) ? (APP_DATA as any).projectCosts : [];
      if (pc.length) {
        const byMethod: Record<string, Array<{ x: number | string; y: number }>> = {};
        pc.forEach((r: any) => {
          const yearLabel = r.year ?? r.Year ?? 'Year';
          const method = (r.method || r.Method || 'Unknown') as string;
          const actual = toNumber(String(r.actualAmount ?? r.actual ?? r.Amount ?? r.amount));
          if (!Number.isFinite(actual)) return;
          byMethod[method] = byMethod[method] || [];
          byMethod[method].push({ x: yearLabel, y: actual });
        });
        const series: ChartSeries[] = Object.entries(byMethod).map(([name, pts]) => ({ name, points: pts }));
        if (series.length) {
          upsertSlideChart('savingCities', 'projectCosts', {
            title: 'Project Costs: Trenchless vs Traditional',
            description: 'Cost comparisons by method using APP_DATA.projectCosts',
            axes: { x: 'Year', y: 'Cost', unitY: 'USD' },
            series,
          });
        }
      }
    } catch {}

    // Contractor schedule (mastersOfMain)
    try {
      const text = await fetchText(`${base}data/contractor_schedule.csv`);
      const rows = parseCsv(text);
      // Heuristic: prefer date/year + percent columns
      const dateKey = ['date','Date','year','Year'].find(k => k in (rows[0] || {}));
      const pctKey = ['percent','Percent','percent_complete','PercentComplete','% complete','%'].find(k => k in (rows[0] || {}));
      if (dateKey && pctKey) {
        const pts: ChartPoint[] = rows.map(r => ({ x: r[dateKey!], y: toNumber(r[pctKey!]) || 0 })).filter(p => Number.isFinite(p.y));
        if (pts.length) {
          upsertSlideChart('mastersOfMain', 'contractorSchedule', {
            title: 'Contractor Schedule Progress',
            description: 'Percent complete over time from contractor_schedule.csv',
            axes: { x: 'Date', y: '% Complete', unitY: '%' },
            series: [{ name: 'Progress', points: pts }]
          });
        }
      }
    } catch {}

    // CCTV inspections (eyeOnUnderground) from APP_DATA fallback
    try {
      const inspections = Array.isArray((APP_DATA as any)?.cctvInspections) ? (APP_DATA as any).cctvInspections : [];
      if (inspections.length) {
        const manual = inspections.filter((r: any) => String(r.method).toLowerCase().includes('manual'));
        const ai = inspections.filter((r: any) => String(r.method).toLowerCase().includes('ai'));
        const manualPts = manual.map((r: any) => ({ x: r.segmentId || r.location || 'Segment', y: Number(r.reviewTimeMinutes) || 0, label: `Manual ${r.riskCategory || ''}` }));
        const aiPts = ai.map((r: any) => ({ x: r.segmentId || r.location || 'Segment', y: Number(r.reviewTimeMinutes) || 0, label: `AI ${r.riskCategory || ''}` }));
        const series: ChartSeries[] = [];
        if (manualPts.length) series.push({ name: 'Manual Review Time (min)', points: manualPts });
        if (aiPts.length) series.push({ name: 'AI-Assisted Review Time (min)', points: aiPts });
        if (series.length) {
          upsertSlideChart('eyeOnUnderground', 'cctv', {
            title: 'CCTV Inspection Improvements',
            description: 'Manual vs AI-assisted review efficiency using APP_DATA.cctvInspections',
            axes: { x: 'Segment', y: 'Review Time (min)', unitY: 'min' },
            series,
            key_points: [
              manualPts[0] ? { label: 'Manual baseline', x: manualPts[0].x, y: manualPts[0].y } : undefined,
              aiPts[0] ? { label: 'AI uplift', x: aiPts[0].x, y: aiPts[0].y, takeaway: 'Reduced review time with AI assistance.' } : undefined,
            ].filter(Boolean) as any
          });
        }
      }
    } catch {}
  } catch (e) {
    console.warn('[AgentLeeChartRegistry] CSV bootstrap failed', e);
  }
}

// -----------------------------
// Option C: External enrichment stub
// -----------------------------
export async function enrichFromExternalLinks(links: string[]) {
  // Placeholder: we only attach sources; detailed extraction can be added later.
  try {
    (window as any).AgentLeeChartExternalSources = Array.isArray(links) ? links : [];
  } catch {}
}

// Auto-run local CSV bootstrap
try { bootstrapFromLocalCSVs(); } catch {}

// -----------------------------
// Option D: Bootstrap from in-deck MOCK_DATA (immediate grounding)
// -----------------------------

function upsertMastersOfMainFromMock() {
  try {
    const vel = Array.isArray(APP_DATA.operationalVelocity) ? APP_DATA.operationalVelocity : [];
    if (!vel.length) return;
    const byRegion: Record<string, Array<{ x: number|string; y: number }>> = {};
    for (const r of vel) {
      const key = r.region || 'Region';
      const yearNum = Number(r.year);
      const x = Number.isFinite(yearNum) ? yearNum : r.year;
      byRegion[key] = byRegion[key] || [];
      byRegion[key].push({ x, y: Number(r.crewCount) || 0 });
    }
    const series: ChartSeries[] = Object.entries(byRegion).map(([name, pts]) => ({ name, points: pts.sort((a,b)=>Number(a.x)-Number(b.x)) }));
    upsertSlideChart('mastersOfMain', 'crewCapacity', {
      title: 'Velocity: Crew Capacity (2020–2050)',
      description: 'Derived from operationalVelocity in deck data',
      axes: { x: 'Year', y: 'Crew Capacity', unitY: 'crews' },
      series
    });
  } catch {}
}

function upsertProjectCostsFromMock() {
  try {
    const rows = Array.isArray(APP_DATA.projectCosts) ? APP_DATA.projectCosts : [];
    if (!rows.length) return;
    const byMethod: Record<string, Record<string, number>> = {};
    rows.forEach(r => {
      const year = String(r.year || '').trim();
      const method = String(r.method || 'Unknown').trim();
      const actual = Number(r.actualAmount || 0);
      if (!year || !Number.isFinite(actual)) return;
      byMethod[method] = byMethod[method] || {};
      byMethod[method][year] = (byMethod[method][year] || 0) + actual;
    });
    const series: ChartSeries[] = Object.entries(byMethod).map(([method, byYear]) => ({
      name: method,
      points: Object.entries(byYear).sort((a,b)=>Number(a[0])-Number(b[0])).map(([y,v]) => ({ x: Number(y) || y, y: v as number }))
    }));
    if (series.length) {
      upsertSlideChart('savingCities', 'projectCosts', {
        title: 'Project Costs: Trenchless vs Traditional',
        description: 'Aggregated actual amounts by year and method from deck data',
        axes: { x: 'Year', y: 'Cost', unitY: 'USD' },
        series
      });
    }
  } catch {}
}

function upsertGrowthBridgeFromMock() {
  try {
    const fin = Array.isArray(APP_DATA.financials) ? APP_DATA.financials : [];
    if (!fin.length) return;
    const map: Record<string, number> = {};
    fin.forEach(f => { map[String(f.category)] = Number(f.value) || 0; });
    const pts = [
      { x: 'Base', y: map['Base Ops'] ?? 0 },
      { x: 'Organic', y: map['Tech Uplift'] ?? 0 },
      { x: 'M&A', y: map['M&A'] ?? 0 }
    ];
    upsertSlideChart('engineeringTomorrow', 'growthBridge', {
      title: 'Financial Bridge: Path to $70M',
      description: 'Base + Organic + M&A components from deck financials',
      axes: { x: 'Component', y: 'Revenue', unitY: 'USD (M)' },
      series: [{ name: 'Bridge Components', points: pts }],
      key_points: [ { label: 'Target', x: 'Total', y: Number(map['Target']) || 70, takeaway: 'Sum of components approaches target.' } ]
    });
  } catch {}
}

function upsertTimelineFromMock() {
  try {
    const hist = Array.isArray(APP_DATA.historicalGrowth) ? APP_DATA.historicalGrowth : [];
    if (!hist.length) return;
    const pts = hist.map(h => ({ x: Number(h.year) || h.year, y: Number(h.value) || 0 }));
    upsertSlideChart('throughTheTunnels', 'timeline', {
      title: 'Historical Growth Timeline',
      description: 'Milestones and value trajectory',
      axes: { x: 'Year', y: 'Index' },
      series: [{ name: 'Growth', points: pts }]
    });
  } catch {}
}

function upsertCctvFromMock() {
  try {
    const rows = Array.isArray(APP_DATA.cctvInspections) ? APP_DATA.cctvInspections : [];
    if (!rows.length) return;
    const byMethod: Record<string, { total: number; count: number }> = {};
    rows.forEach(r => {
      const m = String(r.method || 'Unknown');
      byMethod[m] = byMethod[m] || { total: 0, count: 0 };
      byMethod[m].total += Number(r.reviewTimeMinutes || 0);
      byMethod[m].count += 1;
    });
    const pts = Object.entries(byMethod).map(([m, agg]) => ({ x: m, y: agg.count ? Math.round((agg.total/agg.count)*10)/10 : 0 }));
    upsertSlideChart('eyeOnUnderground', 'cctv', {
      title: 'CCTV Inspection: Avg Review Time',
      description: 'Average minutes per review by method',
      axes: { x: 'Method', y: 'Avg Minutes', unitY: 'min' },
      series: [{ name: 'Review Time', points: pts }]
    });
  } catch {}
}

function upsertEcosystemFromMock() {
  try {
    const rows = Array.isArray(APP_DATA.ecosystemMetrics) ? APP_DATA.ecosystemMetrics : [];
    if (!rows.length) return;
    const pts = rows.map(r => ({ x: r.category, y: Number(r.impactScore) || 0 }));
    upsertSlideChart('visionariesBelow', 'ecosystem', {
      title: 'Leadership Ecosystem Impact',
      axes: { x: 'Capability', y: 'Impact' },
      series: [{ name: 'Impact', points: pts }]
    });
  } catch {}
}

function upsertTechStackFromMock() {
  try {
    const rows = Array.isArray(APP_DATA.techMetrics) ? APP_DATA.techMetrics : [];
    if (!rows.length) return;
    const byMetric: Record<string, Array<{ x: string; y: number }>> = {};
    rows.forEach(r => {
      const metric = String(r.metric || 'Metric');
      const phase = String(r.phase || 'Phase');
      const value = Number(r.value) || 0;
      byMetric[metric] = byMetric[metric] || [];
      byMetric[metric].push({ x: phase, y: value });
    });
    const series: ChartSeries[] = Object.entries(byMetric).map(([name, pts]) => ({ name, points: pts }));
    upsertSlideChart('wiredForFuture', 'techStack', {
      title: 'Technology Roadmap Metrics',
      axes: { x: 'Phase', y: 'Score' },
      series
    });
  } catch {}
}

function upsertEvidenceCountsFromMock() {
  try {
    const items = Array.isArray(APP_DATA.evidenceItems) ? APP_DATA.evidenceItems : [];
    if (!items.length) return;
    const byTag: Record<string, number> = {};
    items.forEach(i => {
      const tag = String(i.tag || 'Other');
      byTag[tag] = (byTag[tag] || 0) + 1;
    });
    const pts = Object.entries(byTag).map(([k,v]) => ({ x: k, y: v }));
    upsertSlideChart('evidenceLocker', 'evidence', {
      title: 'Evidence Items by Tag',
      axes: { x: 'Tag', y: 'Count' },
      series: [{ name: 'Items', points: pts }]
    });
  } catch {}
}

function bootstrapFromMockData() {
  try {
    upsertMastersOfMainFromMock();
    upsertProjectCostsFromMock();
    upsertGrowthBridgeFromMock();
    upsertTimelineFromMock();
    upsertCctvFromMock();
    upsertEcosystemFromMock();
    upsertTechStackFromMock();
    upsertEvidenceCountsFromMock();
  } catch {}
}

try { bootstrapFromMockData(); } catch {}
