import React, { useState } from 'react';
import {
    Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
    Pie, PieChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

// ============================================================================
// 1. NARRATIVE SCRIPT (Source Text)
// ============================================================================

const speechText = `Today I'm presenting a comprehensive financial intelligence analysis of Visu-Sewer – a 50-year-old wastewater infrastructure company that's quietly becoming one of the most compelling growth stories in the municipal services sector.

What you're about to see isn't just another financial deck. This is a living, evidence-based intelligence platform where every number, every projection, and every claim is backed by verifiable sources. And here's what makes it special: you can ask it questions in plain English and get instant, evidence-backed answers.

We've compiled 28+ authoritative sources – everything from official municipal contract awards to Fort Point Capital's portfolio documentation. Every claim in this presentation is traceable. High confidence data, medium confidence estimates, and low confidence projections are clearly labeled.

For example:
The $14 million 2022 revenue? High confidence – comes directly from Zippia's employment data.
The $18.148 million HOVMSD contract? High confidence – that's from the official contract award PDF published by Heart of the Valley Metropolitan Sewerage District.
The 2025-2030 projections? Low confidence – we label them as scenarios with explicit assumptions.

Let me walk you through the key metrics.

Revenue trajectory: We're looking at $19.8 million in 2024, projected to reach $24.2 million in 2025 and $28.5 million by 2026 under our base case scenario. That's a 20.6% CAGR over the next two years.

What's driving this? Three things:
First, the HOVMSD contract – their largest project ever at $18.1 million. They're rehabilitating 5.5 miles of interceptor pipe that serves 60,000 residents. And here's the kicker: they came in 16.8% under budget. Original estimate was $21.8 million; they won the bid at $18.148 million. That's not luck – that's operational excellence.

Second, the service mix. They're not a point solution provider. They offer the full lifecycle: inspection (25% of revenue, 35% margins), maintenance (18% of revenue, 32% margins), and rehabilitation (42% of revenue, 28% margins). This integrated model creates customer stickiness and drives a weighted average margin of approximately 30% – well above the industry standard of 20-25%.

Third, geographic expansion. In October 2025, they acquired MOR Construction Services, moving into Pennsylvania, Delaware, and New Jersey. This isn't just about adding revenue – it's about proving the platform expansion playbook.

The Market Opportunity: The global wastewater treatment market was valued at $93.56 billion in 2024 and is projected to reach $127.37 billion by 2030 – that's a 5.36% CAGR. North America specifically is growing even faster at 7.7% annually. Why? Because American infrastructure is failing. The average wastewater system is over 50 years old.

Visu-Sewer currently holds about 0.021% market share. That's not a problem – that's a massive runway. Even modest market share gains translate to exponential revenue growth.

Why Visu-Sewer? Deep municipal relationships, Fort Point Capital backing, proven operational execution, margin profile, and a clear acquisition roadmap. The evidence is transparent – every number is traceable.`;

// ============================================================================
// 2. EVIDENCE-BACKED DATA STRUCTURES
// ============================================================================

// Revenue trajectory data
const revenueData = [
  { year: '2022', revenue: 14.0, ebitda: 2.6, source: 'Zippia', note: 'Baseline' },
  { year: '2023', revenue: 16.5, ebitda: 3.2, source: 'Fort Point', note: 'Growth' },
  { year: '2024', revenue: 19.8, ebitda: 4.1, source: 'Pipeline', note: 'HOVMSD Impact' },
  { year: '2025', revenue: 24.2, ebitda: 5.3, source: 'Projection', note: 'MOR Acq' },
  { year: '2026', revenue: 28.5, ebitda: 6.4, source: 'Projection', note: 'Integration' }
];

// Market size data
const marketSizeData = [
  { year: '2024', totalMarket: 93560, visusewer: 19.8, marketShare: 0.021 },
  { year: '2025', totalMarket: 98580, visusewer: 24.2, marketShare: 0.025 },
  { year: '2026', totalMarket: 103870, visusewer: 28.5, marketShare: 0.027 },
  { year: '2030', totalMarket: 127370, visusewer: 42.0, marketShare: 0.033 }
];

// Service mix breakdown
const serviceMixData = [
  { service: 'CIPP Rehab', value: 42, color: '#3b82f6', margin: 28 },
  { service: 'CCTV Inspection', value: 25, color: '#10b981', margin: 35 },
  { service: 'Maintenance', value: 18, color: '#f59e0b', margin: 32 },
  { service: 'Manhole Rehab', value: 10, color: '#8b5cf6', margin: 25 },
  { service: 'Grouting', value: 5, color: '#ec4899', margin: 30 }
];

// Project pipeline
const projectPipeline = [
  { project: 'HOVMSD Interceptor', budgeted: 21.8, awarded: 18.148, variance: -3.652, status: 'In Progress', completion: 75 },
  { project: 'Fox Point Sewer', budgeted: 1.2, awarded: 1.15, variance: -0.05, status: 'Planned', completion: 0 },
  { project: 'Wauwatosa Laterals', budgeted: 0.8, awarded: 0.75, variance: -0.05, status: 'Ongoing', completion: 60 }
];

// Financial Scenarios
const financialScenarios = [
  { scenario: 'Conservative', year2025: 22.5, year2026: 25.8, year2030: 38.2, probability: 30 },
  { scenario: 'Base Case', year2025: 24.2, year2026: 28.5, year2030: 48.5, probability: 50 },
  { scenario: 'Aggressive', year2025: 26.8, year2026: 32.5, year2030: 62.4, probability: 20 }
];

const calculateCAGR = (start: number, end: number, years: number) => ((Math.pow(end / start, 1 / years) - 1) * 100).toFixed(1);

// ============================================================================
// 3. MAIN COMPONENT
// ============================================================================

const Page13Speech: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState('revenue');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utter = new SpeechSynthesisUtterance(speechText);
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
    setIsSpeaking(true);
  };

  // Helper to highlight active chart button
  const getBtnClass = (id: string) => 
    `px-3 py-2 rounded-lg text-sm transition-all ${selectedChart === id 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-900 text-white overflow-hidden">
      

      {/* ================= RIGHT COLUMN: CHARTS (65%) ================= */}
      <div className="lg:w-[65%] h-full flex flex-col bg-slate-800/30">
        
        {/* Chart Navigation */}
        <div className="p-4 border-b border-slate-700 flex flex-wrap gap-2 bg-slate-900/50">
          <button onClick={() => setSelectedChart('revenue')} className={getBtnClass('revenue')}>📈 Revenue</button>
          <button onClick={() => setSelectedChart('pipeline')} className={getBtnClass('pipeline')}>🏗️ HOVMSD Pipeline</button>
          <button onClick={() => setSelectedChart('services')} className={getBtnClass('services')}>🔧 Service Mix</button>
          <button onClick={() => setSelectedChart('market')} className={getBtnClass('market')}>🎯 Market</button>
          <button onClick={() => setSelectedChart('scenarios')} className={getBtnClass('scenarios')}>🔮 Scenarios</button>
        </div>

        {/* Main Chart Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col">
          
          {selectedChart === 'revenue' && (
            <div className="h-full flex flex-col">
              <h2 className="text-xl font-bold text-cyan-400 mb-2">Revenue & EBITDA Trajectory</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                 <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-400">2 yr CAGR</div>
                    <div className="text-2xl font-bold text-green-400">{calculateCAGR(14.0, 19.8, 2)}%</div>
                 </div>
                 <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-400">2024 Est. Revenue</div>
                    <div className="text-2xl font-bold text-blue-400">$19.8M</div>
                 </div>
                 <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-400">2024 EBITDA Margin</div>
                    <div className="text-2xl font-bold text-purple-400">{((4.1/19.8)*100).toFixed(1)}%</div>
                 </div>
              </div>

              <div className="flex-1 min-h-[300px] h-full bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="year" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" unit="M" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" name="Revenue ($M)" stroke="#3b82f6" fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="ebitda" name="EBITDA ($M)" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {selectedChart === 'pipeline' && (
              <div className="h-full flex flex-col">
              <h2 className="text-xl font-bold text-cyan-400 mb-2">Project Performance: HOVMSD</h2>
              

              <div className="flex-1 min-h-[300px] h-full bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectPipeline} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" unit="M" />
                    <YAxis dataKey="project" type="category" width={120} stroke="#9ca3af" />
                    <Tooltip cursor={{fill: '#334155'}} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                    <Legend />
                    <Bar dataKey="budgeted" name="Budgeted ($M)" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="awarded" name="Awarded ($M)" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              
            </div>
          )}

          {selectedChart === 'services' && (
            <div className="h-full flex flex-col">
              <h2 className="text-xl font-bold text-cyan-400 mb-2">Service Mix & Margins</h2>

              <div className="flex flex-col md:flex-row gap-6 h-full">
                <div className="flex-1 min-h-[300px] h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceMixData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {serviceMixData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                
              </div>
            </div>
          )}

          {selectedChart === 'market' && (
            <div className="h-full flex flex-col">
              <h2 className="text-xl font-bold text-cyan-400 mb-2">Market Opportunity</h2>

              <div className="flex-1 min-h-[300px] h-full bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={marketSizeData}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                       <XAxis dataKey="year" stroke="#9ca3af" />
                       <YAxis yAxisId="left" stroke="#9ca3af" label={{ value: 'TAM ($M)', angle: -90, position: 'insideLeft' }} />
                       <YAxis yAxisId="right" orientation="right" stroke="#10b981" label={{ value: 'Revenue ($M)', angle: 90, position: 'insideRight' }} />
                       <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                       <Legend />
                       <Line yAxisId="left" type="monotone" dataKey="totalMarket" stroke="#3b82f6" name="Total Market" />
                       <Line yAxisId="right" type="monotone" dataKey="visusewer" stroke="#10b981" strokeWidth={3} name="Visu-Sewer Rev" />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
              
            </div>
          )}

          {selectedChart === 'scenarios' && (
            <div className="h-full flex flex-col">
              <h2 className="text-xl font-bold text-cyan-400 mb-2">Financial Projections (2025-2030)</h2>

              <div className="flex-1 min-h-[300px] h-full bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="year" type="category" allowDuplicatedCategory={false} stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" unit="M" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                      <Legend />
                      <Line dataKey="value" data={[
                         {year: '2025', value: 22.5}, {year: '2026', value: 25.8}, {year: '2030', value: 38.2}
                      ]} name="Conservative" stroke="#f59e0b" strokeDasharray="5 5" />
                      <Line dataKey="value" data={[
                         {year: '2025', value: 24.2}, {year: '2026', value: 28.5}, {year: '2030', value: 48.5}
                      ]} name="Base Case" stroke="#3b82f6" strokeWidth={3} />
                      <Line dataKey="value" data={[
                         {year: '2025', value: 26.8}, {year: '2026', value: 32.5}, {year: '2030', value: 62.4}
                      ]} name="Aggressive" stroke="#10b981" strokeDasharray="3 3" />
                   </LineChart>
                </ResponsiveContainer>
              </div>
              
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Page13Speech;