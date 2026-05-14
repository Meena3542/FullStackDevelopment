import React, { useState } from "react";

function Register({ onGoToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= VALIDATION =================
  const validateEmail = (email) => {
    // ✅ Must end with @gmail.com only
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  };

  const validatePassword = (password) => {
    // ✅ Min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    // ✅ Email check
    if (!validateEmail(email)) {
      alert("Email must be a valid @gmail.com address\nExample: yourname@gmail.com");
      return;
    }

    // ✅ Password check
    if (!validatePassword(password)) {
      alert(
        "Password must be at least 8 characters and include:\n" +
        "• At least 1 uppercase letter (A-Z)\n" +
        "• At least 1 lowercase letter (a-z)\n" +
        "• At least 1 digit (0-9)"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const result = await res.json();
      alert(result.message);

      if (result.message === "Registration successful") {
        onGoToLogin();
      }

    } catch (err) {
      console.error("Register error:", err);
      alert("Registration failed. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // ================= LIVE PASSWORD STRENGTH =================
  const getPasswordStrength = () => {
    if (!password) return null;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasLength = password.length >= 8;

    const score = [hasUpper, hasLower, hasDigit, hasLength].filter(Boolean).length;

    if (score <= 1) return { label: "Weak", color: "#ef4444" };
    if (score === 2) return { label: "Fair", color: "#f59e0b" };
    if (score === 3) return { label: "Good", color: "#3b82f6" };
    return { label: "Strong ✓", color: "#22c55e" };
  };

  const strength = getPasswordStrength();

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>📝 Create Account</h2>

        <input
          style={styles.input}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Email field with live hint */}
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

        {/* Password field with strength indicator */}
        <input
          style={{
            ...styles.input,
            borderColor: password && !validatePassword(password) ? "#ef4444" : "#ccc"
          }}
          type="password"
          placeholder="Password (min 8 chars, A-Z, a-z, 0-9)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Live password strength bar */}
        {password && (
          <div style={styles.strengthRow}>
            <div style={styles.strengthBarBg}>
              <div style={{
                ...styles.strengthBarFill,
                width: `${(["Weak","Fair","Good","Strong ✓"].indexOf(strength.label) + 1) * 25}%`,
                background: strength.color
              }} />
            </div>
            <span style={{ fontSize: "12px", color: strength.color, fontWeight: "600" }}>
              {strength.label}
            </span>
          </div>
        )}

        {/* Password rules hint */}
        {password && !validatePassword(password) && (
          <div style={styles.rulesBox}>
            <p style={{ margin: "2px 0", fontSize: "12px", color: /[A-Z]/.test(password) ? "#22c55e" : "#ef4444" }}>
              {/[A-Z]/.test(password) ? "✅" : "❌"} At least 1 uppercase letter
            </p>
            <p style={{ margin: "2px 0", fontSize: "12px", color: /[a-z]/.test(password) ? "#22c55e" : "#ef4444" }}>
              {/[a-z]/.test(password) ? "✅" : "❌"} At least 1 lowercase letter
            </p>
            <p style={{ margin: "2px 0", fontSize: "12px", color: /\d/.test(password) ? "#22c55e" : "#ef4444" }}>
              {/\d/.test(password) ? "✅" : "❌"} At least 1 digit (0-9)
            </p>
            <p style={{ margin: "2px 0", fontSize: "12px", color: password.length >= 8 ? "#22c55e" : "#ef4444" }}>
              {password.length >= 8 ? "✅" : "❌"} Minimum 8 characters
            </p>
          </div>
        )}

        <button
          style={{
            ...styles.button,
            background: loading ? "#aaa" : "#2575fc",
            cursor: loading ? "not-allowed" : "pointer"
          }}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <a onClick={onGoToLogin} style={styles.link}>
          Already have an account? Login
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
    background: "linear-gradient(135deg, #6a11cb, #2575fc)",
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
    outline: "none",
    transition: "border-color 0.2s"
  },
  errorHint: {
    color: "#ef4444",
    fontSize: "12px",
    margin: "2px 0 6px",
    textAlign: "left",
    paddingLeft: "8px"
  },
  strengthRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "4px 8px 0"
  },
  strengthBarBg: {
    flex: 1,
    height: "6px",
    background: "#e2e8f0",
    borderRadius: "4px",
    overflow: "hidden"
  },
  strengthBarFill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.3s, background 0.3s"
  },
  rulesBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    padding: "8px 12px",
    margin: "6px 0",
    textAlign: "left"
  },
  button: {
    width: "100%",
    padding: "12px",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    marginTop: "12px"
  },
  link: {
    display: "block",
    marginTop: "15px",
    color: "#2575fc",
    textDecoration: "none",
    cursor: "pointer",
    fontSize: "14px"
  }
};

export default Register;