import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [theme, setTheme] = useState("light");
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

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
      document.body.style.backgroundColor =
        savedTheme === "dark" ? "#121212" : "#f0f2f5";
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.body.style.backgroundColor =
      nextTheme === "dark" ? "#121212" : "#f0f2f5";
  };

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
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          age: Number(formData.age),
          monthly_income_usd: Number(formData.monthly_income_usd),
          employment_stability_years: Number(
            formData.employment_stability_years
          ),
          education_years: Number(formData.education_years),
          relationship_years: Number(formData.relationship_years),
          children: Number(formData.children),
          family_responsibility: Number(formData.family_responsibility)
        })
      });

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const data = await response.json();

      setResult(data);
    } catch (error) {
      setResult({
        error:
          "Could not connect to the FastAPI server. Make sure your backend is running."
      });
    }

    setLoading(false);
  };

  return (
    <div className={`container ${theme}`}>
      <div className="card">
        <div className="card-top-bar">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
          >
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>
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
      </div>
    </div>
  );
}

export default App;