/* ============================================================================
LEEWAY HEADER — DO NOT REMOVE
PROFILE: LEEWAY-ORDER
TAG: UI.COMPONENT.CHARTS.SUITE
REGION: 🔵 UI

STACK: LANG=tsx; FW=react; UI=tailwind; BUILD=node
RUNTIME: browser
TARGET: web-app

DISCOVERY_PIPELINE:
  MODEL=Voice>Intent>Location>Vertical>Ranking>Render;
  ROLE=support;
  INTENT_SCOPE=n/a;
  LOCATION_DEP=none;
  VERTICALS=n/a;
  RENDER_SURFACE=in-app;
  SPEC_REF=LEEWAY.v12.DiscoveryArchitecture

LEEWAY-LD:
{
  "@context": ["https://schema.org", {"leeway":"https://leeway.dev/ns#"}],
  "@type": "SoftwareSourceCode",
  "name": "Comprehensive Chart Component Library",
  "programmingLanguage": "TypeScript",
  "runtimePlatform": "browser",
  "about": ["LEEWAY", "UI", "Charts", "DataVisualization"],
  "identifier": "UI.COMPONENT.CHARTS.SUITE",
  "license": "MIT",
  "dateModified": "2025-12-09"
}

5WH: WHAT=Comprehensive chart component library; WHY=Render all data visualization types for story slides; WHO=Agent Lee System; WHERE=/components/Charts.tsx; WHEN=2025-12-09; HOW=Recharts + responsive design + multiple chart configurations
SPDX-License-Identifier: MIT
============================================================================ */

import React, { useEffect, useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {
    AcquisitionRecord,
    CaseStudyRecord,
    CctvInspectionRecord,
    EcosystemRecord,
    EvidenceRecord,
    FinancialRecord,
    HistoricalDataPoint,
    OperationalVelocityRecord,
    ProjectCostRecord,
    TechMetricRecord
} from "../types";

const COLORS = {
  usRed: "#B22234",    // Official Flag Red
  usBlue: "#3C3B6E",   // Official Flag Blue
  usWhite: "#FFFFFF",
  visuDark: "#1a1a2e", // Dark Navy Background
  success: "#22c55e",  // Green for positive
  gray: "#94a3b8",      // Slate
  activeBlack: "#000000" // BLACK for active Highlight
};

// --- HOOK: Auto-Highlight Cycle ---
const useChartHighlight = (dataLength: number, isSpeaking: boolean) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    useEffect(() => {
        // Reset when speech stops or data changes
        if (!isSpeaking) {
            setActiveIndex(null);
            return;
        }

        // Start cycle
        let current = 0;
        setActiveIndex(0);

        const interval = setInterval(() => {
            if (hoverIndex !== null) return; // User is interacting, pause auto-cycle

            current = (current + 1) % dataLength;
            setActiveIndex(current);
        }, 2500); // Cycle every 2.5 seconds to match narration pacing

        return () => clearInterval(interval);
    }, [isSpeaking, dataLength, hoverIndex]);

    return { 
        activeIndex: hoverIndex !== null ? hoverIndex : activeIndex, 
        setHoverIndex 
    };
};

// --- Custom Tooltip with Evidence Link ---
const EvidenceTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black border-2 border-white p-3 rounded shadow-2xl max-w-[250px] z-50 backdrop-blur-md opacity-100">
        <p className="text-white font-bold text-xs mb-1 border-b border-slate-800 pb-1">{label || data.name || data.year}</p>
        {payload.map((p: any, i: number) => (
            <p key={i} className="text-xs font-mono my-1 text-white">
                {p.name}: <span className="font-bold text-green-400">{p.value}</span>
            </p>
        ))}
        {data.evidenceRef && (
            <div className="mt-2 pt-2 border-t border-slate-800 animate-[pulse_2s_infinite]">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Verified Source:</span>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[10px] text-blue-300 font-mono truncate block font-bold underline">
                       {data.evidenceRef}
                    </span>
                </div>
            </div>
        )}
      </div>
    );
  }
  return null;
};

// --- Utility: Notify Agent Lee of selected data point ---
const notifyAgentOfPoint = (detail: any) => {
    try {
        (window as any).AGENT_SELECTED_POINT = detail;
        const ev = new CustomEvent('agentlee:dataPointSelected', { detail });
        window.dispatchEvent(ev);
    } catch {}
};

