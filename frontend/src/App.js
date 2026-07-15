import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LiveTracking from "./pages/LiveTracking";
import Trains from "./pages/Trains";
import Predictions from "./pages/Predictions";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Register from "./pages/Register";
import TrafficControl from "./pages/TrafficControl";
function App() {
  const isLoggedIn = localStorage.getItem("loggedIn");
  if (!isLoggedIn && window.location.pathname !== "/register") {
  return <Login />;
}
  return (
    <BrowserRouter>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)",
          color: "white",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: "260px",
            background: "rgba(15,23,42,0.95)",
            backdropFilter: "blur(10px)",
            borderRight: "1px solid #334155",
            padding: "25px",
            boxShadow: "0 0 20px rgba(0,0,0,0.4)",
          }}
        >
          <h2
            style={{
              color: "#38bdf8",
              marginBottom: "30px",
            }}
          >
            🚆 MAQ Railway AI
          </h2>

          <div
            style={{
              background: "#22c55e",
              padding: "8px",
              borderRadius: "8px",
              marginBottom: "25px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            ● SYSTEM ONLINE
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <Link style={linkStyle} to="/">
              📊 Dashboard
            </Link>

            <Link style={linkStyle} to="/tracking">
              📍 Live Tracking
            </Link>

            <Link style={linkStyle} to="/trains">
              🚄 Trains
            </Link>

            <Link style={linkStyle} to="/predictions">
              🤖 Predictions
            </Link>

            <Link style={linkStyle} to="/analytics">
              📈 Analytics
            </Link>

            <Link style={linkStyle} to="/alerts">
              🚨 Alerts
            </Link>

            <Link style={linkStyle} to="/settings">
              ⚙ Settings
            </Link>
            <Link style={linkStyle} to="/register">
  👤 Create User
</Link>
            <Link style={linkStyle} to="/traffic-control">
              🚦 Traffic Control
            </Link>
            <button
  onClick={() => {
    localStorage.removeItem("loggedIn");
    window.location.reload();
  }}
  style={{
    marginTop: "10px",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  🚪 Logout
</button>
          </div>

          <div
            style={{
              marginTop: "50px",
              padding: "15px",
              borderRadius: "10px",
              background: "#1e293b",
            }}
          >
            <h4>Control Room</h4>
            <p>📍 Mangalore Central</p>
            <p>🚆 42 Active Trains</p>
            <p>🟢 Network Healthy</p>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            padding: "25px",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "rgba(30,41,59,0.7)",
              padding: "20px",
              borderRadius: "15px",
              marginBottom: "25px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h1>🚆 AI Train Traffic Control System</h1>
              <p style={{ color: "#94a3b8" }}>
                Real-Time Monitoring • Mangalore Central Station
              </p>
            </div>

            <div
              style={{
                background: "#22c55e",
                padding: "10px 15px",
                borderRadius: "12px",
                fontWeight: "bold",
              }}
            >
              🟢 LIVE
            </div>
          </div>

          <Routes>
            <Route
  path="/register"
  element={<Register />}
/>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/tracking" element={<LiveTracking />} />
            <Route path="/trains" element={<Trains />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/traffic-control" element={<TrafficControl />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  padding: "12px",
  borderRadius: "10px",
  background: "#1e293b",
  transition: "0.3s",
};

export default App;