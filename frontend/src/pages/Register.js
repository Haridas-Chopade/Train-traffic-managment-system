import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const registerUser = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          username,
          password,
        }
      );

      alert(res.data.message);
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Registration failed"
      );
    }
  };

  return (
    <div style={{ color: "white" }}>
      <h1>👤 Create User</h1>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) =>
          setUsername(e.target.value)
        }
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <br /><br />

      <button onClick={registerUser}>
        Create User
      </button>
    </div>
  );
}