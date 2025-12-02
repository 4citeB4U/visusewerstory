// AgentLeeChartRegistry: structured knowledge for charts per slide
// Exposes lightweight chart context + structured data points for precise answers.

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
  // mastersOfMain (crew capacity)
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
      series: [{ name: 'Locations', points: [] }],
      key_points: []
    }
  },
  // throughTheTunnels (Timeline) — stub
  throughTheTunnels: {
    timeline: {
      id: 'timeline',
      title: 'Historical Growth Timeline',
      description: 'Milestones and inflection points in company growth.',
      axes: { x: 'Year', y: 'Milestones' },
      series: [{ name: 'Events', points: [] }],
      key_points: []
    }
  },
  // eyeOnUnderground (CCTV) — stub
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
  // savingCities (ProjectCosts) — stub
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
      description: 'Adoption metrics and performance outcomes.',
      axes: { x: 'Year', y: 'Index' },
      series: [{ name: 'AI Index', points: [] }],
      key_points: []
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

export const AgentLeeChartRegistry = {
  getChartContextForSlide(idOrTitle: string): string | null {
    const key = normalizeId(idOrTitle);
    const charts = REGISTRY[key];
    if (!charts) return null;
    const first = Object.values(charts)[0];
    if (!first) return null;
    const seriesNames = first.series.map(s => s.name).join(', ');
    return `${first.title} — ${first.description || ''} Series: ${seriesNames}.`;
  },
  getChartDataForSlide(idOrTitle: string): ChartKnowledge[] | null {
    const key = normalizeId(idOrTitle);
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