// --- Acquisitions Map (National Platform High-Fidelity) ---
export const AcquisitionsMap: React.FC<{ data?: AcquisitionRecord[] }> = ({ data = [] }) => {
    const hq = (data || []).find(x => x && x.id === 'visu') || { coordinates: { x: 0, y: 0 } };
    
    // Organizational chart data (simplified from provided structure)
    const org = {
        CEO: { name: 'Keith Alexander', title: 'Chief Executive Officer' },
        COO: { name: 'Lou Hall', title: 'Chief Operating Officer' },
        CFO: { name: 'Dawn Herman', title: 'Chief Financial Officer' },
        CPO: { name: 'Greg Sunner', title: 'Chief People Officer' },
        VPSales: { name: 'Randy Belanger', title: 'Vice President, Sales' },
        VPService: { name: 'John Nelson', title: 'Vice President, Service Division' },
        Controller: { name: 'Nicholas Vavra', title: 'Controller' },
        DirNatLiner: { name: 'Shaun Ritter', title: 'Director, National Liner' },
        DM_WB: { name: 'Mike Bright', title: 'Division Manager, Water Blasting' },
        DM_CIPP: { name: 'Todd Bonk', title: 'CIPP Division Manager' },
        Pres_WI: { name: 'Alex Rossebo', title: 'President, Wisconsin' },
        DM_IL: { name: 'Jason Kowalski', title: 'Division Manager, Illinois' },
        DM_MN: { name: 'Shawn Nico', title: 'Division Manager, Minnesota' },
        DM_MO: { name: 'James Bohn', title: 'Division Manager, Missouri' },
        DM_OH: { name: 'John Murphy', title: 'Division Manager, Ohio' },
        DM_VA: { name: 'Mark Burcham', title: 'Division Manager, Virginia' }
    };

    // ImageCard: simple fill or contain card. When `fit` is 'cover' the image will fill
    // the card and be cropped to maintain aspect ratio so both columns share the same height.
    const ImageCard: React.FC<{
        src: string;
        alt?: string;
        containerClass?: string;
        fit?: 'contain' | 'cover';
        inset?: boolean;
    }> = ({ src, alt = '', containerClass = '', fit = 'cover', inset = false }) => {
        // Use a simple fill layout so both cards keep identical heights (flex layout handles sizing).
        if (fit === 'cover') {
            // Cover mode: image fills the card and is cropped to maintain aspect ratio.
            // This renders the image edge-to-edge so it is flush with the card borders.
            return (
                <div className={`flex-1 relative w-full rounded-md overflow-hidden shadow-lg border border-slate-800 bg-slate-900 ${containerClass}`}>
                    <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover object-center block" />
                </div>
            );
        }

        // contain mode keeps the entire image visible but still fills the card area vertically
        return (
            <div className={`flex-1 relative w-full rounded-md overflow-hidden shadow-lg border border-slate-800 bg-slate-900 ${containerClass}`}>
                <div className={`w-full h-full flex items-center justify-center ${inset ? 'p-3' : ''}`}>
                    <img src={src} alt={alt} className="max-w-full max-h-full object-contain block" />
                </div>
            </div>
        );
    };

    return (
        <div className="h-[900px] w-full relative bg-slate-900/60 rounded-xl border border-blue-900 overflow-hidden shadow-2xl backdrop-blur-md p-4 flex flex-col">
            {/* Header always visible at top */}
            <div className="pb-2 mb-2 text-center border-b border-blue-900 bg-slate-900/80">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-white drop-shadow-lg">Expanded Footprint</h2>
                <p className="text-sm text-slate-300 mt-1">Visu-Sewer — Expanded Footprint</p>
                <div className="h-1 w-36 mx-auto bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 rounded-full mt-3 opacity-90" />
            </div>

                        {/* Only images scroll, header stays fixed; main container does not scroll */}
                        <div className="flex-1 w-full flex flex-col gap-4 overflow-y-auto max-h-[800px]" data-agentlee-scroll="acquisitions">
                                <div className="flex-1 w-full flex items-stretch">
                                        <ImageCard
                                            src={`images/geographic-footprint.png`}
                                                alt="Geographic Footprint"
                                                fit="contain"
                                                containerClass="bg-slate-800/20"
                                        />
                                </div>
                        </div>
        </div>
    );
};

