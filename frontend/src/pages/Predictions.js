import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  FaBrain,
  FaSearch,
  FaClock,
  FaSlidersH,
  FaCheckCircle,
  FaSyncAlt,
  FaChartBar,
  FaLightbulb,
  FaTachometerAlt
} from "react-icons/fa";

export default function Predictions() {
  const [predictions, setPredictions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());

  // AI Sandbox states
  const [simSpeed, setSimSpeed] = useState(80);
  const [simDensity, setSimDensity] = useState(40);
  const [simResult, setSimResult] = useState(null);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/predictions");
      setPredictions(res.data);
      setIsLive(true);
    } catch (err) {
      console.warn("AI Predictions endpoint failed.", err);
      setIsLive(false);
      setPredictions([]);
    }
    setLastRefreshed(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    loadPredictions();
    const interval = setInterval(loadPredictions, 15000);
    return () => clearInterval(interval);
  }, []);

  // Run simulation sandbox dynamically when inputs change
  useEffect(() => {
    const isDelayed = simSpeed < 65 && simDensity > 70;
    const status = isDelayed ? "Delayed" : "On Time";
    const confidence = isDelayed 
      ? Math.round(82 + (65 - simSpeed) * 0.2 + (simDensity - 70) * 0.1) 
      : Math.round(96 - (simDensity * 0.1) - (120 - simSpeed) * 0.05);
    const estDelay = isDelayed 
      ? Math.round(12 + (70 - simSpeed) * 0.3 + (simDensity - 70) * 0.4) 
      : 0;

    const clampedConfidence = Math.max(50, Math.min(99, confidence));

    let recommendation = "";
    if (isDelayed) {
      if (simDensity > 85) {
        recommendation = "🔴 Critical: Dispatch platform swap & prioritize routing over slow freight trains.";
      } else {
        recommendation = "🟡 Moderate warning: Advise pilot to increase speed to 75km/h where permitted.";
      }
    } else {
      recommendation = "🟢 Nominal: Maintain standard block tracking. No actions required.";
    }

    setSimResult({
      status,
      confidence: clampedConfidence,
      estDelay,
      recommendation
    });
  }, [simSpeed, simDensity]);

  const getRisk = (predictedDelay) => {
    if (predictedDelay > 20) return "High";
    if (predictedDelay > 10) return "Medium";
    return "Low";
  };

  const getRiskColor = (risk) => {
    if (risk === "High") return "#ef4444"; // Red
    if (risk === "Medium") return "#f59e0b"; // Orange
    return "#10b981"; // Emerald Green
  };

  const getRiskBadgeStyle = (risk) => {
    if (risk === "High") return "bg-red-500/10 text-red-400 border border-red-500/20";
    if (risk === "Medium") return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  };

  // Filter list
  const filteredPredictions = predictions.filter((item) => {
    const matchesSearch = 
      item.train.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.trainNo.toString().includes(searchQuery);
    
    const risk = getRisk(item.predictedDelay);
    const matchesRisk = riskFilter === "All" || risk === riskFilter;

    return matchesSearch && matchesRisk;
  });

  // KPI calculations
  const avgConfidence = predictions.length
    ? Math.round(predictions.reduce((acc, curr) => acc + curr.confidence, 0) / predictions.length)
    : 92;

  const highRiskCount = predictions.filter(p => getRisk(p.predictedDelay) === "High").length;
  const mediumRiskCount = predictions.filter(p => getRisk(p.predictedDelay) === "Medium").length;
  const lowRiskCount = predictions.filter(p => getRisk(p.predictedDelay) === "Low").length;

  // Chart 1 Data: Current vs Predicted delay
  const barChartData = predictions.map(p => ({
    name: p.train.split(" ")[0] || p.trainNo,
    "Current Delay": p.currentDelay,
    "Predicted Delay": p.predictedDelay
  }));

  // Chart 2 Data: Risk Distribution
  const pieChartData = [
    { name: "High Risk", value: highRiskCount, color: "#ef4444" },
    { name: "Medium Risk", value: mediumRiskCount, color: "#f59e0b" },
    { name: "Low Risk", value: lowRiskCount, color: "#10b981" }
  ].filter(d => d.value > 0);

  return (
    <div className="flex flex-col gap-6 p-2 text-white font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400">
            🤖 AI Delay Prediction Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Predictive intelligence utilizing speed, signals, and localized traffic density to forecast schedule deviations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
            isLive 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
              : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-400" : "bg-amber-400"}`}></span>
            {isLive ? "AI ENGINE ONLINE" : "AI FALLBACK ONLINE"}
          </div>

          <button
            onClick={loadPredictions}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all duration-200 text-sm cursor-pointer"
          >
            <FaSyncAlt className={`text-slate-400 ${loading ? "animate-spin" : ""}`} size={12} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-lg">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Trains Tracked</span>
          <div className="text-3xl font-bold mt-1.5">{predictions.length}</div>
          <p className="text-[10px] text-slate-500 mt-1 select-none">Monitored railway network lines</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-lg">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Avg Confidence</span>
          <div className="text-3xl font-bold mt-1.5 text-cyan-400">{avgConfidence}%</div>
          <p className="text-[10px] text-slate-500 mt-1 select-none">AI accuracy matrix verification</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-lg">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">High Risk Alerts</span>
          <div className={`text-3xl font-bold mt-1.5 ${highRiskCount > 0 ? "text-red-400 animate-pulse" : "text-white"}`}>
            {highRiskCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 select-none">Predicted delays &gt; 20 minutes</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-lg">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Platform Forecast</span>
          <div className="text-3xl font-bold mt-1.5 text-emerald-400">84%</div>
          <p className="text-[10px] text-slate-500 mt-1 select-none">Station capacity utility index</p>
        </div>
      </div>

      {/* Analytics & Charts section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Delay forecast chart */}
        <div className="xl:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between min-h-[340px]">
          <div className="flex items-center gap-2 mb-4 select-none">
            <FaChartBar className="text-teal-400" />
            <h2 className="text-base font-bold text-slate-200">Delay Variance Comparison (mins)</h2>
          </div>
          <div className="flex-1 w-full h-[250px]">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px", color: "white" }} 
                    itemStyle={{ fontSize: "12px" }}
                    labelStyle={{ fontSize: "12px", fontWeight: "bold", color: "#38bdf8" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="Current Delay" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Predicted Delay" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm select-none">No chart data available</div>
            )}
          </div>
        </div>

        {/* Risk profile pie chart */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col min-h-[340px]">
          <div className="flex items-center gap-2 mb-4 select-none">
            <FaBrain className="text-teal-400" />
            <h2 className="text-base font-bold text-slate-200">Network Risk Breakdown</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {pieChartData.length > 0 ? (
              <div className="w-full h-[180px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px", color: "white" }} 
                      itemStyle={{ fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black">{predictions.length}</span>
                  <span className="text-[10px] uppercase text-slate-500 tracking-wider">Trains</span>
                </div>
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-slate-500 text-sm select-none">No metrics</div>
            )}

            {/* Legend checklist */}
            <div className="flex justify-center gap-4 mt-3 text-xs w-full">
              {pieChartData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 select-none">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-slate-400">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Sandbox */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        {/* Glow background accent */}
        <div className="absolute -right-24 -bottom-24 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-2 mb-4 select-none">
          <FaSlidersH className="text-emerald-400" />
          <h2 className="text-base font-bold text-slate-200">AI Operator Sandbox (Delay Assessment Simulation)</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Sliders container */}
          <div className="lg:col-span-2 flex flex-col gap-5 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
            {/* Speed slider */}
            <div>
              <div className="flex justify-between items-center text-sm mb-1.5">
                <span className="text-slate-400 flex items-center gap-1.5 select-none">
                  <FaTachometerAlt size={12} className="text-slate-550" /> Planned Train Speed:
                </span>
                <span className="font-mono text-emerald-400 font-bold">{simSpeed} km/h</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                value={simSpeed}
                onChange={(e) => setSimSpeed(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 select-none font-mono">
                <span>20 km/h (Slow/Bottleneck)</span>
                <span>120 km/h (Peak Track Speed)</span>
              </div>
            </div>

            {/* Density slider */}
            <div>
              <div className="flex justify-between items-center text-sm mb-1.5">
                <span className="text-slate-400 flex items-center gap-1.5 select-none">
                  <FaClock size={12} className="text-slate-550" /> Section Traffic Density:
                </span>
                <span className="font-mono text-emerald-400 font-bold">{simDensity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={simDensity}
                onChange={(e) => setSimDensity(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 select-none font-mono">
                <span>10% (Clear Line)</span>
                <span>100% (Congested Block Gridlock)</span>
              </div>
            </div>
          </div>

          {/* Results display */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 shadow-md h-full flex flex-col justify-between gap-3">
            {simResult ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-450 text-xs font-semibold select-none font-sans">Forecast Status</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    simResult.status === "Delayed" 
                      ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {simResult.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-1">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase select-none font-sans">Sim Delay</span>
                    <span className={`text-xl font-bold font-mono ${simResult.estDelay > 0 ? "text-amber-400" : "text-slate-400"}`}>
                      +{simResult.estDelay} mins
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase select-none font-sans">Inference Confidence</span>
                    <span className="text-xl font-bold text-cyan-400 font-mono">
                      {simResult.confidence}%
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 flex items-start gap-1.5">
                  <FaLightbulb className="text-amber-400 mt-0.5 flex-shrink-0" size={12} />
                  <div>
                    <span className="text-[9px] uppercase text-slate-500 font-bold block select-none font-sans font-sans">Recommendation</span>
                    <p className="text-[11px] text-slate-300 leading-normal mt-0.5">
                      {simResult.recommendation}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs py-10 select-none">Calculating variables...</div>
            )}
          </div>
        </div>
      </div>

      {/* Predictions list / Table section */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
        {/* Controls row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <FaSearch size={12} />
            </span>
            <input
              type="text"
              placeholder="Search train name/number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto select-none">
            <span className="text-slate-400 text-[11px] mr-1.5 whitespace-nowrap">Risk Category:</span>
            {["All", "High", "Medium", "Low"].map((level) => (
              <button
                key={level}
                onClick={() => setRiskFilter(level)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
                  riskFilter === level
                    ? "bg-emerald-600/25 text-emerald-400 border-emerald-500/35"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Forecast Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredPredictions.map((item) => {
              const risk = getRisk(item.predictedDelay);
              const riskColor = getRiskColor(risk);
              const badgeStyle = getRiskBadgeStyle(risk);

              return (
                <motion.div
                  key={item.trainNo}
                  layoutId={item.trainNo}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md transition-shadow hover:shadow-lg relative overflow-hidden group"
                  style={{ borderLeft: `4px solid ${riskColor}` }}
                >
                  {/* Subtle top light bar */}
                  <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-200 leading-tight">{item.train}</h3>
                      <span className="text-[10px] text-slate-550 font-mono mt-0.5 block select-none">Line No: #{item.trainNo}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide select-none ${badgeStyle}`}>
                      {risk} Risk
                    </span>
                  </div>

                  {/* Delay display */}
                  <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 grid grid-cols-2 gap-1.5 text-center text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase select-none">Current</span>
                      <span className="font-semibold text-slate-350">{item.currentDelay} mins</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase select-none">AI Forecasted</span>
                      <span className="font-semibold" style={{ color: riskColor }}>
                        {item.predictedDelay} mins
                      </span>
                    </div>
                  </div>

                  {/* Speed & density bars */}
                  <div className="flex flex-col gap-2 text-[11px]">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5 select-none">
                        <span>Line Speed</span>
                        <span className="font-mono text-slate-300 font-bold">{item.speed} km/h</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-sky-500 rounded-full" 
                          style={{ width: `${(item.speed / 120) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5 select-none">
                        <span>Traffic Density</span>
                        <span className="font-mono text-slate-300 font-bold">{item.trafficDensity}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${item.trafficDensity}%`,
                            backgroundColor: item.trafficDensity > 70 ? "#ef4444" : item.trafficDensity > 40 ? "#f59e0b" : "#10b981" 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Rating footer */}
                  <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1 select-none">
                      <FaBrain className="text-slate-500" size={10} /> AI Confidence:
                    </span>
                    <strong className="text-cyan-400 font-mono">{item.confidence}%</strong>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredPredictions.length === 0 && (
            <div className="col-span-full bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm py-12">
              <FaCheckCircle className="mx-auto text-slate-500 mb-2" size={24} />
              <p className="font-semibold text-slate-300">No predictions matching filters</p>
              <p className="text-xs text-slate-500 mt-1 select-none">Try modifying your search term or selecting another risk category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}