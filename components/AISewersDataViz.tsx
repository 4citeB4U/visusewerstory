import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const AISewersDataViz = () => {
  const [activeTab, setActiveTab] = useState('cost');

  // Cost Reduction Data
  const costReductionData = [
    { name: 'DC Water\nPipe Sleuth', before: 8, after: 2.5, reduction: 70 },
    { name: 'Hampton VA\nGraniteNet', before: 100, after: 60, reduction: 40 },
    { name: 'SewerAI\nCloud Ops', before: 100, after: 25, reduction: 75 },
    { name: 'Industry Avg\nMaintenance', before: 100, after: 70, reduction: 30 }
  ];

  // Processing Speed Data
  const speedData = [
    { method: 'Manual Analysis', speed: 1, label: '1x Baseline' },
    { method: 'AI with AutoCode', speed: 3, label: '3x Faster' },
    { method: 'Pipe Sleuth', speed: 10, label: '10x Faster' },
    { method: 'SewerAI Detection', speed: 6, label: '6x Faster' }
  ];

  // Accuracy & Defect Detection
  const accuracyData = [
    { category: 'Manual Inspection', accuracy: 67, defectsFound: 68 },
    { category: 'AI AutoCode', accuracy: 97, defectsFound: 90 },
    { category: 'VAPAR AI', accuracy: 95, defectsFound: 85 },
    { category: 'Pipe Sleuth', accuracy: 93, defectsFound: 88 }
  ];

  // Financial Impact Over Time
  const financialImpactData = [
    { year: 'Year 1', traditional: 100, ai: 95, savings: 5 },
    { year: 'Year 2', traditional: 200, ai: 160, savings: 40 },
    { year: 'Year 3', traditional: 300, ai: 210, savings: 90 },
    { year: 'Year 4', traditional: 400, ai: 250, savings: 150 },
    { year: 'Year 5', traditional: 500, ai: 280, savings: 220 }
  ];

  // Workforce Impact
  const workforceData = [
    { metric: 'Skill Obsolescence', value: 80 },
    { metric: 'AI Training Demand', value: 83 },
    { metric: 'Job Satisfaction', value: 75 },
    { metric: 'Productivity Gain', value: 90 },
    { metric: 'Career Advancement', value: 70 }
  ];

  // ROI Timeline
  const roiData = [
    { name: 'Wastewater Plant', roi: 24, paybackMonths: 6, savings: 45000 },
    { name: 'DC Water', roi: 18, paybackMonths: 12, savings: 250000 },
    { name: 'Hampton VA', roi: 20, paybackMonths: 9, savings: 150000 },
    { name: 'PNW Utility', roi: 16, paybackMonths: 15, savings: 1872307 }
  ];

  // Asset Lifespan Extension
  const assetLifespanData = [
    { category: 'Without AI', lifespan: 25, label: '25 years' },
    { category: 'With Predictive AI', lifespan: 35, label: '35 years (40% increase)' }
  ];

  // Technology Comparison
  const techComparisonData = [
    { 
      technology: 'SewerAI',
      accuracy: 97,
      speed: 90,
      cost: 85,
      integration: 95,
      compliance: 90
    },
    { 
      technology: 'PipeSleuth',
      accuracy: 93,
      speed: 95,
      cost: 75,
      integration: 88,
      compliance: 98
    },
    { 
      technology: 'VAPAR',
      accuracy: 95,
      speed: 80,
      cost: 80,
      integration: 85,
      compliance: 92
    },
    { 
      technology: 'GraniteNet',
      accuracy: 90,
      speed: 75,
      cost: 90,
      integration: 92,
      compliance: 95
    }
  ];

  // Helper: map a numeric percent to a discrete CSS class (5% steps)
  const pctClass = (v: number) => {
    const rounded = Math.round(v / 5) * 5;
    const clamped = Math.max(0, Math.min(100, rounded));
    return `w-pct-${clamped}`;
  };

  // Downtime Reduction
  const downtimeData = [
    { name: 'Traditional', planned: 20, unplanned: 80, total: 100 },
    { name: 'AI Predictive', planned: 60, unplanned: 20, total: 80 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const tabs = [
    { id: 'cost', label: 'Cost Analysis' },
    { id: 'performance', label: 'Performance Metrics' },
    { id: 'workforce', label: 'Workforce Impact' },
    { id: 'roi', label: 'ROI & Savings' },
    { id: 'technology', label: 'Technology Comparison' }
  ];

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 overflow-auto">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            AI Sewer Infrastructure Analytics
          </h1>
          <p className="text-xl text-blue-200">
            Evidence-Based Data Visualization from Industry Case Studies
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cost Analysis Tab */}
        {activeTab === 'cost' && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Cost Reduction Comparison</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={costReductionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#e5e7eb" />
                  <YAxis stroke="#e5e7eb" label={{ value: 'Cost Index', angle: -90, position: 'insideLeft', fill: '#e5e7eb' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="before" fill="#ef4444" name="Before AI" />
                  <Bar dataKey="after" fill="#10b981" name="After AI" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {costReductionData.map((item, idx) => (
                  <div key={idx} className="bg-green-500/20 rounded-lg p-4 text-center">
                    <p className="text-white font-semibold">{item.name.replace('\n', ' ')}</p>
                    <p className="text-3xl font-bold text-green-400">{item.reduction}%</p>
                    <p className="text-green-200 text-sm">Cost Reduction</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Cumulative Financial Impact (5-Year Projection)</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={financialImpactData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#e5e7eb" />
                  <YAxis stroke="#e5e7eb" label={{ value: 'Cost ($1000s)', angle: -90, position: 'insideLeft', fill: '#e5e7eb' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="traditional" stroke="#ef4444" strokeWidth={3} name="Traditional Costs" />
                  <Line type="monotone" dataKey="ai" stroke="#10b981" strokeWidth={3} name="AI-Enhanced Costs" />
                  <Line type="monotone" dataKey="savings" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" name="Cumulative Savings" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 bg-amber-500/20 rounded-lg p-4">
                <p className="text-amber-200 text-center">
                  <span className="text-3xl font-bold text-amber-400">$220K+</span> projected savings by Year 5
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Processing Speed Comparison</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={speedData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#e5e7eb" label={{ value: 'Speed Multiplier', position: 'insideBottom', fill: '#e5e7eb' }} />
                  <YAxis dataKey="method" type="category" stroke="#e5e7eb" width={150} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="speed" fill="#3b82f6" label={{ position: 'right', fill: '#fff' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Accuracy & Defect Detection Rates</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#e5e7eb" />
                  <YAxis stroke="#e5e7eb" label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', fill: '#e5e7eb' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="accuracy" fill="#8b5cf6" name="Accuracy %" />
                  <Bar dataKey="defectsFound" fill="#ec4899" name="Defects Found %" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-purple-500/20 rounded-lg p-4 text-center">
                  <p className="text-white font-semibold">AI AutoCode Accuracy</p>
                  <p className="text-4xl font-bold text-purple-400">97%</p>
                </div>
                <div className="bg-pink-500/20 rounded-lg p-4 text-center">
                  <p className="text-white font-semibold">Additional Defects Found</p>
                  <p className="text-4xl font-bold text-pink-400">+33%</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Asset Lifespan Extension</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={assetLifespanData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#e5e7eb" />
                  <YAxis stroke="#e5e7eb" label={{ value: 'Years', angle: -90, position: 'insideLeft', fill: '#e5e7eb' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="lifespan" fill="#10b981" label={{ position: 'top', fill: '#fff' }} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 bg-green-500/20 rounded-lg p-4 text-center">
                <p className="text-green-200">
                  <span className="text-4xl font-bold text-green-400">40%</span> increase in asset lifespan with AI predictive maintenance
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Workforce Impact Tab */}
        {activeTab === 'workforce' && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Workforce Transformation Metrics</h2>
              <ResponsiveContainer width="100%" height={500}>
                <RadarChart data={workforceData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" stroke="#e5e7eb" />
                  <PolarRadiusAxis stroke="#e5e7eb" />
                  <Radar name="Impact Level" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md rounded-xl p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-blue-200 mb-2">AI Skills Demand</h3>
                <p className="text-5xl font-bold text-blue-400">83%</p>
                <p className="text-blue-200 mt-2">of workers say AI skills impact employability</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md rounded-xl p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-green-200 mb-2">Productivity Gain</h3>
                <p className="text-5xl font-bold text-green-400">125K</p>
                <p className="text-green-200 mt-2">hours of utility capacity unlocked (PNW case)</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md rounded-xl p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-purple-200 mb-2">Safety Improvement</h3>
                <p className="text-5xl font-bold text-purple-400">75%</p>
                <p className="text-purple-200 mt-2">improvement in workplace safety</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Downtime Reduction</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={downtimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#e5e7eb" />
                  <YAxis stroke="#e5e7eb" label={{ value: 'Days per Year', angle: -90, position: 'insideLeft', fill: '#e5e7eb' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="planned" stackId="a" fill="#10b981" name="Planned Maintenance" />
                  <Bar dataKey="unplanned" stackId="a" fill="#ef4444" name="Unplanned Downtime" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 bg-red-500/20 rounded-lg p-4 text-center">
                <p className="text-red-200">
                  <span className="text-4xl font-bold text-red-400">30-50%</span> less unplanned downtime with AI predictive maintenance
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ROI & Savings Tab */}
        {activeTab === 'roi' && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">ROI Timeline Across Case Studies</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={roiData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#e5e7eb" />
                  <YAxis stroke="#e5e7eb" label={{ value: 'Months to ROI', angle: -90, position: 'insideLeft', fill: '#e5e7eb' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    formatter={(value, name) => {
                      if (name === 'Payback Period') return [`${value} months`, name];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="paybackMonths" fill="#f59e0b" name="Payback Period" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Total Savings by Case Study</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={roiData}
                      dataKey="savings"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(props: any) => {
                        // Recharts passes the full payload under props.payload
                        const val = props?.payload?.savings ?? props?.value ?? 0;
                        return `$${(Number(val) / 1000).toFixed(0)}K`;
                      }}
                    >
                      {roiData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Savings']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {roiData.map((item, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">{item.name}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-blue-200 text-sm">Payback Period</p>
                        <p className="text-2xl font-bold text-blue-400">{item.paybackMonths} mo</p>
                      </div>
                      <div>
                        <p className="text-purple-200 text-sm">Total Savings</p>
                        <p className="text-2xl font-bold text-purple-400">${(item.savings / 1000).toFixed(0)}K</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-md rounded-xl p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-green-200 mb-2">Maintenance Cost Reduction</h3>
                <p className="text-5xl font-bold text-green-400">18-25%</p>
                <p className="text-green-200 mt-2">Lower maintenance costs with predictive AI</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-md rounded-xl p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-blue-200 mb-2">Global GDP Impact</h3>
                <p className="text-5xl font-bold text-blue-400">$15.7T</p>
                <p className="text-blue-200 mt-2">AI contribution to global GDP by 2030</p>
              </div>
            </div>
          </div>
        )}

        {/* Technology Comparison Tab */}
        {activeTab === 'technology' && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Technology Platform Comparison</h2>
              <ResponsiveContainer width="100%" height={500}>
                <RadarChart data={techComparisonData[0] ? [
                  { metric: 'Accuracy', ...Object.fromEntries(techComparisonData.map(t => [t.technology, t.accuracy])) },
                  { metric: 'Speed', ...Object.fromEntries(techComparisonData.map(t => [t.technology, t.speed])) },
                  { metric: 'Cost Efficiency', ...Object.fromEntries(techComparisonData.map(t => [t.technology, t.cost])) },
                  { metric: 'Integration', ...Object.fromEntries(techComparisonData.map(t => [t.technology, t.integration])) },
                  { metric: 'Compliance', ...Object.fromEntries(techComparisonData.map(t => [t.technology, t.compliance])) }
                ] : []}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" stroke="#e5e7eb" />
                  <PolarRadiusAxis stroke="#e5e7eb" domain={[0, 100]} />
                  <Radar name="SewerAI" dataKey="SewerAI" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="PipeSleuth" dataKey="PipeSleuth" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Radar name="VAPAR" dataKey="VAPAR" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  <Radar name="GraniteNet" dataKey="GraniteNet" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  <Legend />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {techComparisonData.map((tech, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">{tech.technology}</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-300 text-sm">Accuracy</p>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className={`bg-blue-500 h-2 rounded-full ${pctClass(tech.accuracy)}`} />
                      </div>
                      <p className="text-blue-400 font-bold text-right">{tech.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Speed</p>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className={`bg-green-500 h-2 rounded-full ${pctClass(tech.speed)}`} />
                      </div>
                      <p className="text-green-400 font-bold text-right">{tech.speed}%</p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Cost Efficiency</p>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className={`bg-amber-500 h-2 rounded-full ${pctClass(tech.cost)}`} />
                      </div>
                      <p className="text-amber-400 font-bold text-right">{tech.cost}%</p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Compliance</p>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className={`bg-purple-500 h-2 rounded-full ${pctClass(tech.compliance)}`} />
                      </div>
                      <p className="text-purple-400 font-bold text-right">{tech.compliance}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Key Technology Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-500/20 rounded-lg p-4">
                  <h4 className="text-blue-300 font-bold mb-3">SewerAI AutoCode</h4>
                  <ul className="text-blue-100 space-y-2 text-sm">
                    <li>• 97% defect detection accuracy</li>
                    <li>• Tens of thousands linear ft/hour processing</li>
                    <li>• 3D infrastructure model generation</li>
                    <li>• API-enabled workflow automation</li>
                  </ul>
                </div>
                <div className="bg-green-500/20 rounded-lg p-4">
                  <h4 className="text-green-300 font-bold mb-3">Wipro Pipe Sleuth</h4>
                  <ul className="text-green-100 space-y-2 text-sm">
                    <li>• Deep neural networks</li>
                    <li>• 50+ anomaly types identified</li>
                    <li>• NASSCO PACP compliance</li>
                    <li>• 10x faster video processing</li>
                  </ul>
                </div>
                <div className="bg-amber-500/20 rounded-lg p-4">
                  <h4 className="text-amber-300 font-bold mb-3">VAPAR Solutions</h4>
                  <ul className="text-amber-100 space-y-2 text-sm">
                    <li>• 3M+ images processed</li>
                    <li>• Cloud-based platform</li>
                    <li>• 900 inspections in under 3 days</li>
                    <li>• Real-time defect detection</li>
                  </ul>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-4">
                  <h4 className="text-purple-300 font-bold mb-3">CUES GraniteNet</h4>
                  <ul className="text-purple-100 space-y-2 text-sm">
                    <li>• Automated defect coding service</li>
                    <li>• Wireless field-to-cloud transmission</li>
                    <li>• Actionable timeline generation</li>
                    <li>• 40% consultant cost reduction</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-6 text-center">
            <p className="text-red-200 text-sm font-semibold">Infrastructure Failure Reduction</p>
            <p className="text-5xl font-bold text-red-400 my-2">73%</p>
            <p className="text-red-200 text-xs">with continuous AI monitoring</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-xl p-6 text-center">
            <p className="text-blue-200 text-sm font-semibold">Water Loss Reduction</p>
            <p className="text-5xl font-bold text-blue-400 my-2">25-30%</p>
            <p className="text-blue-200 text-xs">through predictive analytics</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-xl p-6 text-center">
            <p className="text-green-200 text-sm font-semibold">Equipment Life Extension</p>
            <p className="text-5xl font-bold text-green-400 my-2">40%</p>
            <p className="text-green-200 text-xs">via real-time sensor data & ML</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-6 text-center">
            <p className="text-purple-200 text-sm font-semibold">Global Maintenance Savings</p>
            <p className="text-5xl font-bold text-purple-400 my-2">$300B</p>
            <p className="text-purple-200 text-xs">projected by 2030</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISewersDataViz;