import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaTrain, FaCompass, FaMapMarkerAlt, FaClock } from "react-icons/fa";

function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, zoom || 11);
    }
  }, [center, zoom, map]);
  return null;
}

// Create custom train icons using DivIcon to avoid asset 404 bugs
const createTrainIcon = (status) => {
  const color = status === "Delayed" ? "#ef4444" : "#10b981";
  return L.divIcon({
    className: "custom-train-marker",
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: #0f172a;
        border: 2px solid ${color};
        border-radius: 50%;
        box-shadow: 0 0 10px ${color};
        font-size: 18px;
        position: relative;
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
          box-shadow: 0 0 5px ${color};
          animation: pulse 1.8s infinite;
        "></span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const stationIcon = L.divIcon({
  className: "custom-station-marker",
  html: `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background: #1e293b;
      border: 2px solid #38bdf8;
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(56, 189, 248, 0.5);
      font-size: 9px;
    ">
      🚉
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

export default function LiveTracking() {
  const [trains, setTrains] = useState([]);
  const [selectedTrainNo, setSelectedTrainNo] = useState("");
  const [loading, setLoading] = useState(true);

  const selectedTrainNoRef = useRef(selectedTrainNo);
  useEffect(() => {
    selectedTrainNoRef.current = selectedTrainNo;
  }, [selectedTrainNo]);

  useEffect(() => {
    loadTrains();
    const interval = setInterval(loadTrains, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadTrains = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/trains");
      if (Array.isArray(res.data)) {
        setTrains(res.data);
        setLoading(false);
        
        // Auto-select first train if none is selected
        if (res.data.length > 0) {
          setSelectedTrainNo(prev => prev || res.data[0].trainNo);
        }
      } else {
        throw new Error("API did not return an array of trains");
      }
    } catch (err) {
      console.error("API ERROR FETCHING TRAINS:", err);
      setTrains([]);
      setLoading(false);
    }
  };

  if (loading || trains.length === 0) {
    return (
      <div style={{ color: "white", padding: "40px", textAlign: "center", fontSize: "18px" }}>
        🌀 Initializing live tracking system and loading train routes...
      </div>
    );
  }

  const getSafeCoords = (t) => {
    if (!t) return [12.8626, 74.8436];
    const lat = Number(t.currentLat);
    const lng = Number(t.currentLng);
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      return [12.8626, 74.8436];
    }
    return [lat, lng];
  };

  const selectedTrain = trains.find(t => String(t.trainNo) === String(selectedTrainNo)) || trains[0];
  const routeCoords = selectedTrain && selectedTrain.route 
    ? selectedTrain.route
        .map(r => [Number(r.lat), Number(r.lng)])
        .filter(coords => !isNaN(coords[0]) && !isNaN(coords[1]) && coords[0] !== 0 && coords[1] !== 0)
    : [];
  const mapCenter = getSafeCoords(selectedTrain);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Title & Selection controls */}
      <div
        style={{
          background: "rgba(15,23,42,0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid #334155",
          padding: "20px 25px",
          borderRadius: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px"
        }}
      >
        <div>
          <h1 style={{ color: "white", margin: 0, fontSize: "24px" }}>
            📍 Real-Time Train Tracking & Routes
          </h1>
          <p style={{ color: "#94a3b8", margin: "5px 0 0 0", fontSize: "14px" }}>
            Track active trains and monitor their progress along intermediate waypoints.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontSize: "14px", color: "#cbd5e1" }}>Track Train:</label>
          <select
            value={selectedTrainNo}
            onChange={(e) => setSelectedTrainNo(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid #334155",
              background: "#0f172a",
              color: "white",
              outline: "none",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            {trains.map(t => (
              <option key={t.trainNo} value={t.trainNo}>
                {t.name} ({t.trainNo})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Map */}
      <div style={{ position: "relative" }}>
        <MapContainer
          center={mapCenter}
          zoom={11}
          style={{
            height: "550px",
            width: "100%",
            borderRadius: "20px",
            border: "1px solid #334155",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap center={mapCenter} zoom={11} />

          {/* Polyline Path */}
          {routeCoords.length > 0 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{
                color: selectedTrain.status === "Delayed" ? "#ef4444" : "#10b981",
                weight: 4,
                opacity: 0.8
              }}
            />
          )}

          {/* Train Icon Marker */}
          <Marker
            position={getSafeCoords(selectedTrain)}
            icon={createTrainIcon(selectedTrain.status)}
          >
            <Popup>
              <div style={{ color: "#000", fontWeight: "bold" }}>
                🚆 {selectedTrain.name} ({selectedTrain.trainNo})
                <br />
                <span style={{ fontWeight: "normal", color: "#444" }}>
                  Status: {selectedTrain.status}
                  <br />
                  Delay: {selectedTrain.delay} mins
                </span>
              </div>
            </Popup>
          </Marker>

          {/* Station markers along the route */}
          {selectedTrain.route && selectedTrain.route
            .filter(station => station && !isNaN(Number(station.lat)) && !isNaN(Number(station.lng)) && Number(station.lat) !== 0 && Number(station.lng) !== 0)
            .map((station, idx) => (
              <Marker key={idx} position={[Number(station.lat), Number(station.lng)]} icon={stationIcon}>
                <Popup>
                  <div style={{ color: "#000", fontWeight: "bold" }}>
                    🚉 {station.name} Station
                    <br />
                    <span style={{ fontWeight: "normal", color: "#666" }}>Waypoint {idx + 1}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      {/* Details Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            color: "white",
            padding: "20px 25px",
            borderRadius: "15px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
          }}
        >
          <h3 style={{ margin: "0 0 15px 0", color: "#38bdf8", display: "flex", alignItems: "center", gap: "10px" }}>
            <FaTrain /> Train Identity
          </h3>
          <p style={{ margin: "10px 0" }}><strong>Name:</strong> {selectedTrain.name}</p>
          <p style={{ margin: "10px 0" }}><strong>Number:</strong> {selectedTrain.trainNo}</p>
          <p style={{ margin: "10px 0" }}><strong>Status:</strong> {selectedTrain.status}</p>
        </div>

        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            color: "white",
            padding: "20px 25px",
            borderRadius: "15px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
          }}
        >
          <h3 style={{ margin: "0 0 15px 0", color: "#34d399", display: "flex", alignItems: "center", gap: "10px" }}>
            <FaCompass /> Current Telemetry
          </h3>
          <p style={{ margin: "10px 0" }}><strong>Speed:</strong> {selectedTrain.speed} km/h</p>
          <p style={{ margin: "10px 0" }}><strong>Traffic Density:</strong> {selectedTrain.trafficDensity}%</p>
          <p style={{ margin: "10px 0" }}><strong>Platform:</strong> Platform {selectedTrain.platform}</p>
        </div>

        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            color: "white",
            padding: "20px 25px",
            borderRadius: "15px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
          }}
        >
          <h3 style={{ margin: "0 0 15px 0", color: "#fbbf24", display: "flex", alignItems: "center", gap: "10px" }}>
            <FaClock /> Schedule & Time
          </h3>
          <p style={{ margin: "10px 0" }}><strong>Delay:</strong> {selectedTrain.delay} mins</p>
          <p style={{ margin: "10px 0" }}><strong>ETA:</strong> {selectedTrain.arrival}</p>
          <p style={{ margin: "10px 0" }}><strong>Departure:</strong> {selectedTrain.departure}</p>
        </div>
      </div>
    </div>
  );
}