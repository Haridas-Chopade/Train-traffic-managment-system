import { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  FaTrain,
  FaClock,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaBrain,
  FaDatabase,
  FaCompass,
  FaSignal,
  FaChevronRight
} from "react-icons/fa";

// Create custom train icons using DivIcon to avoid asset 404 bugs and support premium styling
const createTrainIcon = (status) => {
  const color = status === "Delayed" ? "#ef4444" : "#10b981";
  const shadowColor = status === "Delayed" ? "rgba(239, 68, 68, 0.6)" : "rgba(16, 185, 129, 0.6)";
  return L.divIcon({
    className: "custom-train-marker",
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        background: #0f172a;
        border: 2px solid ${color};
        border-radius: 50%;
        box-shadow: 0 0 12px ${shadowColor};
        font-size: 20px;
        position: relative;
        cursor: pointer;
        transition: all 0.3s ease;
      ">
        🚆
        <span style="
          position: absolute;
          width: 8px;
          height: 8px;
          background: ${color};
          border-radius: 50%;
          bottom: -1px;
          right: -1px;
          box-shadow: 0 0 6px ${shadowColor};
          animation: pulse 1.8s infinite ease-in-out;
        "></span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19]
  });
};

// Custom Station marker icon
const stationIcon = L.divIcon({
  className: "custom-station-marker",
  html: `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: #1e293b;
      border: 2px solid #38bdf8;
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
      font-size: 11px;
    ">
      🚉
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, zoom || 10);
    }
  }, [center, zoom, map]);
  return null;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeTrains: 0,
    delayedTrains: 0,
    criticalAlerts: 0,
    station: "MAQ",
  });
  const [trains, setTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [mapCenter, setMapCenter] = useState([12.8626, 74.8436]);
  const [mapZoom, setMapZoom] = useState(10);
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [sysStatus, setSysStatus] = useState({
    db: "online",
    ai: "online",
    gps: "active"
  });
  const [hasCentered, setHasCentered] = useState(false);

  useEffect(() => {
    loadData();

    // Fast interval for coordinate movement simulation (3 seconds)
    const dataInterval = setInterval(loadData, 3000);

    const clockInterval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(clockInterval);
    };
  }, []);

  useEffect(() => {
    if (trains.length > 0 && !hasCentered) {
      const lats = trains.map(t => Number(t.currentLat)).filter(l => !isNaN(l) && l !== 0);
      const lngs = trains.map(t => Number(t.currentLng)).filter(l => !isNaN(l) && l !== 0);
      if (lats.length > 0 && lngs.length > 0) {
        const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
        const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const diff = maxLat - minLat;
        
        setMapCenter([avgLat, avgLng]);
        setMapZoom(diff > 3 ? 5 : 9);
        setHasCentered(true);
      }
    }
  }, [trains, hasCentered]);

  const loadData = async () => {
    try {
      // Load stats
      const statsRes = await axios.get("http://localhost:5000/api/dashboard");
      setStats(statsRes.data);
      setSysStatus(prev => ({ ...prev, db: "online" }));
    } catch (err) {
      console.error("Dashboard stats load error", err);
      setSysStatus(prev => ({ ...prev, db: "offline" }));
    }

    try {
      // Load trains and their predictions
      const trainsRes = await axios.get("http://localhost:5000/api/trains");
      let predictionsRes = { data: [] };
      try {
        predictionsRes = await axios.get("http://localhost:5000/api/predictions");
        setSysStatus(prev => ({ ...prev, ai: "online" }));
      } catch (predErr) {
        console.warn("AI Model prediction endpoint failed. Using fallback simulation.", predErr.message);
        setSysStatus(prev => ({ ...prev, ai: "fallback" }));
      }

      // Merge train documents with prediction data
      const mergedTrains = trainsRes.data.map(train => {
        const prediction = predictionsRes.data.find(p => p.trainNo === train.trainNo) || {
          currentDelay: train.delay || 0,
          predictedDelay: (train.speed < 65 && train.trafficDensity > 70) ? (train.delay || 0) + 12 : (train.delay || 0),
          confidence: 85,
          status: (train.speed < 65 && train.trafficDensity > 70) ? "Delayed" : "On Time"
        };
        return {
          ...train,
          ...prediction
        };
      });

      setTrains(mergedTrains);
    } catch (err) {
      console.error("Train data load error", err);
    }
  };

  const getRiskColor = (delay) => {
    if (delay > 20) return "#ef4444";
    if (delay > 5) return "#f59e0b";
    return "#10b981";
  };

  const getSafeCoords = (t) => {
    const lat = Number(t.currentLat);
    const lng = Number(t.currentLng);
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      return [12.8626, 74.8436]; // Default: Mangalore Central
    }
    return [lat, lng];
  };

  const focusTrain = (train) => {
    setSelectedTrain(train);
    setMapCenter(getSafeCoords(train));
    setMapZoom(12);
  };

  const cards = [
    {
      title: "Active Monitored",
      value: stats.activeTrains,
      icon: <FaTrain size={24} />,
      color: "#38bdf8",
      glow: "rgba(56, 189, 248, 0.25)"
    },
    {
      title: "AI Predicted Delay",
      value: stats.delayedTrains,
      icon: <FaClock size={24} />,
      color: "#fbbf24",
      glow: "rgba(251, 191, 36, 0.25)"
    },
    {
      title: "Critical Alerts",
      value: stats.criticalAlerts,
      icon: <FaExclamationTriangle size={24} />,
      color: "#f87171",
      glow: "rgba(248, 113, 113, 0.25)"
    },
    {
      title: "Control Station",
      value: stats.station,
      icon: <FaMapMarkerAlt size={24} />,
      color: "#34d399",
      glow: "rgba(52, 211, 153, 0.25)"
    },
  ];

  return (
    <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Top Banner with Clock and Diagnostics */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(30,41,59,0.7), rgba(15,23,42,0.8))",
          backdropFilter: "blur(12px)",
          border: "1px solid #334155",
          padding: "18px 25px",
          borderRadius: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          boxShadow: "0 8px 32px 0 rgba(0,0,0,0.37)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ fontSize: "24px", animation: "float 4s ease-in-out infinite" }}>🏢</div>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", color: "#94a3b8" }}>Control Center Time</h3>
            <span style={{ fontSize: "20px", fontWeight: "bold", fontFamily: "monospace", color: "#38bdf8" }}>{time}</span>
          </div>
        </div>

        {/* Diagnostics widgets */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#0f172a", padding: "8px 12px", borderRadius: "10px", border: "1px solid #1e293b" }}>
            <FaDatabase style={{ color: sysStatus.db === "online" ? "#10b981" : "#ef4444" }} />
            <span style={{ fontSize: "13px" }}>DB: <strong style={{ color: sysStatus.db === "online" ? "#10b981" : "#ef4444" }}>{sysStatus.db.toUpperCase()}</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#0f172a", padding: "8px 12px", borderRadius: "10px", border: "1px solid #1e293b" }}>
            <FaBrain style={{ color: sysStatus.ai === "online" ? "#10b981" : sysStatus.ai === "fallback" ? "#fbbf24" : "#ef4444" }} />
            <span style={{ fontSize: "13px" }}>AI MODEL: <strong style={{ color: sysStatus.ai === "online" ? "#10b981" : sysStatus.ai === "fallback" ? "#fbbf24" : "#ef4444" }}>{sysStatus.ai.toUpperCase()}</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#0f172a", padding: "8px 12px", borderRadius: "10px", border: "1px solid #1e293b" }}>
            <FaCompass style={{ color: "#38bdf8" }} />
            <span style={{ fontSize: "13px" }}>GPS ENGINE: <strong style={{ color: "#38bdf8" }}>ACTIVE</strong></span>
          </div>
        </div>
      </div>

      {/* Grid for Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            style={{
              background: "rgba(15,23,42,0.6)",
              backdropFilter: "blur(10px)",
              border: `1px solid rgba(255,255,255,0.06)`,
              borderRadius: "20px",
              padding: "24px",
              color: "white",
              boxShadow: `0 4px 20px ${card.glow}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "transform 0.3s ease, border 0.3s ease",
              cursor: "default"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.border = `1px solid ${card.color}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)";
            }}
          >
            <div>
              <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 8px 0" }}>{card.title}</p>
              <h2 style={{ fontSize: "32px", margin: 0, fontWeight: "800", background: `linear-gradient(45deg, #fff, ${card.color})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {card.value}
              </h2>
            </div>
            <div style={{ color: card.color, background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "14px" }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Map and Side Panel Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2.2fr 1fr",
          gap: "24px",
          alignItems: "stretch"
        }}
      >
        {/* Real-time Map */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid #334155",
            borderRadius: "24px",
            padding: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            gap: "15px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "18px", color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaCompass style={{ color: "#38bdf8", animation: "spin 6s linear infinite" }} /> Real-Time Live Train Traffic Map
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#94a3b8" }}>
              <span style={{ display: "inline-block", width: "10px", height: "10px", background: "#22c55e", borderRadius: "50%" }}></span> On Time
              <span style={{ display: "inline-block", width: "10px", height: "10px", background: "#ef4444", borderRadius: "50%", marginLeft: "8px" }}></span> Delayed
            </div>
          </div>

          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{
              height: "440px",
              width: "100%",
              borderRadius: "16px",
              border: "1px solid #1e293b"
            }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap center={mapCenter} zoom={mapZoom} />
            
            {/* Draw Mangalore Central station pin */}
            <Marker position={[12.8626, 74.8436]} icon={stationIcon}>
              <Popup>
                <div style={{ color: "#000", fontWeight: "bold" }}>
                  Mangalore Central Station (MAQ)
                  <br />
                  <span style={{ fontWeight: "normal", color: "#666" }}>Hub Station</span>
                </div>
              </Popup>
            </Marker>

            {/* Draw other station waypoints & polyline tracks for active trains */}
            {trains.map((train) => {
              const routeCoords = train.route 
                ? train.route
                    .map(r => [Number(r.lat), Number(r.lng)])
                    .filter(coords => !isNaN(coords[0]) && !isNaN(coords[1]) && coords[0] !== 0 && coords[1] !== 0)
                : [];
              const isSelected = selectedTrain && selectedTrain.trainNo === train.trainNo;
              const color = train.status === "Delayed" ? "#f87171" : "#38bdf8";

              return (
                <div key={train.trainNo}>
                  {/* Route Track */}
                  {routeCoords.length > 0 && (
                    <Polyline
                      positions={routeCoords}
                      pathOptions={{
                        color: color,
                        weight: isSelected ? 4 : 2,
                        opacity: isSelected ? 0.9 : 0.45,
                        dashArray: isSelected ? "None" : "4, 6"
                      }}
                    />
                  )}

                  {/* Train Moving Pin */}
                  <Marker
                    position={getSafeCoords(train)}
                    icon={createTrainIcon(train.status)}
                  >
                    <Popup>
                      <div style={{ color: "#0f172a", fontFamily: "sans-serif", width: "180px" }}>
                        <h4 style={{ margin: "0 0 6px 0", color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
                          🚆 {train.name}
                        </h4>
                        <p style={{ margin: "2px 0", fontSize: "12px" }}><strong>Train No:</strong> {train.trainNo}</p>
                        <p style={{ margin: "2px 0", fontSize: "12px" }}>
                          <strong>AI Prediction:</strong> 
                          <span style={{ color: train.status === "Delayed" ? "#ef4444" : "#10b981", fontWeight: "bold" }}> {train.status}</span>
                        </p>
                        <p style={{ margin: "2px 0", fontSize: "12px" }}><strong>Confidence:</strong> {train.confidence}%</p>
                        <p style={{ margin: "2px 0", fontSize: "12px" }}><strong>Current Delay:</strong> {train.delay} mins</p>
                        <p style={{ margin: "2px 0", fontSize: "12px" }}><strong>Platform:</strong> {train.platform}</p>
                        <p style={{ margin: "2px 0", fontSize: "12px" }}><strong>Speed:</strong> {train.speed} km/h</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Draw route stations pins */}
                  {train.route && train.route
                    .filter(station => station && !isNaN(Number(station.lat)) && !isNaN(Number(station.lng)) && Number(station.lat) !== 0 && Number(station.lng) !== 0)
                    .map((station, idx) => (
                      <Marker key={idx} position={[Number(station.lat), Number(station.lng)]} icon={stationIcon}>
                        <Popup>
                          <div style={{ color: "#000" }}>{station.name} Station</div>
                        </Popup>
                      </Marker>
                    ))}
                </div>
              );
            })}
          </MapContainer>
        </div>

        {/* AI Predictions & Insights Panel */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid #334155",
            borderRadius: "24px",
            padding: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px", color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
            <FaBrain style={{ color: "#fbbf24" }} /> AI Delay Predictions
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", overflowY: "auto", maxHeight: "430px", paddingRight: "4px" }}>
            {trains.map((train) => {
              const borderCol = train.status === "Delayed" ? "#ef4444" : "#10b981";
              const delayVal = train.predictedDelay || 0;
              return (
                <div
                  key={train.trainNo}
                  style={{
                    background: "rgba(30, 41, 59, 0.5)",
                    borderLeft: `4px solid ${borderCol}`,
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid #1e293b",
                    borderLeftWidth: "4px",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>{train.name}</h4>
                    <span style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "10px", background: train.status === "Delayed" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)", color: borderCol, fontWeight: "bold" }}>
                      {train.status}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>
                    <div>Speed: <strong style={{ color: "white" }}>{train.speed} km/h</strong></div>
                    <div>Traffic: <strong style={{ color: "white" }}>{train.trafficDensity}%</strong></div>
                  </div>

                  <div style={{ fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#94a3b8" }}>
                    <span>Predicted Delay: <strong style={{ color: getRiskColor(delayVal) }}>{delayVal} mins</strong></span>
                    <span>Confidence: <strong style={{ color: "#38bdf8" }}>{train.confidence}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Train Analytics Table */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid #334155",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
        }}
      >
        <h2 style={{ margin: "0 0 20px 0", fontSize: "18px", color: "white" }}>
          🚆 Live Monitored Network Status
        </h2>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155", color: "#94a3b8" }}>
                <th style={{ padding: "12px" }}>Train Name</th>
                <th style={{ padding: "12px" }}>Train No</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px" }}>Speed</th>
                <th style={{ padding: "12px" }}>Traffic</th>
                <th style={{ padding: "12px" }}>AI Delay Forecast</th>
                <th style={{ padding: "12px" }}>Platform</th>
                <th style={{ padding: "12px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {trains.map((train) => (
                <tr
                  key={train.trainNo}
                  style={{
                    borderBottom: "1px solid #1e293b",
                    transition: "background 0.2s ease",
                    cursor: "pointer",
                    background: selectedTrain && selectedTrain.trainNo === train.trainNo ? "rgba(56, 189, 248, 0.08)" : "transparent"
                  }}
                  onClick={() => focusTrain(train)}
                >
                  <td style={{ padding: "14px 12px", fontWeight: "bold" }}>{train.name}</td>
                  <td style={{ padding: "14px 12px", color: "#38bdf8", fontFamily: "monospace" }}>{train.trainNo}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: train.status === "Delayed" ? "#ef4444" : "#10b981" }}></span>
                      {train.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 12px" }}>{train.speed} km/h</td>
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "60px", background: "#334155", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${train.trafficDensity}%`, background: train.trafficDensity > 70 ? "#ef4444" : "#3b82f6", height: "100%" }}></div>
                      </div>
                      <span>{train.trafficDensity}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 12px", color: getRiskColor(train.predictedDelay), fontWeight: "bold" }}>
                    {train.predictedDelay} mins (Conf: {train.confidence}%)
                  </td>
                  <td style={{ padding: "14px 12px", textAlign: "center" }}>
                    <span style={{ background: "#1e293b", padding: "4px 10px", borderRadius: "6px", border: "1px solid #334155" }}>
                      {train.platform}
                    </span>
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        focusTrain(train);
                      }}
                      style={{
                        background: "linear-gradient(135deg, #1e293b, #334155)",
                        border: "1px solid #475569",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        transition: "all 0.2s"
                      }}
                    >
                      Locate Map <FaChevronRight size={10} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}