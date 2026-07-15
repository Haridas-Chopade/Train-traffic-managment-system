import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaExclamationTriangle,
  FaBell,
  FaSearch,
  FaCheck,
  FaUndo,
  FaSyncAlt,
  FaFilter,
  FaClock,
  FaCheckCircle,
  FaVolumeMute,
  FaVolumeUp,
  FaHistory
} from "react-icons/fa";

const MOCK_ALERTS = [
  { train: "Mangalore - Bengaluru Express (16512)", delay: 45, platform: "2" },
  { train: "Chennai Express (12601)", delay: 25, platform: "1" },
  { train: "Matsyagandha Express (12620)", delay: 8, platform: "3" },
  { train: "Karwar - Yesvantpur Express (16516)", delay: 35, platform: "2" },
  { train: "Malabar Express (16629)", delay: 12, platform: "4" }
];

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [acknowledged, setAcknowledged] = useState(() => {
    const saved = localStorage.getItem("acknowledged_alerts");
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("active"); // "active" or "acknowledged"
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem("alerts_muted") === "true";
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [isLive, setIsLive] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());

  const prevAlertsLengthRef = useRef(0);

  // Play audio chime for new critical alerts
  const playChime = () => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.12); // A5
      
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("AudioContext failed", e);
    }
  };

  const loadAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/alerts");
      setAlerts(res.data);
      setIsLive(true);
      
      // If there are more active alerts now than before, play chime
      const activeCount = res.data.filter(a => !isAcked(a)).length;
      if (activeCount > prevAlertsLengthRef.current) {
        // Find if any new alert is critical
        const hasNewCritical = res.data
          .filter(a => !isAcked(a))
          .some(a => a.delay > 30);
        if (hasNewCritical) {
          playChime();
        }
      }
      prevAlertsLengthRef.current = activeCount;
    } catch (err) {
      console.warn("Backend offline, loading mock alerts", err);
      setIsLive(false);
      setAlerts(MOCK_ALERTS);
    }
    setLastRefreshed(new Date().toLocaleTimeString());
    setCountdown(10);
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  // Countdown timer for auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadAlerts();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  // Persist acknowledged alerts
  useEffect(() => {
    localStorage.setItem("acknowledged_alerts", JSON.stringify(acknowledged));
  }, [acknowledged]);

  // Persist mute settings
  useEffect(() => {
    localStorage.setItem("alerts_muted", isMuted.toString());
  }, [isMuted]);

  const getAlertId = (alert) => {
    return `${alert.train}-${alert.delay}-${alert.platform}`;
  };

  const isAcked = (alert) => {
    return acknowledged.some(ack => ack.id === getAlertId(alert));
  };

  const handleAcknowledge = (alert) => {
    const id = getAlertId(alert);
    if (!acknowledged.some(ack => ack.id === id)) {
      setAcknowledged(prev => [
        ...prev,
        {
          id,
          train: alert.train,
          delay: alert.delay,
          platform: alert.platform,
          ackTime: new Date().toLocaleTimeString()
        }
      ]);
    }
  };

  const handleRestore = (alertId) => {
    setAcknowledged(prev => prev.filter(ack => ack.id !== alertId));
  };

  const handleAcknowledgeAll = (visibleAlerts) => {
    const newAcks = visibleAlerts
      .filter(a => !isAcked(a))
      .map(a => ({
        id: getAlertId(a),
        train: a.train,
        delay: a.delay,
        platform: a.platform,
        ackTime: new Date().toLocaleTimeString()
      }));
    if (newAcks.length > 0) {
      setAcknowledged(prev => [...prev, ...newAcks]);
    }
  };

  const handleClearAcknowledged = () => {
    setAcknowledged([]);
  };

  const getColor = (delay) => {
    if (delay > 30) return "#ef4444"; // Red
    if (delay > 10) return "#f59e0b"; // Amber
    return "#38bdf8"; // Cyan/Blue
  };

  const getLevel = (delay) => {
    if (delay > 30) return "Critical";
    if (delay > 10) return "Warning";
    return "Info";
  };

  const getBadgeStyle = (delay) => {
    if (delay > 30) return "bg-red-500/10 text-red-400 border border-red-500/20";
    if (delay > 10) return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
  };

  const getCardGlow = (delay) => {
    if (delay > 30) return "shadow-[0_0_15px_rgba(239,68,68,0.15)] border-red-500/30";
    if (delay > 10) return "shadow-[0_0_15px_rgba(245,158,11,0.1)] border-amber-500/30";
    return "shadow-[0_0_15px_rgba(56,189,248,0.1)] border-sky-500/30";
  };

  // Filter alerts based on selection and search
  const activeAlertsList = alerts.filter(a => !isAcked(a));
  
  const filteredActiveAlerts = activeAlertsList.filter(alert => {
    const matchesSearch = alert.train.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          alert.platform.toString().includes(searchQuery);
    const matchesLevel = levelFilter === "All" || getLevel(alert.delay) === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const filteredAckAlerts = acknowledged.filter(alert => {
    const matchesSearch = alert.train.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          alert.platform.toString().includes(searchQuery);
    const matchesLevel = levelFilter === "All" || getLevel(alert.delay) === levelFilter;
    return matchesSearch && matchesLevel;
  });

  // Calculate counts for stats
  const activeCritical = activeAlertsList.filter(a => a.delay > 30).length;
  const activeWarning = activeAlertsList.filter(a => a.delay > 10 && a.delay <= 30).length;
  const activeInfo = activeAlertsList.filter(a => a.delay <= 10).length;

  return (
    <div className="flex flex-col gap-6 p-2 text-white">
      {/* Title & Connection Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-400 font-sans">
            🚨 Smart Alert Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time control room warning system. Dispatch operations, track platform shifts and delays.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Pill */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
            isLive 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
              : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-400" : "bg-amber-400"}`}></span>
            {isLive ? "LIVE DATA" : "LOCAL SIMULATION"}
          </div>

          {/* Sound Control */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2.5 rounded-lg border transition-all duration-300 hover:scale-105 cursor-pointer ${
              isMuted 
                ? "bg-slate-800 text-slate-400 border-slate-700" 
                : "bg-blue-600/20 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]"
            }`}
            title={isMuted ? "Unmute warning signals" : "Mute warning signals"}
          >
            {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
          </button>

          {/* Refresh Action */}
          <button
            onClick={loadAlerts}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:border-slate-600 transition-all duration-200 text-sm cursor-pointer"
          >
            <FaSyncAlt className={`text-slate-400 ${autoRefresh && countdown === 10 ? "animate-spin" : ""}`} size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Alerts */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute right-0 top-0 -mr-2 -mt-2 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all duration-300"></div>
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Active Alerts</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold">{activeAlertsList.length}</span>
            <span className="text-slate-505 text-xs">incidents</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${alerts.length ? (activeAlertsList.length / alerts.length) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute right-0 top-0 -mr-2 -mt-2 w-16 h-16 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-all duration-300"></div>
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Critical Delays</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-3xl font-bold ${activeCritical > 0 ? "text-red-400 animate-pulse" : "text-white"}`}>
              {activeCritical}
            </span>
            <span className="text-slate-500 text-xs">&gt;30 mins</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-red-500 h-full rounded-full" style={{ width: `${activeAlertsList.length ? (activeCritical / activeAlertsList.length) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Warnings */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute right-0 top-0 -mr-2 -mt-2 w-16 h-16 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all duration-300"></div>
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Warnings</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-amber-400">{activeWarning}</span>
            <span className="text-slate-500 text-xs">11-30 mins</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${activeAlertsList.length ? (activeWarning / activeAlertsList.length) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Acknowledged Count */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute right-0 top-0 -mr-2 -mt-2 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all duration-300"></div>
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Acknowledged</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-emerald-400">{acknowledged.length}</span>
            <span className="text-slate-500 text-xs">archived</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(activeAlertsList.length + acknowledged.length) ? (acknowledged.length / (activeAlertsList.length + acknowledged.length)) * 100 : 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* Control Panel: Filters, Search, Tabs & Auto Refresh bar */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-4">
        {/* Row 1: Search & Filter Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <FaSearch size={14} />
            </span>
            <input
              type="text"
              placeholder="Search train name or platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all duration-300"
            />
          </div>

          {/* Level Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 text-xs mr-2 flex items-center gap-1.5 select-none">
              <FaFilter size={10} /> Filter Level:
            </span>
            {["All", "Critical", "Warning", "Info"].map((level) => (
              <button
                key={level}
                onClick={() => setLevelFilter(level)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                  levelFilter === level
                    ? "bg-blue-600/20 text-blue-400 border-blue-500/40 shadow-sm"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-800/60"></div>

        {/* Row 2: Tabs, Acknowledge All, Auto Refresh Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Active vs Acknowledged Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800/60 self-start">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-205 cursor-pointer ${
                activeTab === "active"
                  ? "bg-slate-800 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FaBell className={activeAlertsList.length > 0 ? "text-amber-400 animate-pulse" : "text-slate-500"} size={13} />
              <span>Active Alerts</span>
              <span className="px-1.5 py-0.5 text-xs bg-slate-900 border border-slate-800 text-slate-300 rounded font-sans">
                {filteredActiveAlerts.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("acknowledged")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "acknowledged"
                  ? "bg-slate-800 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FaHistory className="text-slate-400" size={13} />
              <span>Acknowledged Log</span>
              <span className="px-1.5 py-0.5 text-xs bg-slate-900 border border-slate-800 text-slate-300 rounded font-sans">
                {filteredAckAlerts.length}
              </span>
            </button>
          </div>

          {/* Action buttons / Auto Refresh Status */}
          <div className="flex items-center gap-4 flex-wrap md:justify-end">
            {/* Auto refresh info */}
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/50">
              <span 
                className={`w-1.5 h-1.5 rounded-full cursor-pointer ${autoRefresh ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`}
                onClick={() => setAutoRefresh(!autoRefresh)}
                title="Toggle Auto Refresh"
              ></span>
              <span className="select-none">
                {autoRefresh ? `Auto-syncing in ${countdown}s` : "Auto-sync paused"}
              </span>
              <span className="text-slate-650">|</span>
              <span className="font-mono text-[10px] select-none">Synced {lastRefreshed}</span>
            </div>

            {/* Quick Actions */}
            {activeTab === "active" ? (
              filteredActiveAlerts.length > 0 && (
                <button
                  onClick={() => handleAcknowledgeAll(filteredActiveAlerts)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold rounded-lg transition-all duration-200 text-slate-300 cursor-pointer hover:text-white"
                >
                  <FaCheckCircle className="text-emerald-500" size={12} />
                  Acknowledge Page ({filteredActiveAlerts.length})
                </button>
              )
            ) : (
              filteredAckAlerts.length > 0 && (
                <button
                  onClick={handleClearAcknowledged}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/35 text-xs font-semibold rounded-lg transition-all duration-205 text-red-400 cursor-pointer"
                >
                  Clear Archives
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main Alert List Display */}
      <div>
        <AnimatePresence mode="wait">
          {activeTab === "active" ? (
            /* Active Alerts View */
            <motion.div
              key="active-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              {filteredActiveAlerts.length === 0 ? (
                /* Empty State: System Clear */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 relative overflow-hidden shadow-inner"
                >
                  {/* Pulsing Radar Effect */}
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <span className="absolute w-12 h-12 bg-emerald-500/10 rounded-full border border-emerald-500/20 animate-ping duration-2000"></span>
                    <span className="absolute w-16 h-16 bg-emerald-500/5 rounded-full border border-emerald-500/10 animate-ping duration-1500"></span>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/35 flex items-center justify-center text-emerald-400 font-bold text-lg">
                      ✓
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-200 font-sans">All Systems Nominal</h3>
                    <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
                      No active train delays or platform scheduling conflict alerts detected. Network is operating smoothly.
                    </p>
                  </div>
                </motion.div>
              ) : (
                /* Alerts List */
                <div className="flex flex-col gap-3.5">
                  <AnimatePresence>
                    {filteredActiveAlerts.map((alert) => {
                      const id = getAlertId(alert);
                      const level = getLevel(alert.delay);
                      const levelColor = getColor(alert.delay);
                      const levelBadge = getBadgeStyle(alert.delay);
                      const cardGlow = getCardGlow(alert.delay);

                      return (
                        <motion.div
                          key={id}
                          layoutId={id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 50, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className={`bg-slate-900/60 backdrop-blur border-l-4 p-4 rounded-r-xl rounded-l-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:bg-slate-900/80 hover:border-l-[6px] ${cardGlow}`}
                          style={{ borderLeftColor: levelColor }}
                        >
                          <div className="flex items-start md:items-center gap-3.5">
                            {/* Alert Level Icon */}
                            <div className="mt-1 md:mt-0">
                              <span
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${levelColor}15`, color: levelColor }}
                              >
                                <FaExclamationTriangle size={15} className={level === "Critical" ? "animate-pulse" : ""} />
                              </span>
                            </div>

                            {/* Train Info details */}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-bold text-slate-200 font-sans">
                                  {alert.train}
                                </h3>
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${levelBadge}`}>
                                  {level}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-slate-400 text-xs mt-1.5 flex-wrap">
                                <span className="flex items-center gap-1 select-none">
                                  <FaClock size={11} className="text-slate-500" />
                                  Delay: <strong style={{ color: levelColor }}>{alert.delay} mins</strong>
                                </span>
                                <span className="select-none">•</span>
                                <span className="select-none">
                                  Platform: <strong className="text-slate-300">{alert.platform}</strong>
                                </span>
                                <span className="select-none">•</span>
                                <span className="text-[10px] text-slate-500 font-mono select-none">
                                  Dispatched: {lastRefreshed}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex items-center gap-2 self-end md:self-center">
                            <button
                              onClick={() => handleAcknowledge(alert)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-600 transition-all duration-300 rounded-lg text-xs font-semibold cursor-pointer group"
                            >
                              <FaCheck size={11} className="group-hover:scale-125 transition-transform duration-200" />
                              <span>Acknowledge</span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ) : (
            /* Acknowledged Log View */
            <motion.div
              key="ack-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              {filteredAckAlerts.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-12 text-center text-slate-400 text-sm">
                  <FaHistory className="mx-auto text-slate-500 mb-3" size={28} />
                  <p className="font-semibold text-slate-300 font-sans">Acknowledged Log Empty</p>
                  <p className="text-xs mt-1 max-w-xs mx-auto text-slate-500">
                    Once you mark active alerts as resolved, they will appear here in the system archive.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <AnimatePresence>
                    {filteredAckAlerts.map((ackAlert) => {
                      return (
                        <motion.div
                          key={ackAlert.id}
                          layoutId={ackAlert.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -50, scale: 0.95 }}
                          className="bg-slate-900/30 border border-slate-800/70 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-slate-900/40"
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <span className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 text-slate-500">
                                <FaCheckCircle size={15} />
                              </span>
                            </div>

                            <div>
                              <h3 className="text-sm font-semibold text-slate-300 line-through decoration-slate-600 font-sans">
                                {ackAlert.train}
                              </h3>
                              <div className="flex items-center gap-3 text-slate-500 text-xs mt-1 select-none font-sans">
                                <span>Platform: {ackAlert.platform}</span>
                                <span>•</span>
                                <span>Delay: {ackAlert.delay}m</span>
                                <span>•</span>
                                <span className="text-[10px] text-slate-600 font-mono">
                                  Acked: {ackAlert.ackTime}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-center">
                            <button
                              onClick={() => handleRestore(ackAlert.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all rounded-lg text-xs cursor-pointer"
                              title="Restore alert to active warnings"
                            >
                              <FaUndo size={10} />
                              <span>Restore</span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}