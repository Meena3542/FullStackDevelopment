import React, { useState } from "react";

function Login({ onLogin, onGuestLogin, onGoToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  //  FORGOT PASSWORD 
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  //  VALIDATION 
  const validateEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  };

  //  LOGIN 
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    if (!validateEmail(email)) {
      alert("Email must be a valid @gmail.com address\nExample: yourname@gmail.com");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const result = await res.json();

      if (!result.token) {
        alert(result.message);
        return;
      }

      //  Save all user info to localStorage
      localStorage.setItem("userId", result.userId.toString());
      localStorage.setItem("token", result.token);
      localStorage.setItem("username", result.username);
      localStorage.setItem("role", result.role);
      localStorage.setItem("isGuest", "false");

      alert("Login successful! Welcome " + result.username);
      onLogin();

    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // GUEST
  const handleGuest = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.setItem("username", "Guest");
    localStorage.setItem("isGuest", "true");
    onGuestLogin();
  };

  //  FORGOT PASSWORD 
  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      alert("Please enter your email");
      return;
    }

    if (!validateEmail(forgotEmail)) {
      alert("Please enter a valid @gmail.com address");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });

      const result = await res.json();
      alert(result.message || "If this email exists, a reset link has been sent.");
      setShowForgot(false);
      setForgotEmail("");

    } catch (err) {
      console.error("Forgot password error:", err);
      alert("Failed to send reset email. Check if backend is running.");
    } finally {
      setForgotLoading(false);
    }
  };

  //  FORGOT PASSWORD MODAL 
  if (showForgot) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>🔑 Forgot Password</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>
            Enter your Gmail address and we'll send you a reset link.
          </p>

          <input
            style={{
              ...styles.input,
              borderColor: forgotEmail && !validateEmail(forgotEmail) ? "#ef4444" : "#ccc"
            }}
            placeholder="yourname@gmail.com"
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
          />
          {forgotEmail && !validateEmail(forgotEmail) && (
            <p style={styles.errorHint}>⚠️ Use a valid @gmail.com address</p>
          )}

          <button
            style={{
              ...styles.button,
              background: forgotLoading ? "#aaa" : "#ff7e5f",
              cursor: forgotLoading ? "not-allowed" : "pointer"
            }}
            onClick={handleForgotPassword}
            disabled={forgotLoading}
          >
            {forgotLoading ? "Sending..." : "Send Reset Link"}
          </button>

          <a
            onClick={() => { setShowForgot(false); setForgotEmail(""); }}
            style={styles.link}
          >
            ← Back to Login
          </a>
        </div>
      </div>
    );
  }

  //  LOGIN FORM 
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 Login</h2>

        <input
          style={{
            ...styles.input,
            borderColor: email && !validateEmail(email) ? "#ef4444" : "#ccc"
          }}
          placeholder="Email (must be @gmail.com)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {email && !validateEmail(email) && (
          <p style={styles.errorHint}>⚠️ Use a valid @gmail.com address</p>
        )}

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* ✅ Forgot Password link */}
        <div style={{ textAlign: "right", marginTop: "2px", marginBottom: "4px" }}>
          <a
            onClick={() => setShowForgot(true)}
            style={{ ...styles.link, display: "inline", fontSize: "13px" }}
          >
            Forgot Password?
          </a>
        </div>

        <button
          style={{
            ...styles.button,
            background: loading ? "#aaa" : "#ff7e5f",
            cursor: loading ? "not-allowed" : "pointer"
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* ✅ Guest option only on Login page */}
        <button
          style={{ ...styles.button, background: "#64748b", marginTop: "10px", cursor: "pointer" }}
          onClick={handleGuest}
        >
          👤 Continue as Guest
        </button>

        <a onClick={onGoToRegister} style={styles.link}>
          Don't have an account? Register
        </a>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #ff7e5f, #feb47b)",
    fontFamily: "Arial, sans-serif",
    padding: "20px 0"
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "340px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
  },
  title: {
    marginBottom: "20px",
    color: "#333"
  },
  input: {
    width: "90%",
    padding: "12px",
    margin: "8px auto",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    display: "block",
    outline: "none"
  },
  errorHint: {
    color: "#ef4444",
    fontSize: "12px",
    margin: "2px 0 4px",
    textAlign: "left",
    paddingLeft: "8px"
  },
  button: {
    width: "100%",
    padding: "12px",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    marginTop: "10px"
  },
  link: {
    display: "block",
    marginTop: "15px",
    color: "#ff7e5f",
    textDecoration: "none",
    cursor: "pointer",
    fontSize: "14px"
  }
};

export default Login;