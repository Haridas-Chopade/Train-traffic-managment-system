import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaTrain,
  FaClock,
  FaExchangeAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaWrench,
  FaSlidersH,
  FaInfoCircle
} from "react-icons/fa";

export default function TrafficControl() {
  const [data, setData] = useState({
    occupancy: { "1": [], "2": [], "3": [], "4": [] },
    logs: [],
    trains: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedTrain, setSelectedTrain] = useState("");
  const [delayInput, setDelayInput] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTrafficControlData();
    const interval = setInterval(fetchTrafficControlData, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrafficControlData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/traffic-control");
      if (res.data && res.data.success) {
        setData({
          occupancy: res.data.occupancy,
          logs: res.data.logs,
          trains: res.data.trains
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading traffic control data:", err);
    }
  };

  const handleUpdateDelay = async (e) => {
    e.preventDefault();
    if (!selectedTrain) {
      alert("Please select a train first.");
      return;
    }

    setSubmitting(true);
    try {
      const trainObj = data.trains.find(t => t.trainNo === selectedTrain);
      if (!trainObj) return;

      const delayMins = Number(delayInput);
      const newStatus = delayMins > 0 ? "Delayed" : "Running";

      await axios.put(`http://localhost:5000/api/trains/${trainObj._id}`, {
        delay: delayMins,
        status: newStatus
      });

      alert(`Successfully updated delay for ${trainObj.name} to ${delayMins} mins.`);
      setDelayInput(0);
      setSelectedTrain("");
      fetchTrafficControlData();
    } catch (err) {
      console.error("Error updating train delay:", err);
      alert("Failed to update train delay.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: "white", padding: "40px", textAlign: "center", fontSize: "18px" }}>
        🌀 Loading AI Traffic Control Module & Real-time schedules...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
      {/* Overview Dashboard Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px"
      }}>
        <div style={cardStyle("linear-gradient(135deg, #1e1b4b 0%, #311042 100%)", "#818cf8")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", fontWeight: 600, uppercase: "true" }}>Total Managed Trains</p>
              <h2 style={{ margin: "5px 0", fontSize: "28px", color: "white" }}>{data.trains.length}</h2>
            </div>
            <div style={iconContainerStyle("rgba(129, 140, 248, 0.15)", "#818cf8")}>
              <FaTrain size={24} />
            </div>
          </div>
          <p style={{ margin: "10px 0 0 0", fontSize: "12px", color: "#cbd5e1" }}>
            Active divisions: <strong>Mangaluru</strong>
          </p>
        </div>

        <div style={cardStyle("linear-gradient(135deg, #064e3b 0%, #022c22 100%)", "#34d399")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", fontWeight: 600, uppercase: "true" }}>Delayed Trains</p>
              <h2 style={{ margin: "5px 0", fontSize: "28px", color: "#f87171" }}>
                {data.trains.filter(t => t.delay > 0).length}
              </h2>
            </div>
            <div style={iconContainerStyle("rgba(248, 113, 113, 0.15)", "#f87171")}>
              <FaClock size={24} />
            </div>
          </div>
          <p style={{ margin: "10px 0 0 0", fontSize: "12px", color: "#cbd5e1" }}>
            Auto-conflict resolution is <strong style={{ color: "#34d399" }}>ACTIVE</strong>
          </p>
        </div>

        <div style={cardStyle("linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", "#38bdf8")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", fontWeight: 600, uppercase: "true" }}>Active Tracks</p>
              <h2 style={{ margin: "5px 0", fontSize: "28px", color: "white" }}>4</h2>
            </div>
            <div style={iconContainerStyle("rgba(56, 189, 248, 0.15)", "#38bdf8")}>
              <FaExchangeAlt size={24} />
            </div>
          </div>
          <p style={{ margin: "10px 0 0 0", fontSize: "12px", color: "#cbd5e1" }}>
            Mangalore Central Division Layout
          </p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "24px",
        alignItems: "start"
      }}>
        
        {/* Left Side: Track Allocation Timeline Visualizer */}
        <div style={sectionPanelStyle}>
          <h2 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#38bdf8", display: "flex", alignItems: "center", gap: "10px" }}>
            🚦 Dynamic Track Timeline Visualizer (Live Allocation)
          </h2>
          <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "-5px", marginBottom: "20px" }}>
            Hourly allocations for each track. Trains highlighted in <span style={{ color: "#34d399", fontWeight: "bold" }}>Green</span> are on-time, and <span style={{ color: "#f87171", fontWeight: "bold" }}>Red</span> indicates delayed or reassigned schedules.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {["1", "2", "3", "4"].map((trackNo) => {
              const allocations = data.occupancy[trackNo] || [];
              
              return (
                <div key={trackNo} style={{
                  background: "#0b0f19",
                  border: "1px solid #1e293b",
                  borderRadius: "14px",
                  padding: "16px",
                  display: "grid",
                  gridTemplateColumns: "100px 1fr",
                  alignItems: "center",
                  gap: "15px"
                }}>
                  <div style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#f1f5f9",
                    background: "rgba(56, 189, 248, 0.1)",
                    borderLeft: "4px solid #38bdf8",
                    padding: "8px 12px",
                    borderRadius: "6px"
                  }}>
                    Track {trackNo}
                  </div>

                  <div style={{
                    display: "flex",
                    gap: "12px",
                    overflowX: "auto",
                    padding: "4px 0",
                    whiteSpace: "nowrap"
                  }}>
                    {allocations.length === 0 ? (
                      <span style={{ color: "#475569", fontSize: "13px", fontStyle: "italic" }}>No trains scheduled</span>
                    ) : (
                      allocations.map((alloc, i) => {
                        const originalTrain = data.trains.find(t => t.trainNo === alloc.trainNo);
                        const isDelayed = originalTrain && originalTrain.delay > 0;
                        const isReallocated = originalTrain && originalTrain.scheduledPlatform !== trackNo;
                        
                        let bgColor = "rgba(16, 185, 129, 0.15)";
                        let borderColor = "#10b981";
                        let tag = "On Time";

                        if (isDelayed) {
                          bgColor = "rgba(239, 68, 68, 0.15)";
                          borderColor = "#ef4444";
                          tag = `Delayed +${originalTrain.delay}m`;
                        } else if (isReallocated) {
                          bgColor = "rgba(245, 158, 11, 0.15)";
                          borderColor = "#f59e0b";
                          tag = "Reallocated";
                        }

                        return (
                          <div key={i} style={{
                            background: bgColor,
                            border: `1px solid ${borderColor}`,
                            borderRadius: "10px",
                            padding: "10px 14px",
                            fontSize: "13px",
                            color: "white",
                            minWidth: "160px"
                          }}>
                            <div style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
                              🚆 {alloc.trainName}
                            </div>
                            <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "4px" }}>
                              ETA: <strong>{alloc.arrival} - {alloc.departure}</strong>
                            </div>
                            <div style={{
                              fontSize: "10px",
                              marginTop: "6px",
                              display: "inline-block",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: "rgba(0,0,0,0.3)",
                              fontWeight: "bold",
                              color: borderColor
                            }}>
                              {tag}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Simulate delay panel */}
        <div style={sectionPanelStyle}>
          <h2 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#38bdf8", display: "flex", alignItems: "center", gap: "10px" }}>
            <FaSlidersH /> Delay Simulator Control
          </h2>
          <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "-5px", marginBottom: "20px" }}>
            Simulate a train delay to see how the AI Traffic Control room automatically reallocates tracks and resolves conflicts in real-time.
          </p>

          <form onSubmit={handleUpdateDelay} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>
                Select Active Train
              </label>
              <select
                value={selectedTrain}
                onChange={(e) => setSelectedTrain(e.target.value)}
                style={inputStyle}
              >
                <option value="">-- Choose Train --</option>
                {data.trains.map(t => (
                  <option key={t.trainNo} value={t.trainNo}>
                    {t.name} ({t.trainNo}) [Scheduled: Track {t.scheduledPlatform} at {t.arrival}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px", fontWeight: "bold" }}>
                Inject Delay (in minutes)
              </label>
              <input
                type="number"
                min="0"
                max="240"
                value={delayInput}
                onChange={(e) => setDelayInput(e.target.value)}
                style={inputStyle}
                placeholder="e.g. 45"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                border: "none",
                color: "white",
                padding: "14px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)",
                transition: "all 0.2s"
              }}
            >
              {submitting ? "Updating System..." : "Update Live Schedule"}
            </button>
          </form>
        </div>
      </div>

      {/* Live Track Allocations Board */}
      <div style={sectionPanelStyle}>
        <h2 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#38bdf8", display: "flex", alignItems: "center", gap: "10px" }}>
          📊 Comprehensive Live Timetable & Track Allocations
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #334155", color: "#94a3b8" }}>
                <th style={thStyle}>Train</th>
                <th style={thStyle}>Train No.</th>
                <th style={thStyle}>Sched. Platform</th>
                <th style={thStyle}>Sched. Arrival</th>
                <th style={thStyle}>Sched. Departure</th>
                <th style={thStyle}>Current Delay</th>
                <th style={thStyle}>Expected Platform</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.trains.map((train) => {
                const isDelayed = train.delay > 0;
                const isReallocated = train.scheduledPlatform !== train.platform;
                
                let statusBadge = (
                  <span style={badgeStyle("rgba(16, 185, 129, 0.15)", "#10b981")}>
                    On Time
                  </span>
                );

                if (isDelayed) {
                  statusBadge = (
                    <span style={badgeStyle("rgba(239, 68, 68, 0.15)", "#ef4444")}>
                      Delayed
                    </span>
                  );
                } else if (isReallocated) {
                  statusBadge = (
                    <span style={badgeStyle("rgba(245, 158, 11, 0.15)", "#f59e0b")}>
                      Reallocated
                    </span>
                  );
                }

                return (
                  <tr key={train.trainNo} style={{ borderBottom: "1px solid #1e293b", transition: "0.2s", hover: { background: "#1e293b" } }}>
                    <td style={tdStyle}><strong>🚆 {train.name}</strong></td>
                    <td style={tdStyle}>{train.trainNo}</td>
                    <td style={tdStyle}>
                      <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "6px" }}>
                        Track {train.scheduledPlatform}
                      </span>
                    </td>
                    <td style={tdStyle}>{train.arrival}</td>
                    <td style={tdStyle}>{train.departure}</td>
                    <td style={tdStyle}>
                      <span style={{ color: isDelayed ? "#f87171" : "#34d399", fontWeight: "bold" }}>
                        {train.delay} mins
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        background: isReallocated ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)",
                        color: isReallocated ? "#f59e0b" : "#34d399",
                        fontWeight: "bold",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${isReallocated ? "#f59e0b" : "#10b981"}`
                      }}>
                        Track {train.platform}
                      </span>
                    </td>
                    <td style={tdStyle}>{statusBadge}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Traffic Control Logs Feed */}
      <div style={sectionPanelStyle}>
        <h2 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#38bdf8", display: "flex", alignItems: "center", gap: "10px" }}>
          <FaInfoCircle /> AI Control Room Operations Log
        </h2>
        <div style={{
          maxHeight: "300px",
          overflowY: "auto",
          background: "#080c14",
          borderRadius: "12px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          border: "1px solid #1e293b"
        }}>
          {data.logs.length === 0 ? (
            <div style={{ color: "#475569", textAlign: "center", padding: "20px", fontStyle: "italic" }}>
              No operations logs recorded yet. Everything running smoothly.
            </div>
          ) : (
            [...data.logs].reverse().map((log, idx) => {
              const isWarning = log.message.includes("⚠️") || log.message.includes("CRITICAL");
              const isRealloc = log.message.includes("🔄") || log.message.includes("REALLOCATION");
              let color = "#cbd5e1";
              let icon = <FaCheckCircle style={{ color: "#10b981" }} />;

              if (isWarning) {
                color = "#fca5a5";
                icon = <FaExclamationTriangle style={{ color: "#f87171" }} />;
              } else if (isRealloc) {
                color = "#fde047";
                icon = <FaWrench style={{ color: "#f59e0b" }} />;
              }

              return (
                <div key={idx} style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(30, 41, 59, 0.4)",
                  borderLeft: `3px solid ${isWarning ? "#ef4444" : isRealloc ? "#f59e0b" : "#10b981"}`,
                  fontSize: "13px",
                  color: color,
                  display: "flex",
                  gap: "10px",
                  alignItems: "center"
                }}>
                  {icon}
                  <div style={{ flex: 1 }}>
                    <span style={{ color: "#94a3b8", fontSize: "11px", display: "block" }}>{log.time}</span>
                    <span>{log.message}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
    </div>
  );
}

// Styling components
const cardStyle = (gradient, borderColor) => ({
  background: gradient,
  borderRadius: "18px",
  padding: "20px 24px",
  border: `1px solid ${borderColor}44`,
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
});

const iconContainerStyle = (bg, color) => ({
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  background: bg,
  color: color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
});

const sectionPanelStyle = {
  background: "rgba(15, 23, 42, 0.7)",
  backdropFilter: "blur(12px)",
  border: "1px solid #334155",
  padding: "25px",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
};

const inputStyle = {
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "white",
  width: "100%",
  boxSizing: "border-box",
  fontSize: "14px",
  outline: "none",
  transition: "border 0.2s ease"
};

const thStyle = {
  padding: "12px 16px",
  fontSize: "13px",
  fontWeight: "bold",
  color: "#94a3b8"
};

const tdStyle = {
  padding: "16px",
  color: "#e2e8f0"
};

const badgeStyle = (bg, color) => ({
  background: bg,
  color: color,
  padding: "4px 10px",
  borderRadius: "9999px",
  fontSize: "12px",
  fontWeight: "bold",
  display: "inline-block"
});
