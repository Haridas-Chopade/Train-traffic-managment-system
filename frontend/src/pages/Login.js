import { useState } from "react";
import axios from "axios";
import loginBg from "../assets/login-bg.jpg";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          username,
          password,
        }
      );

      if (res.data.success) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem(
          "username",
          res.data.username
        );

        window.location.reload();
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Login failed"
      );
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "450px",
          padding: "40px",
          borderRadius: "25px",
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(10px)",
          border:
            "1px solid rgba(255,255,255,0.15)",
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.6)",
          color: "white",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "60px",
              marginBottom: "10px",
            }}
          >
            🚆
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "36px",
              fontWeight: "700",
            }}
          >
            MAQ Railways
          </h1>

          <p
            style={{
              marginTop: "10px",
              color: "#cbd5e1",
            }}
          >
            Smart Railway Control Center
          </p>

          <div
            style={{
              marginTop: "15px",
              display: "inline-block",
              background: "#16a34a",
              padding: "8px 18px",
              borderRadius: "30px",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            ● SYSTEM ONLINE
          </div>
        </div>

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          style={inputStyle}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={inputStyle}
        />

        {/* Login Button */}
        <button
          onClick={handleLogin}
          style={buttonStyle}
        >
          Login To Control Room
        </button>

        {/* Footer */}
        <div
          style={{
            marginTop: "25px",
            textAlign: "center",
            color: "#cbd5e1",
            fontSize: "13px",
          }}
        >
          Mangaluru Central Railway Division
          <br />
          AI Powered Train Traffic Management System
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "15px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "25px",
  borderRadius: "12px",
  border: "none",
  background:
    "linear-gradient(135deg,#2563eb,#3b82f6)",
  color: "white",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow:
    "0 10px 30px rgba(37,99,235,.4)",
};