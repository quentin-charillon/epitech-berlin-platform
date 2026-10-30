import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

type Mode = "login" | "register";

export default function AdminLogin() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setRegistered(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      if (data.user.role !== "ADMIN") {
        setError("Access denied: your account has not been granted admin access yet.");
        return;
      }
      localStorage.setItem("token", data.token);
      navigate("/admin");
    } catch {
      setError("Invalid email or password.");
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await axios.post(`${API_BASE}/api/auth/register`, { name, email, password });
      setRegistered(true);
      setName("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed.");
    }
  }

  return (
    <div className="adminLogin">
      <h1>{mode === "login" ? "Sign in" : "Create account"}</h1>

      {/* Tab toggle */}
      <div
        style={{
          display: "flex",
          gap: 4,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid var(--admin-border)",
          borderRadius: 12,
          padding: 4,
          marginBottom: 24,
          width: "100%",
          maxWidth: 360,
          boxSizing: "border-box",
        }}
      >
        {(["login", "register"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            style={{
              flex: 1,
              padding: "8px 0",
              border: "none",
              borderRadius: 9,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              transition: "all 0.2s",
              background:
                mode === m ? "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" : "transparent",
              color: mode === m ? "white" : "var(--admin-text-muted)",
              boxShadow: mode === m ? "0 2px 8px rgba(124,58,237,0.3)" : "none",
            }}
          >
            {m === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      {mode === "login" ? (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={{ color: "#fca5a5", margin: 0, fontSize: 13 }}>{error}</p>}
          <button type="submit">Sign in</button>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          {registered ? (
            <div
              style={{
                padding: 16,
                borderRadius: 10,
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.3)",
                color: "#6ee7b7",
                fontSize: 14,
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
              Account created! An admin will grant you access before you can sign in.
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              {error && <p style={{ color: "#fca5a5", margin: 0, fontSize: 13 }}>{error}</p>}
              <button type="submit">Create account</button>
            </>
          )}
        </form>
      )}
    </div>
  );
}
