import { useState } from "react";

export default function Settings() {
  const [gps, setGps] = useState(true);
  const [ai, setAi] = useState(true);
  const [alerts, setAlerts] = useState(true);

  return (
    <div style={{ color: "white" }}>
      <h1>⚙ AI Control Settings</h1>

      <div
        style={{
          background: "#111827",
          padding: "25px",
          borderRadius: "15px",
          marginTop: "20px",
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <label>
            <input
              type="checkbox"
              checked={gps}
              onChange={() => setGps(!gps)}
            />
            {" "}🛰 GPS Tracking
          </label>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>
            <input
              type="checkbox"
              checked={ai}
              onChange={() => setAi(!ai)}
            />
            {" "}🤖 AI Prediction Engine
          </label>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>
            <input
              type="checkbox"
              checked={alerts}
              onChange={() => setAlerts(!alerts)}
            />
            {" "}🚨 Alert System
          </label>
        </div>

        <hr />

        <h3>Current Status</h3>

        <p>GPS Tracking: {gps ? "🟢 Enabled" : "🔴 Disabled"}</p>
        <p>AI Engine: {ai ? "🟢 Enabled" : "🔴 Disabled"}</p>
        <p>Alerts: {alerts ? "🟢 Enabled" : "🔴 Disabled"}</p>
      </div>
    </div>
  );
}