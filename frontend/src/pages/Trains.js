import { useEffect, useState } from "react";
import axios from "axios";
import { FaDownload, FaPlus, FaTrash, FaTrain, FaFileExcel } from "react-icons/fa";

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
  transition: "border 0.2s ease",
};

export default function Trains() {
  const [trains, setTrains] = useState([]);
  const [form, setForm] = useState({
    name: "",
    trainNo: "",
    arrival: "",
    departure: "",
    status: "On Time",
    speed: "",
    trafficDensity: "",
    platform: "1",
    delay: "0",
  });

  useEffect(() => {
    loadTrains();
  }, []);

  const loadTrains = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/trains");
      setTrains(res.data);
    } catch (err) {
      console.error("Error loading trains:", err);
    }
  };

  const addTrain = async () => {
    if (!form.name || !form.trainNo) {
      alert("Train Name and Train Number are required.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/trains", {
        ...form,
        speed: Number(form.speed) || 80,
        trafficDensity: Number(form.trafficDensity) || 30,
        delay: Number(form.delay) || 0,
        scheduledPlatform: form.platform || "1",
        currentLat: 12.8626, // Default near Mangalore Central
        currentLng: 74.8436,
        routeIndex: 0,
        direction: 1,
        route: [
          { lat: 12.8626, lng: 74.8436, name: "Mangalore Central" } // Default singular route
        ]
      });

      alert("Train Added Successfully");
      setForm({
        name: "",
        trainNo: "",
        arrival: "",
        departure: "",
        status: "On Time",
        speed: "",
        trafficDensity: "",
        platform: "1",
        delay: "0",
      });
      loadTrains();
    } catch (err) {
      console.error("Error adding train:", err);
      alert(err.response?.data?.message || "Failed to add train");
    }
  };

  const deleteTrain = async (id) => {
    if (!window.confirm("Are you sure you want to delete this train?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/trains/${id}`);
      loadTrains();
    } catch (err) {
      console.error("Error deleting train:", err);
    }
  };

  const downloadExcelReport = async () => {
    try {
      const res = await axios.get("http://localhost:5001/export-excel", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "train_traffic_report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading report:", err);
      alert("Failed to download Excel report");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header Panel */}
      <div
        style={{
          background: "rgba(15,23,42,0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid #334155",
          padding: "20px 25px",
          borderRadius: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <h1 style={{ color: "white", margin: 0, fontSize: "24px" }}>
            🚆 Network Train Management
          </h1>
          <p style={{ color: "#94a3b8", margin: "5px 0 0 0", fontSize: "14px" }}>
            Add, delete, and monitor active rolling stock operating in the Mangaluru division.
          </p>
        </div>
      </div>

      {/* Add Train Form */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid #334155",
          padding: "25px",
          borderRadius: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
        }}
      >
        <h2 style={{ margin: "0 0 20px 0", fontSize: "18px", color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
          <FaPlus style={{ color: "#10b981" }} /> Add New Active Train
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Train Name</label>
            <input
              placeholder="e.g. Matsyagandha Express"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Train Number</label>
            <input
              placeholder="e.g. 12619"
              value={form.trainNo}
              onChange={(e) => setForm({ ...form, trainNo: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Arrival Time</label>
            <input
              placeholder="e.g. 14:25"
              value={form.arrival}
              onChange={(e) => setForm({ ...form, arrival: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Departure Time</label>
            <input
              placeholder="e.g. 14:30"
              value={form.departure}
              onChange={(e) => setForm({ ...form, departure: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Speed (km/h)</label>
            <input
              placeholder="e.g. 85"
              value={form.speed}
              onChange={(e) => setForm({ ...form, speed: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Traffic Density (%)</label>
            <input
              placeholder="e.g. 40"
              value={form.trafficDensity}
              onChange={(e) => setForm({ ...form, trafficDensity: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Delay (mins)</label>
            <input
              placeholder="e.g. 0"
              value={form.delay}
              onChange={(e) => setForm({ ...form, delay: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Platform</label>
            <input
              placeholder="e.g. 1"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        <button
          onClick={addTrain}
          style={{
            marginTop: "20px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            border: "none",
            color: "white",
            padding: "12px 24px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
          }}
        >
          <FaPlus /> Deploy Train
        </button>
      </div>

      {/* Train List Panel */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid #334155",
          padding: "25px",
          borderRadius: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
            <FaTrain style={{ color: "#38bdf8" }} /> Active Network Fleet ({trains.length})
          </h2>

          <button
            onClick={downloadExcelReport}
            style={{
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              border: "none",
              color: "white",
              padding: "10px 18px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)",
              fontSize: "13px"
            }}
          >
            <FaFileExcel /> Download Excel Report
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155", color: "#94a3b8" }}>
                <th style={{ padding: "12px" }}>Train Name</th>
                <th style={{ padding: "12px" }}>Number</th>
                <th style={{ padding: "12px" }}>Arrival</th>
                <th style={{ padding: "12px" }}>Departure</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px" }}>Telemetry</th>
                <th style={{ padding: "12px" }}>Delay</th>
                <th style={{ padding: "12px" }}>Platform</th>
                <th style={{ padding: "12px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {trains.map((train) => (
                <tr
                  key={train._id}
                  style={{
                    borderBottom: "1px solid #1e293b",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 12px", fontWeight: "bold" }}>{train.name}</td>
                  <td style={{ padding: "14px 12px", color: "#38bdf8", fontFamily: "monospace" }}>{train.trainNo}</td>
                  <td style={{ padding: "14px 12px" }}>{train.arrival || "--"}</td>
                  <td style={{ padding: "14px 12px" }}>{train.departure || "--"}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: train.status === "Delayed" ? "#ef4444" : "#10b981" }}></span>
                      {train.status || "On Time"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ fontSize: "12px" }}>Speed: <strong>{train.speed} km/h</strong></div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>Traffic: <strong>{train.trafficDensity}%</strong></div>
                  </td>
                  <td style={{ padding: "14px 12px", color: (train.delay || 0) > 0 ? "#f59e0b" : "#10b981", fontWeight: "bold" }}>
                    {train.delay || 0} mins
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{ background: "#1e293b", padding: "4px 8px", borderRadius: "6px", border: "1px solid #334155" }}>
                      {train.platform || "1"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <button
                      onClick={() => deleteTrain(train._id)}
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        color: "#f87171",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#ef4444";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                        e.currentTarget.style.color = "#f87171";
                      }}
                    >
                      <FaTrash size={11} /> Delete
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