// --- CCTV Chart ---
export const CctvChart: React.FC<{ data: CctvInspectionRecord[], isSpeaking?: boolean }> = ({ data, isSpeaking = false }) => {
    const { activeIndex, setHoverIndex } = useChartHighlight(data.length, isSpeaking);

    return (
        <div
            className="h-full w-full p-4 bg-slate-900/60 rounded-xl border border-blue-900/50 flex flex-col backdrop-blur-sm overflow-auto"
            data-agentlee-scroll="ecosystem"
        >
            <div className="flex justify-between items-end mb-4 border-b border-slate-700 pb-2">
                <h3 className="text-slate-200 text-sm font-semibold uppercase tracking-wider">Inspection Efficiency</h3>
                <span className="text-[10px] text-green-400 font-mono">AI ACCELERATION ACTIVE</span>
            </div>
            {/* Split the visualization area: top image and bottom chart, each 50% */}
            <div className="flex-1 w-full grid grid-rows-2 gap-2 min-h-[250px]">
                {/* Top: Organizational chart image filling edges */}
                <div className="row-span-1 relative rounded-md overflow-hidden border border-slate-800 bg-slate-900">
                    <img
                        src={`images/orgchart.png`}
                        alt="Organizational Chart"
                        className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                </div>
                {/* Bottom: Inspection Efficiency chart occupies 50% */}
                <div className="row-span-1">
                    <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                                    data={data} 
                                    layout="vertical" 
                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                    onClick={(state: any) => {
                                            const ap = Array.isArray(state?.activePayload) ? state.activePayload[0] : null;
                                            const x = ap?.payload?.segmentId ?? ap?.payload?.name ?? ap?.payload?.year ?? null;
                                            const y = ap?.payload?.reviewTimeMinutes ?? ap?.value ?? null;
                                    if (x != null) notifyAgentOfPoint({ x, y, seriesKey: 'Review Time', chartKind: 'CCTV' });
                                    }}
                                    onMouseMove={(state) => {
                                            const idx = typeof state.activeTooltipIndex === 'number' ? state.activeTooltipIndex : null;
                                            if (idx !== null) setHoverIndex(idx);
                                    }}
                                    onMouseLeave={() => setHoverIndex(null)}
                            >
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={true} />
                            <XAxis type="number" stroke="#94a3b8" tick={{fontSize: 10}} label={{ value: 'Minutes per Segment', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
                            <YAxis dataKey="segmentId" type="category" stroke="#94a3b8" width={40} tick={{fontSize: 10}} />
                            <Tooltip content={<EvidenceTooltip />} cursor={{fill: 'rgba(255,255,255,0.1)'}} />
                            <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
                            <Bar 
                                    dataKey="reviewTimeMinutes" 
                                    name="Review Time (min)" 
                                    radius={[0, 4, 4, 0]}
                                    animationDuration={2000}
                                    animationEasing="ease-out"
                            >
                                    {data.map((entry, index) => (
                                            <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={index === activeIndex ? COLORS.activeBlack : (entry.method === 'AI-Assisted' ? COLORS.success : COLORS.usBlue)} 
                                                    stroke={index === activeIndex ? 'white' : 'none'}
                                                    strokeWidth={index === activeIndex ? 2 : 0}
                                            />
                                    ))}
                            </Bar>
                            </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// --- Project Costs Chart ---
export const ProjectCostsChart: React.FC<{ data: ProjectCostRecord[], isSpeaking?: boolean }> = ({ data, isSpeaking = false }) => {
  const { activeIndex, setHoverIndex } = useChartHighlight(data.length, isSpeaking);

  return (
    <div className="h-full w-full p-4 bg-slate-900/60 rounded-xl border border-blue-900/50 flex flex-col backdrop-blur-sm">
      <div className="flex justify-between items-end mb-4 border-b border-slate-700 pb-2">
        <h3 className="text-slate-200 text-sm font-semibold uppercase tracking-wider">Trenchless Economics</h3>
        <span className="text-[10px] text-red-400 font-mono">DISRUPTION MINIMIZED</span>
      </div>
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart 
                data={data} 
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                onClick={(state: any) => {
                    const ap = Array.isArray(state?.activePayload) ? state.activePayload[0] : null;
                    const x = ap?.payload?.projectId ?? null;
                    const y = ap?.payload?.actualAmount ?? ap?.value ?? null;
                    if (x != null) (window as any).AGENT_SELECTED_POINT = { x, seriesKey: 'Actual Cost ($)' };
                }}
                onMouseMove={(state) => {
                    const idx = typeof state.activeTooltipIndex === 'number' ? state.activeTooltipIndex : null;
                    if (idx !== null) setHoverIndex(idx);
                }}
                onMouseLeave={() => setHoverIndex(null)}
            >
            <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.usBlue} stopOpacity={1}/>
                    <stop offset="100%" stopColor={COLORS.usBlue} stopOpacity={0.6}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="projectId" stroke="#94a3b8" tick={{fontSize: 10}} />
            <YAxis yAxisId="left" orientation="left" stroke="#94a3b8" width={50} tick={{fontSize: 10}} label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#B22234" width={40} tick={{fontSize: 10}} label={{ value: 'Days', angle: 90, position: 'insideRight', fill: '#B22234', fontSize: 10 }} />
            <Tooltip content={<EvidenceTooltip />} />
            <Legend wrapperStyle={{fontSize: '10px'}} />
            <Bar 
                yAxisId="left" 
                dataKey="actualAmount" 
                name="Actual Cost ($)" 
                barSize={60} 
                radius={[4, 4, 0, 0]}
                animationDuration={2000}
                animationBegin={0}
            >
                 {data.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={index === activeIndex ? COLORS.activeBlack : "url(#barGrad)"} 
                        stroke={index === activeIndex ? 'white' : 'none'}
                        strokeWidth={index === activeIndex ? 2 : 0}
                    />
                ))}
            </Bar>
            <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="disruptionDays" 
                name="Disruption (Days)" 
                stroke={COLORS.usRed} 
                strokeWidth={3} 
                dot={(props: any) => {
                    const isHover = props.index === activeIndex;
                    return <circle cx={props.cx} cy={props.cy} r={isHover ? 8 : 4} fill={isHover ? 'black' : COLORS.usRed} stroke={isHover ? 'white' : 'none'} strokeWidth={2} />
                }}
                animationDuration={2500}
                animationBegin={500}
            />
            </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Operational Velocity Chart (Page 6) ---
export const ScheduleChart: React.FC<{ data: OperationalVelocityRecord[], isSpeaking?: boolean }> = ({ data, isSpeaking = false }) => {
  const chartData = data.reduce((acc: any[], curr) => {
      let existing = acc.find(item => item.year === curr.year);
      if (!existing) {
          existing = { year: curr.year, midwest: 0, midAtlantic: 0, evidenceRef: curr.evidenceRef };
          acc.push(existing);
      }
      if (curr.region === "Midwest") existing.midwest = curr.crewCount;
      if (curr.region === "Mid-Atlantic") existing.midAtlantic = curr.crewCount;
      return acc;
  }, []).sort((a, b) => parseInt(a.year) - parseInt(b.year));

  const { activeIndex, setHoverIndex } = useChartHighlight(chartData.length, isSpeaking);

  return (
    <div className="h-full w-full p-4 bg-slate-900/60 rounded-xl border border-blue-900/50 flex flex-col backdrop-blur-sm">
      <div className="flex justify-between items-end mb-4 border-b border-slate-700 pb-2">
         <h3 className="text-slate-200 text-sm font-semibold uppercase tracking-wider">Velocity: Crew Capacity (2020-2050)</h3>
         <span className="text-[10px] text-blue-400 font-mono">ALGORITHMIC GROWTH</span>
      </div>
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
                data={chartData} 
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                onClick={(state: any) => {
                    const ap = Array.isArray(state?.activePayload) ? state.activePayload[0] : null;
                    const x = ap?.payload?.year ?? null;
                    const y = ap?.payload?.midwest ?? ap?.payload?.midAtlantic ?? ap?.value ?? null;
                    const key = ap?.dataKey === 'midAtlantic' ? 'Mid-Atlantic Capacity' : 'Midwest Capacity';
                    if (x != null) (window as any).AGENT_SELECTED_POINT = { x, seriesKey: key };
                }}
                onMouseMove={(state) => {
                    const idx = typeof state.activeTooltipIndex === 'number' ? state.activeTooltipIndex : null;
                    if (idx !== null) setHoverIndex(idx);
                }}
                onMouseLeave={() => setHoverIndex(null)}
            >
                <defs>
                    <linearGradient id="colorMw" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.usBlue} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.usBlue} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorMa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.usRed} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.usRed} stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="year" stroke="#94a3b8" tick={{fontSize: 10}} interval={4} />
                <YAxis stroke="#94a3b8" label={{ value: 'Active Crews', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip content={<EvidenceTooltip />} />
                <Legend wrapperStyle={{fontSize: '10px'}} />
                <Area 
                    type="monotone" 
                    dataKey="midwest" 
                    name="Midwest Capacity" 
                    stackId="1" 
                    stroke={COLORS.usBlue} 
                    fill="url(#colorMw)" 
                    animationDuration={3000}
                    animationEasing="ease-in-out"
                    activeDot={(props: any) => {
                        // Recharts types are tricky, check index manually or rely on standard tooltip trigger
                        const isHover = props.index === activeIndex;
                        if(!isHover) return <circle cx={props.cx} cy={props.cy} r={0} />;
                        return <circle cx={props.cx} cy={props.cy} r={6} fill="black" stroke="white" strokeWidth={2} />
                    }}
                />
                <Area 
                    type="monotone" 
                    dataKey="midAtlantic" 
                    name="Mid-Atlantic Capacity" 
                    stackId="1" 
                    stroke={COLORS.usRed} 
                    fill="url(#colorMa)" 
                    animationDuration={3000}
                    animationEasing="ease-in-out"
                    animationBegin={500}
                    activeDot={(props: any) => {
                        const isHover = props.index === activeIndex;
                        if(!isHover) return <circle cx={props.cx} cy={props.cy} r={0} />;
                        return <circle cx={props.cx} cy={props.cy} r={6} fill="black" stroke="white" strokeWidth={2} />
                    }}
                />
            </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Tech Stack Visual (Page 7) ---
export const TechStackVisual: React.FC<{ data: TechMetricRecord[], isSpeaking?: boolean }> = ({ data, isSpeaking = false }) => {
    const { activeIndex, setHoverIndex } = useChartHighlight(data.length, isSpeaking);

    return (
        <div className="h-full w-full p-4 bg-slate-900/60 rounded-xl border border-blue-900/50 flex flex-col backdrop-blur-sm">
            <div className="flex justify-between items-end mb-6 border-b border-slate-700 pb-2">
                 <h3 className="text-slate-200 text-sm font-semibold uppercase tracking-wider">Verified Tech Productivity</h3>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-4">
                {data.map((metric, i) => (
                    <div 
                        key={i} 
                        onMouseEnter={() => setHoverIndex(i)}
                        onMouseLeave={() => setHoverIndex(null)}
                        className={`rounded-lg p-4 flex flex-col items-center relative group cursor-help border transition-all shadow-lg
                            ${activeIndex === i ? 'bg-black border-white scale-105 z-10 shadow-xl' : 'bg-slate-800/50 border-slate-700 hover:border-red-500'}
                        `}
                    >
                        <div className="absolute top-2 right-2 text-[9px] text-slate-500 group-hover:text-red-500 font-mono">REF: {metric.evidenceRef?.split('_').pop()}</div>
                        <h4 className={`text-xs uppercase mb-4 font-bold tracking-wide ${activeIndex === i ? 'text-white' : 'text-slate-300'}`}>{metric.label}</h4>
                        
                        {/* Animated Radial Progress */}
                        <div className="relative w-28 h-28 flex items-center justify-center">
                             <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg] filter drop-shadow-lg">
                                <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path 
                                    className={i === 0 ? "text-blue-500" : i === 1 ? "text-red-500" : "text-green-500"}
                                    strokeDasharray={`${metric.value}, 100`} 
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="3" 
                                    strokeLinecap="round"
                                >
                                    <animate attributeName="stroke-dasharray" from="0, 100" to={`${metric.value}, 100`} dur="2s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" />
                                </path>
                             </svg>
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                 <span className={`text-2xl font-bold ${activeIndex === i ? 'text-green-400' : 'text-white'}`}>{metric.value}%</span>
                                 <span className="text-[8px] text-slate-400 uppercase">{metric.metric}</span>
                             </div>
                        </div>
                        <p className="mt-4 text-[10px] text-center text-slate-400 font-mono px-2">{metric.phase}</p>
                        
                        {/* Inline Evidence Pop-up for Tech Stack */}
                        <div className={`absolute -bottom-12 left-1/2 -translate-x-1/2 bg-black border border-white p-2 rounded text-[10px] text-white w-40 text-center z-20 transition-opacity duration-300 ${activeIndex === i ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                            Verified: {metric.evidenceRef}
                        </div>
                    </div>
                ))}
            </div>

            {/* Insert field technician image under the three charts, occupying half the box */}
                <div className="mt-4 w-full h-1/2 flex items-center justify-center">
                <img src={`images/feild-technician-first-guy.png`} alt="Field Technician" className="w-full h-full object-cover rounded-md shadow-lg" />
            </div>
        </div>
    );
};

// --- Ecosystem Visual (Page 9) ---
export const EcosystemVisual: React.FC<{ data: EcosystemRecord[] }> = ({ data }) => {
    // Compute overall statistics for the dataset
    const scores = data.map(d => d.impactScore);
    const n = scores.length;
    const mean = n ? Math.round((scores.reduce((a, b) => a + b, 0) / n) * 100) / 100 : 0;
    const sorted = n ? [...scores].sort((a, b) => a - b) : [];
    const median = n ? (sorted.length % 2 === 1 ? sorted[(sorted.length - 1) / 2] : ((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2)) : 0;
    const variance = n ? scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n : 0;
    const stddev = Math.round(Math.sqrt(variance) * 100) / 100;
    const min = n ? Math.min(...scores) : 0;
    const max = n ? Math.max(...scores) : 0;

    // Prepare log chart data (log10 transform with +1 to avoid log(0))
    const logData = data.map(d => ({ category: d.category, value: d.impactScore, logValue: Math.log10(d.impactScore + 1) }));
    
    // Show four circular progress charts (impact %) side-by-side, plus a summary and future projection
    const avgImpact = Math.round((data.reduce((s, d) => s + d.impactScore, 0) / Math.max(1, data.length)));

    return (
        <div className="h-full w-full p-4 bg-slate-900/60 rounded-xl border border-blue-900/50 flex flex-col backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-200 text-sm font-semibold uppercase tracking-wider">Visionary Ecosystem — Summary Status</h3>
                <div className="text-right">
                    <div className="text-xs text-slate-400">Average Impact</div>
                    <div className="text-2xl font-bold text-white">{avgImpact}%</div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 flex-1">
                    <div className="w-full md:w-[70%] flex items-center justify-center bg-slate-950/40 rounded-lg border border-slate-700/60 p-4 h-full">
                    <img
                        src={`images/visu-sewer-people-matter.png`}
                        alt="People Matter"
                            className="w-full h-full object-contain rounded-md shadow-lg"
                    />
                </div>

                <div className="w-full md:w-[30%]">
                    <div className="grid grid-cols-1 gap-3">
                        {data.length > 0 && (
                            data.map((item, i) => {
                                const value = Math.max(0, Math.min(100, item.impactScore));
                                const r = 28; // smaller radius
                                const c = 2 * Math.PI * r;
                                const dash = (value / 100) * c;

                                const colorClass = item.category === 'Safety' ? 'text-red-500' : item.category === 'Robotics' ? 'text-blue-500' : item.category === 'AI' ? 'text-green-400' : 'text-white';
                                const strokeColor = item.category === 'Safety' ? COLORS.usRed : item.category === 'Robotics' ? COLORS.usBlue : COLORS.success;

                                return (
                                    <div key={i} className="bg-slate-900/80 p-2 rounded-lg border border-slate-700 shadow-lg flex flex-col items-center">
                                        <div className={`text-[10px] uppercase font-bold mb-1 text-center ${colorClass}`}>{item.category}</div>

                                        <div className="relative w-20 h-20 mb-1 flex items-center justify-center">
                                            <svg width="80" height="80" viewBox="0 0 100 100" className="transform rotate-[-90deg]">
                                                <circle cx="50" cy="50" r={r} stroke="#111827" strokeWidth="8" fill="none" />
                                                <circle cx="50" cy="50" r={r} stroke={strokeColor} strokeWidth="6" strokeLinecap="round" fill="none"
                                                    strokeDasharray={`${dash} ${c - dash}`} />
                                            </svg>
                                            <div className="absolute text-white font-bold text-[12px] transform rotate-[90deg]">{value}%</div>
                                        </div>
                                        <div className="text-[9px] text-slate-300 mb-1">Partners</div>
                                        <ul className="text-[10px] text-slate-400 list-disc list-inside w-full">
                                            {item.partners.slice(0,3).map((p, idx) => <li key={idx}>{p}</li>)}
                                        </ul>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Evolution Visual (Page 11) ---
export const EvolutionVisual: React.FC = () => {
    const [revealed, setRevealed] = useState(false);

    return (
        <div className="h-full w-full bg-slate-900/60 rounded-xl border border-blue-900/50 relative overflow-hidden backdrop-blur-sm">
             {!revealed ? (
                 <div className="absolute inset-0 flex items-center justify-center flex-col gap-6">
                     {/* Full-bleed background image behind the header and button */}
                     <img src={`images/finished-tunnel.png`} alt="Finished Tunnel" className="absolute inset-0 w-full h-full object-cover opacity-70" />

                     {/* Dark overlay to keep text readable */}
                     <div className="absolute inset-0 bg-slate-950/50" />

                     {/* Subtle radial accent */}
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_70%)] animate-pulse" />

                     <div className="relative z-20 flex flex-col items-center gap-6">
                         <h3 className="text-2xl text-white font-bold uppercase tracking-widest drop-shadow-lg">The Future Formula</h3>
                         <button 
                            onClick={() => setRevealed(true)}
                            className="px-10 py-5 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg shadow-[0_0_30px_rgba(185,28,28,0.6)] animate-bounce transition-all transform hover:scale-105 border border-red-500"
                         >
                            REVEAL ENTERPRISE STRATEGY
                         </button>
                     </div>
                 </div>
             ) : (
                 <div className="h-full w-full p-8 flex flex-col animate-[fadeIn_0.8s_ease-out] relative">
                     <div className="text-center mb-8">
                         <h2 className="text-3xl text-blue-400 font-black tracking-widest drop-shadow-[0_0_15px_rgba(60,59,110,1)]">DOMINANCE = SCALE × (AI)²</h2>
                     </div>
                     <div className="flex-1 bg-slate-800/60 rounded-xl border border-slate-600 p-4 flex items-center justify-center relative overflow-hidden shadow-inner">
                         {/* Grid Background */}
                         <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                         
                         <div className="z-10 text-center space-y-6">
                             <div className="text-7xl font-black text-white tracking-tighter drop-shadow-xl animate-[zoomIn_0.5s_cubic-bezier(0.25,0.46,0.45,0.94)_both]">50 YEARS</div>
                             <div className="text-lg text-red-500 uppercase tracking-[0.5em] font-bold animate-[slideUp_0.8s_ease-out_0.3s_both]">Unchallenged Territory</div>
                             <div className="flex justify-center gap-4 mt-4">
                                 <div className="px-4 py-1 bg-blue-900/50 rounded border border-blue-500/30 text-xs text-blue-300 animate-[fadeIn_1s_ease-out_0.6s_both]">Predictive</div>
                                 <div className="px-4 py-1 bg-blue-900/50 rounded border border-blue-500/30 text-xs text-blue-300 animate-[fadeIn_1s_ease-out_0.8s_both]">Automated</div>
                                 <div className="px-4 py-1 bg-blue-900/50 rounded border border-blue-500/30 text-xs text-blue-300 animate-[fadeIn_1s_ease-out_1s_both]">Dominant</div>
                             </div>
                         </div>
                     </div>
                     <button onClick={() => setRevealed(false)} className="mt-6 text-xs text-slate-500 hover:text-white self-center underline cursor-pointer z-20">Reset View</button>
                 </div>
             )}
        </div>
    );
};

// --- Evidence Visual (Page 12) ---
export const EvidenceVisual: React.FC<{ data: EvidenceRecord[], caseStudies: CaseStudyRecord[] }> = ({ data, caseStudies }) => {
    const handleDownload = () => {
        window.print(); // Simple way to trigger PDF save without external libraries
    };

    return (
    <div className="h-full w-full p-4 bg-slate-900/60 rounded-xl border border-blue-900/50 flex gap-6 backdrop-blur-sm print:bg-white print:text-black">
        <div className="w-1/2 flex flex-col border-r border-slate-700 pr-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-slate-200 text-sm font-semibold uppercase tracking-wider flex items-center gap-2 print:text-black">
                    <span className="text-lg">📂</span> Verified Sources
                </h3>
                <button 
                    onClick={handleDownload}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-lg transition-colors print:hidden"
                >
                    DOWNLOAD REPORT (PDF)
                </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 print:overflow-visible">
                {data.map((item) => (
                    <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block bg-slate-800/80 border border-slate-700 p-3 rounded hover:bg-slate-700 hover:border-blue-500 transition-all group shadow-sm print:bg-transparent print:border-black print:text-black">
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide
                                ${item.tag === 'Verified' ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-blue-900/40 text-blue-400 border border-blue-800'}
                                print:border-black print:text-black print:bg-transparent
                            `}>{item.tag}</span>
                            <span className="text-[9px] text-slate-500 print:text-black">{item.date}</span>
                        </div>
                        <div className="text-xs text-slate-200 font-bold group-hover:text-white truncate mt-1 print:text-black">{item.title}</div>
                        <div className="text-[9px] text-slate-500 mt-1 truncate opacity-60 group-hover:opacity-100 transition-opacity print:text-black print:opacity-100">{item.url}</div>
                    </a>
                ))}
            </div>
        </div>
        
        <div className="w-1/2 flex flex-col">
            <h3 className="text-slate-200 mb-4 text-sm font-semibold uppercase tracking-wider flex items-center gap-2 print:text-black">
                 <span className="text-lg">💰</span> Financial Impact
            </h3>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={caseStudies} layout="vertical" margin={{top: 0, right: 30, left: 10, bottom: 0}} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                        <XAxis type="number" stroke="#94a3b8" tickFormatter={(val) => `$${val}`} tick={{fontSize: 10}} />
                        <YAxis dataKey="study" type="category" stroke="#94a3b8" width={90} tick={{fontSize: 9}} />
                        <Tooltip content={<EvidenceTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                        <Legend wrapperStyle={{fontSize: '10px'}} />
                        <Bar dataKey="costPerFootBefore" name="Cost Before" fill={COLORS.visuDark} stroke={COLORS.gray} radius={[0, 4, 4, 0]} barSize={12} animationDuration={1500} />
                        <Bar dataKey="costPerFootAfter" name="Cost After" fill={COLORS.success} radius={[0, 4, 4, 0]} barSize={12} animationDuration={1500} animationBegin={500} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
    );
};

// --- Closing Visual (Page 13) ---
export const ClosingVisual: React.FC = () => {
    const confettiCount = 30;
    const confettiCss = [...Array(confettiCount)].map((_, i) => {
        const color = i % 2 === 0 ? COLORS.usRed : i % 3 === 0 ? COLORS.usBlue : COLORS.usWhite;
        const left = Math.floor(Math.random() * 100);
        const dur = (3 + Math.random() * 3).toFixed(2);
        const delay = (Math.random() * 5).toFixed(2);
        return `.confetti-${i} { background-color: ${color}; top: -10%; left: ${left}%; animation: fall ${dur}s linear infinite ${delay}s; }`;
    }).join('\n');

    const confettiStyle = `${confettiCss}\n@keyframes fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(600px) rotate(720deg); opacity: 0; } }`;

    return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-950/80 rounded-xl border border-blue-900 p-8 text-center relative overflow-hidden group backdrop-blur-md">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {/* Fireworks & Confetti */}
             <style>{confettiStyle}</style>
             {[...Array(confettiCount)].map((_, i) => (
                 <div key={i} className={`absolute w-1.5 h-1.5 rounded-full shadow-lg confetti-${i}`} />
             ))}
        </div>

           <div className="relative z-10 mb-8 animate-[bounce_2s_infinite]">
               <div className="w-32 h-32 mx-auto bg-slate-800 rounded-full border-4 border-blue-500 flex items-center justify-center shadow-[0_0_60px_rgba(60,59,110,0.8)] relative overflow-hidden">
                   <div className="absolute inset-0 rounded-full border border-white opacity-20 animate-ping"></div>
                   <img src={`images/visu-sewer-logo-button.png`} alt="Visu Sewer Logo" className="w-full h-full object-cover rounded-full" />
               </div>
           </div>

        <h2 className="text-4xl font-black text-white mb-4 tracking-tight drop-shadow-lg">Partnership Initiated</h2>
        <p className="text-slate-300 max-w-md mx-auto text-base leading-relaxed mb-6">
            "We are ready to execute. The evidence is clear. The platform is yours."
        </p>

        {/* Truck image spanning full width under the paragraph */}
        {/* Full-bleed truck image: remove horizontal padding so image spans left->right */}
        <div className="w-full -mx-8 mb-4">
            <img src={`images/visu-sewer-truck.png`} alt="Visu Sewer Truck" className="w-full max-h-[12rem] md:max-h-[20rem] object-contain shadow-lg" />
        </div>
         <style>{`
            @keyframes fall {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(600px) rotate(720deg); opacity: 0; }
            }
        `}</style>
    </div>
    );
};

export const CovenantVisual: React.FC = () => (
    <div className="h-full w-full bg-slate-900/60 rounded-xl border border-blue-900/50 p-6 text-center relative overflow-hidden backdrop-blur-sm">
        {/* Title overlayed so image can occupy full slide height */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="inline-block bg-black/40 backdrop-blur-sm text-white px-4 py-2 rounded-md">
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">The Covenant</h1>
            </div>
        </div>

        <div className="relative h-full w-full flex items-center justify-center">
            <img src={`images/titlepage.png`} alt="Title Page" className="w-full h-full object-contain block" />
        </div>
    </div>
);

// --- Timeline Visual (Page 3 - High Fidelity) ---
export const TimelineVisual: React.FC<{ data?: HistoricalDataPoint[], isSpeaking?: boolean }> = ({ data = [], isSpeaking = false }) => {
    const { activeIndex, setHoverIndex } = useChartHighlight(data.length, isSpeaking);

    return (
        <div className="h-full w-full p-6 bg-slate-900/60 rounded-xl border border-blue-900/50 flex flex-col backdrop-blur-sm">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-slate-200 text-sm font-semibold uppercase tracking-wider shrink-0">50 Years of Rising Value</h3>
                <div className="text-xs text-red-400 font-mono animate-pulse">EXPONENTIAL GROWTH</div>
             </div>
             <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                        data={data} 
                        margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                        onClick={(state: any) => {
                            const ap = Array.isArray(state?.activePayload) ? state.activePayload[0] : null;
                            const x = ap?.payload?.year ?? null;
                            const y = ap?.payload?.value ?? ap?.value ?? null;
                            if (x != null) (window as any).AGENT_SELECTED_POINT = { x, seriesKey: 'Value' };
                        }}
                        onMouseMove={(state) => {
                            const idx = typeof state.activeTooltipIndex === 'number' ? state.activeTooltipIndex : null;
                            if (idx !== null) setHoverIndex(idx);
                        }}
                        onMouseLeave={() => setHoverIndex(null)}
                    >
                         <defs>
                            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.usRed} stopOpacity={0.9}/>
                                <stop offset="95%" stopColor={COLORS.usRed} stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="year" stroke="#94a3b8" tick={{fontSize: 10}} />
                        <YAxis hide />
                        <Tooltip content={<EvidenceTooltip />} cursor={{stroke: COLORS.usBlue, strokeWidth: 2}} />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke={COLORS.usRed} 
                            strokeWidth={4} 
                            fill="url(#colorGrowth)" 
                            animationDuration={3000}
                            animationEasing="ease-in-out"
                            activeDot={(props: any) => {
                                const isHover = props.index === activeIndex;
                                if (!isHover) return <circle cx={props.cx} cy={props.cy} r={0} />;
                                return <circle cx={props.cx} cy={props.cy} r={8} fill="black" stroke="white" strokeWidth={2} />
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
        </div>
    );
};

export const GrowthBridgeChart: React.FC<{ data: FinancialRecord[], isSpeaking?: boolean }> = ({ data, isSpeaking = false }) => {
    const { activeIndex, setHoverIndex } = useChartHighlight(data.length, isSpeaking);

    return (
      <div className="h-full w-full p-4 bg-slate-900/60 rounded-xl border border-blue-900/50 flex flex-col backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-200 text-sm font-semibold uppercase tracking-wider shrink-0">Financial Bridge: Path to $70M</h3>
        </div>
        <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart 
                data={data} 
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                onClick={(state: any) => {
                    const ap = Array.isArray(state?.activePayload) ? state.activePayload[0] : null;
                    const x = ap?.payload?.category ?? null;
                    const y = ap?.payload?.value ?? ap?.value ?? null;
                    if (x != null) (window as any).AGENT_SELECTED_POINT = { x, seriesKey: 'Revenue ($M)' };
                }}
                onMouseMove={(state) => {
                    const idx = typeof state.activeTooltipIndex === 'number' ? state.activeTooltipIndex : null;
                    if (idx !== null) setHoverIndex(idx);
                }}
                onMouseLeave={() => setHoverIndex(null)}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="category" stroke="#94a3b8" tick={{fontSize: 10}} />
                <YAxis stroke="#94a3b8" hide />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<EvidenceTooltip />} />
                <Bar dataKey="value" name="Revenue ($M)" animationDuration={2000} animationEasing="ease-out">
                    {data.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={index === activeIndex ? COLORS.activeBlack : (entry.type === 'Base' ? COLORS.usBlue : entry.type === 'Growth' ? COLORS.success : COLORS.usRed)} 
                            stroke={index === activeIndex ? 'white' : 'none'}
                            strokeWidth={index === activeIndex ? 2 : 0}
                        />
                    ))}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    );
};

export const DossierVisual: React.FC = () => (
    <div className="h-full w-full p-6 bg-slate-900/60 rounded-xl border border-blue-900/50 flex flex-col relative backdrop-blur-sm">
        <h3 className="text-slate-200 mb-4 text-sm font-semibold uppercase tracking-wider">Your Session Dossier</h3>
        <div className="flex-1 grid grid-cols-1 gap-3 overflow-y-auto pr-2 custom-scrollbar">
             <div className="bg-slate-800 p-4 rounded border border-slate-600 flex items-center justify-between hover:bg-slate-700 cursor-pointer transition-colors group">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:text-white transition-colors">📄</div>
                     <div>
                         <div className="text-sm font-bold text-white">Executive Summary</div>
                         <div className="text-[10px] text-slate-400">Generated: Just now</div>
                     </div>
                 </div>
                 <div className="text-xs text-slate-500 group-hover:text-blue-400">DOWNLOAD PDF</div>
             </div>
             <div className="bg-slate-800 p-4 rounded border border-slate-600 flex items-center justify-between hover:bg-slate-700 cursor-pointer transition-colors group">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded bg-green-500/20 flex items-center justify-center text-green-500 group-hover:text-white transition-colors">📊</div>
                     <div>
                         <div className="text-sm font-bold text-white">ROI Data Export</div>
                         <div className="text-[10px] text-slate-400">Source: Case Studies</div>
                     </div>
                 </div>
                 <div className="text-xs text-slate-500 group-hover:text-green-400">DOWNLOAD CSV</div>
             </div>
        </div>
    </div>
);

export const DefaultVisual: React.FC<{ title: string }> = ({ title }) => (
    <div className="h-full w-full flex items-center justify-center bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
        <div className="text-center p-4">
            <div className="text-4xl md:text-6xl mb-4 opacity-20 animate-bounce">🏗️</div>
            <div className="text-slate-500 font-mono text-sm uppercase tracking-widest">{title}</div>
        </div>
    </div>
);
