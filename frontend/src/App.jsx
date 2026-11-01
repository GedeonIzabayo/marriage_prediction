import { useState, useEffect } from "react";
import "./App.css";

const API_BASE = "http://127.0.0.1:8000";

function App() {
  const [theme, setTheme] = useState("light");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("predict"); // "predict" or "admin"
  
  // Auth Form State
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Prediction Form State
  const [formData, setFormData] = useState({
    age: "",
    monthly_income_usd: "",
    employment_stability_years: "",
    education_years: "",
    relationship_years: "",
    children: "",
    family_responsibility: "0"
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Admin Dashboard State
  const [adminStats, setAdminStats] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);

  // Initialize theme and saved user on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
      document.body.style.backgroundColor =
        savedTheme === "dark" ? "#121212" : "#f0f2f5";
    }

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.body.style.backgroundColor =
      nextTheme === "dark" ? "#121212" : "#f0f2f5";
  };

  // Auth Handlers
  const handleAuthChange = (e) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      if (authMode === "login") {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username_or_email: authForm.username,
            password: authForm.password
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || "Login failed");
        }

        setCurrentUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setAuthForm({ username: "", email: "", password: "" });
      } else {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: authForm.username,
            email: authForm.email,
            password: authForm.password
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || "Registration failed");
        }

        setAuthSuccess("Account created successfully! Please sign in.");
        setAuthMode("login");
        setAuthForm({ username: data.user.username, email: "", password: "" });
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickLogin = (role) => {
    if (role === "admin") {
      setAuthForm({ username: "admin", email: "", password: "admin123" });
    } else {
      setAuthForm({ username: "user1", email: "", password: "user123" });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
    setResult(null);
    setActiveTab("predict");
  };

  // Prediction Handlers
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(formData.age),
          monthly_income_usd: Number(formData.monthly_income_usd),
          employment_stability_years: Number(formData.employment_stability_years),
          education_years: Number(formData.education_years),
          relationship_years: Number(formData.relationship_years),
          children: Number(formData.children),
          family_responsibility: Number(formData.family_responsibility),
          username: currentUser ? currentUser.username : "Anonymous"
        })
      });

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        error: "Could not connect to the FastAPI server. Make sure your backend is running."
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Admin Stats
  const fetchAdminStats = async () => {
    if (!currentUser || currentUser.role !== "admin") return;
    setAdminLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard?role=admin`);
      if (res.ok) {
        const data = await res.json();
        setAdminStats(data);
      }
    } catch (e) {
      console.error("Failed to load admin stats:", e);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "admin") {
      fetchAdminStats();
    }
  }, [activeTab]);

  return (
    <div className={`container ${theme}`}>
      <div className={`card ${activeTab === "admin" ? "card-wide" : ""}`}>
        
        {/* Navigation / Header */}
        <div className="card-top-bar">
          <div className="user-nav">
            {currentUser ? (
              <span className={`user-badge ${currentUser.role === "admin" ? "admin-badge" : ""}`}>
                {currentUser.role === "admin" ? "👑 Admin" : "👤 User"}: <strong>{currentUser.username}</strong>
              </span>
            ) : (
              <span className="guest-badge">🔒 Guest Mode</span>
            )}
          </div>

          <div className="top-actions">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>

            {currentUser && (
              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
              >
                Log Out
              </button>
            )}
          </div>
        </div>

        {/* View Switcher for Admin */}
        {currentUser && currentUser.role === "admin" && (
          <div className="tab-switcher">
            <button
              type="button"
              className={`tab-btn ${activeTab === "predict" ? "active" : ""}`}
              onClick={() => setActiveTab("predict")}
            >
              🔮 Prediction Form
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "admin" ? "active" : ""}`}
              onClick={() => setActiveTab("admin")}
            >
              📊 Admin Dashboard
            </button>
          </div>
        )}

        {/* 1. NOT LOGGED IN -> AUTH SCREEN */}
        {!currentUser ? (
          <div className="auth-container">
            <h1>Marriage Prediction</h1>
            <p className="description">
              Please sign in as <strong>Admin</strong> or <strong>User</strong> to access the system.
            </p>

            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${authMode === "login" ? "active" : ""}`}
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                  setAuthSuccess("");
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab ${authMode === "register" ? "active" : ""}`}
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                  setAuthSuccess("");
                }}
              >
                Create Account
              </button>
            </div>

            {authError && <div className="alert error-alert">{authError}</div>}
            {authSuccess && <div className="alert success-alert">{authSuccess}</div>}

            <form onSubmit={handleAuthSubmit}>
              <label>Username {authMode === "login" && "or Email"}</label>
              <input
                type="text"
                name="username"
                value={authForm.username}
                onChange={handleAuthChange}
                placeholder={authMode === "login" ? "e.g. admin or user1" : "Choose username"}
                required
              />

              {authMode === "register" && (
                <>
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={authForm.email}
                    onChange={handleAuthChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </>
              )}

              <label>Password</label>
              <input
                type="password"
                name="password"
                value={authForm.password}
                onChange={handleAuthChange}
                placeholder="Enter password"
                required
              />

              <button type="submit" disabled={authLoading}>
                {authLoading
                  ? "Processing..."
                  : authMode === "login"
                  ? "Sign In"
                  : "Register"}
              </button>
            </form>

            <div className="quick-login-section">
              <p className="quick-login-title">⚡ Quick Sign-In Options:</p>
              <div className="quick-buttons">
                <button
                  type="button"
                  className="quick-btn admin-btn"
                  onClick={() => handleQuickLogin("admin")}
                >
                  👑 Fill Admin (admin / admin123)
                </button>
                <button
                  type="button"
                  className="quick-btn user-btn"
                  onClick={() => handleQuickLogin("user")}
                >
                  👤 Fill User (user1 / user123)
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === "admin" && currentUser.role === "admin" ? (
          
          /* 2. ADMIN DASHBOARD */
          <div className="admin-dashboard">
            <div className="admin-header">
              <h2>👑 Administrator Dashboard</h2>
              <button
                type="button"
                className="refresh-btn"
                onClick={fetchAdminStats}
                disabled={adminLoading}
              >
                {adminLoading ? "Refreshing..." : "🔄 Refresh Data"}
              </button>
            </div>

            {adminStats ? (
              <>
                <div className="stats-cards">
                  <div className="stat-card">
                    <h4>Total Users</h4>
                    <p className="stat-number">{adminStats.total_users}</p>
                    <span className="stat-sub">Registered accounts</span>
                  </div>
                  <div className="stat-card">
                    <h4>Total Predictions</h4>
                    <p className="stat-number">{adminStats.total_predictions}</p>
                    <span className="stat-sub">Queries executed</span>
                  </div>
                  <div className="stat-card">
                    <h4>Married Rate</h4>
                    <p className="stat-number">
                      {adminStats.total_predictions > 0
                        ? `${Math.round((adminStats.married_count / adminStats.total_predictions) * 100)}%`
                        : "0%"}
                    </p>
                    <span className="stat-sub">
                      {adminStats.married_count} married / {adminStats.not_married_count} not married
                    </span>
                  </div>
                </div>

                <h3>Recent Prediction Logs</h3>
                {adminStats.recent_predictions.length === 0 ? (
                  <p className="empty-notice">No predictions recorded yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Age</th>
                          <th>Income</th>
                          <th>Stability</th>
                          <th>Edu</th>
                          <th>Rel.</th>
                          <th>Kids</th>
                          <th>Fam. Resp</th>
                          <th>Result</th>
                          <th>Probability</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminStats.recent_predictions.map((p) => (
                          <tr key={p.id}>
                            <td><strong>{p.username}</strong></td>
                            <td>{p.age}</td>
                            <td>${p.monthly_income_usd}</td>
                            <td>{p.employment_stability_years}y</td>
                            <td>{p.education_years}y</td>
                            <td>{p.relationship_years}y</td>
                            <td>{p.children}</td>
                            <td>{p.family_responsibility === 1 ? "Yes" : "No"}</td>
                            <td>
                              <span className={`status-pill ${p.prediction === 1 ? "pill-married" : "pill-not"}`}>
                                {p.result}
                              </span>
                            </td>
                            <td>{(p.probability_married * 100).toFixed(1)}%</td>
                            <td className="date-col">{p.created_at}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <h3 style={{ marginTop: "30px" }}>Registered Accounts</h3>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminStats.users.map((u) => (
                        <tr key={u.id}>
                          <td>#{u.id}</td>
                          <td><strong>{u.username}</strong></td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`status-pill ${u.role === "admin" ? "pill-admin" : "pill-user"}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="date-col">{u.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p>Loading dashboard statistics...</p>
            )}
          </div>
        ) : (

          /* 3. PREDICTOR FORM */
          <>
            <h1>Marriage Prediction</h1>
            <p className="description">
              Predict whether a person is likely to be married at age 30.
            </p>

            <form onSubmit={handleSubmit}>
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Example: 27"
                required
              />

              <label>Monthly Income (USD)</label>
              <input
                type="number"
                name="monthly_income_usd"
                value={formData.monthly_income_usd}
                onChange={handleChange}
                placeholder="Example: 500"
                required
              />

              <label>Employment Stability (Years)</label>
              <input
                type="number"
                name="employment_stability_years"
                value={formData.employment_stability_years}
                onChange={handleChange}
                placeholder="Example: 4"
                required
              />

              <label>Education (Years)</label>
              <input
                type="number"
                name="education_years"
                value={formData.education_years}
                onChange={handleChange}
                placeholder="Example: 16"
                required
              />

              <label>Relationship Duration (Years)</label>
              <input
                type="number"
                name="relationship_years"
                value={formData.relationship_years}
                onChange={handleChange}
                placeholder="Example: 3"
                required
              />

              <label>Number of Children</label>
              <input
                type="number"
                name="children"
                value={formData.children}
                onChange={handleChange}
                placeholder="Example: 0"
                required
              />

              <label>Family Responsibility (e.g. caring for siblings / school fees)</label>
              <select
                name="family_responsibility"
                value={formData.family_responsibility}
                onChange={handleChange}
                required
              >
                <option value="0">No (None or minor responsibility)</option>
                <option value="1">Yes (Caring for siblings, paying school fees, etc.)</option>
              </select>

              <button type="submit" disabled={loading}>
                {loading ? "Predicting..." : "Predict Marriage Status"}
              </button>
            </form>

            {result && (
              <div className="result">
                {result.error ? (
                  <p className="error">{result.error}</p>
                ) : (
                  <>
                    <h2>Prediction Result</h2>

                    <p>
                      Probability Married:{" "}
                      <strong>
                        {(result.probability_married * 100).toFixed(2)}%
                      </strong>
                    </p>

                    <p>
                      Probability Not Married:{" "}
                      <strong>
                        {(result.probability_not_married * 100).toFixed(2)}%
                      </strong>
                    </p>

                    <div
                      className={`final-result ${
                        result.prediction === 1 ? "married" : "not-married"
                      }`}
                    >
                      <h3>Final Verdict</h3>
                      <p className="prediction-text">
                        {result.prediction === 1
                          ? "He/She will be married at 30."
                          : "He/She will not be married at 30."}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
