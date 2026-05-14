import React, { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import ResetPassword from "./ResetPassword";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // PAGE STATE
  // Pages: "register" | "login" | "app" | "reset-password"
  const getInitialPage = () => {
    //  Check if URL has /reset-password/:token
    const path = window.location.pathname;
    if (path.startsWith("/reset-password/")) return "reset-password";

    const userId = localStorage.getItem("userId");
    const isGuest = localStorage.getItem("isGuest");
    if (userId || isGuest === "true") return "app";
    return "register";
  };

  const [page, setPage] = useState(getInitialPage);

  //  Extract token from URL
  const resetToken = window.location.pathname.startsWith("/reset-password/")
    ? window.location.pathname.split("/reset-password/")[1]
    : null;

  const isGuest = localStorage.getItem("isGuest") === "true";
  const isAdmin = localStorage.getItem("role") === "admin";
  const username = localStorage.getItem("username") || "User";

  // FETCH HISTORY
  useEffect(() => {
    if (page === "app" && !isGuest) {
      fetchHistory();
    }
  }, [page]);

  const fetchHistory = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/caption/history/${userId}`
      );

      if (!res.ok) {
        console.error("History fetch failed:", res.status);
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setHistory(data);
      } else if (Array.isArray(data.history)) {
        setHistory(data.history);
      } else if (Array.isArray(data.captions)) {
        setHistory(data.captions);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  // UPLOAD
  const uploadImage = async () => {
    if (!image) {
      alert("Select image first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userId = localStorage.getItem("userId");

      const formData = new FormData();
      formData.append("image", image);
      if (userId) formData.append("userId", userId);

      const res = await fetch("http://localhost:5000/api/caption", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const generatedCaption = data.caption || data.result || data.text || "";
      setCaption(generatedCaption);

      if (!isGuest) {
        await fetchHistory();
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // DELETE CAPTION (Admin only)
  const deleteCaption = async (captionId) => {
    const token = localStorage.getItem("token");

    const confirmDelete = window.confirm("Are you sure you want to delete this caption?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/caption/${captionId}`, {
        method: "DELETE",
        headers: {
          authorization: token,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Delete failed");
        return;
      }

      alert("Caption deleted successfully!");
      await fetchHistory();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting caption");
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("isGuest");
    setHistory([]);
    setCaption("");
    setPreview(null);
    setImage(null);
    setPage("register");
  };

  // ✅ ROUTING — reset-password MUST be first
  if (page === "reset-password") {
    return (
      <ResetPassword
        token={resetToken}
        onSuccess={() => {
          window.history.pushState({}, "", "/"); // clean URL
          setPage("login");
        }}
      />
    );
  }

  if (page === "register") {
    return <Register onGoToLogin={() => setPage("login")} />;
  }

  if (page === "login") {
    return (
      <Login
        onLogin={() => setPage("app")}
        onGuestLogin={() => setPage("app")}
        onGoToRegister={() => setPage("register")}
      />
    );
  }

  // MAIN APP
  return (
    <div style={styles.container}>
      {/* ===== SIDEBAR ===== */}
      <div style={styles.sidebar}>
        <h2 style={{ color: "white", marginTop: 0 }}>📜 History</h2>

        <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: 0 }}>
          👋 Welcome,{" "}
          <strong style={{ color: "white" }}>{username}</strong>
          {isAdmin && <span style={styles.adminBadge}>👑 Admin</span>}
        </p>

        {isGuest && (
          <div style={styles.guestBox}>
            <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#fbbf24" }}>
              ⚠️ You are browsing as a Guest.
            </p>
            <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#94a3b8" }}>
              History is only available for registered users.
            </p>
            <button
              onClick={() => setPage("register")}
              style={styles.registerNowButton}
            >
              Register Now
            </button>
          </div>
        )}

        {!isGuest && history.length === 0 && (
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>
            No history yet. Upload an image!
          </p>
        )}

        {!isGuest &&
          history.map((item, index) => (
            <div key={index} style={styles.historyItem}>
              <p style={{ margin: 0, fontSize: "13px", color: "white" }}>
                {item.caption || item.text || item.result || JSON.stringify(item)}
              </p>
              {item.createdAt && (
                <p style={{ margin: "4px 0 4px", fontSize: "11px", color: "#94a3b8" }}>
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              )}
              {isAdmin && (
                <button
                  onClick={() => deleteCaption(item._id)}
                  style={styles.deleteButton}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          ))}

        <button onClick={handleLogout} style={styles.logoutButton}>
          🚪 Logout
        </button>
      </div>

      {/* ===== MAIN PANEL ===== */}
      <div style={styles.main}>
        {isGuest && (
          <div style={styles.guestBadge}>
            👤 Guest Mode — captions won't be saved
          </div>
        )}

        {isAdmin && (
          <div style={{ ...styles.guestBadge, background: "#7c3aed", color: "white" }}>
            👑 Admin Mode
          </div>
        )}

        <h1 style={styles.heading}>🧠 AI Image Captioning System</h1>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            setImage(file);
            setPreview(URL.createObjectURL(file));
          }}
        />

        {preview && <img src={preview} alt="preview" style={styles.image} />}

        <button
          onClick={uploadImage}
          style={{
            ...styles.button,
            background: loading ? "#aaa" : "#22c55e",
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Caption"}
        </button>

        {error && (
          <div style={{ ...styles.captionBox, background: "#fee2e2", color: "#991b1b" }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {caption && (
          <div style={styles.captionBox}>
            <h3 style={{ margin: "0 0 8px" }}>Caption:</h3>
            <p style={{ margin: 0 }}>{caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// STYLES
const styles = {
  container: { display: "flex", height: "100vh", fontFamily: "Arial" },
  sidebar: {
    width: "25%",
    background: "#1e293b",
    color: "white",
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  adminBadge: {
    marginLeft: "8px",
    background: "#7c3aed",
    color: "white",
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  historyItem: {
    background: "#334155",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "6px",
  },
  deleteButton: {
    marginTop: "6px",
    padding: "4px 10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  guestBox: {
    background: "#1e3a5f",
    border: "1px solid #fbbf24",
    borderRadius: "8px",
    padding: "12px",
    marginTop: "10px",
  },
  registerNowButton: {
    width: "100%",
    padding: "8px",
    background: "#2575fc",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  logoutButton: {
    marginTop: "auto",
    padding: "10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  main: {
    width: "75%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
    position: "relative",
  },
  guestBadge: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "#1e293b",
    color: "#fbbf24",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
  },
  heading: { marginBottom: "20px" },
  image: { width: "300px", marginTop: "15px", borderRadius: "10px" },
  button: {
    marginTop: "15px",
    padding: "10px 20px",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
  },
  captionBox: {
    marginTop: "20px",
    background: "white",
    color: "black",
    padding: "15px",
    borderRadius: "8px",
    maxWidth: "400px",
    textAlign: "center",
  },
};

export default App;