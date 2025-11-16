import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const [role, setRole] = useState("candidate"); // role toggle
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // determine API endpoint based on role
      const endpoint =
        role === "candidate"
          ? "http://localhost:5000/api/auth/login"
          : "http://localhost:5000/api/admin/login";

      const res = await axios.post(endpoint, {
        email: formData.email,
        password: formData.password,
      });

      // Save token & user info
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("userName", res.data.user.name);
      localStorage.setItem("role", role);
      localStorage.setItem("token", res.data.token);

      // Navigate based on role
      if (role === "candidate") navigate("/");
      else navigate("/admin");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>🔐</div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your account</p>

          {/* Role toggle */}
          <div style={styles.roleToggle}>
            <button
              style={role === "candidate" ? styles.activeRoleButton : styles.roleButton}
              onClick={() => setRole("candidate")}
            >
              Candidate
            </button>
            <button
              style={role === "admin" ? styles.activeRoleButton : styles.roleButton}
              onClick={() => setRole("admin")}
            >
              Admin
            </button>
          </div>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter your email"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div style={styles.errorMessage}>
              <div style={styles.errorIcon}>❌</div>
              {error}
            </div>
          )}

          <button
            style={loading ? { ...styles.button, ...styles.buttonLoading } : styles.button}
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div style={styles.signupLink}>
            Don't have an account?{" "}
            <Link to="/signup" style={styles.link}>
              Sign up here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Styles ---
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: "white",
    borderRadius: 20,
    padding: 40,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    maxWidth: 450,
    width: "100%",
    textAlign: "center",
  },
  header: { marginBottom: 32 },
  icon: { fontSize: "4rem", marginBottom: 16 },
  title: { fontSize: "2.2rem", fontWeight: "700", color: "#2d3748", margin: "0 0 8px 0", lineHeight: 1.2 },
  subtitle: { fontSize: "1.1rem", color: "#718096", margin: 0 },
  roleToggle: { display: "flex", justifyContent: "center", gap: 12, marginTop: 16 },
  roleButton: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #667eea",
    background: "white",
    color: "#667eea",
    cursor: "pointer",
    fontWeight: 600,
  },
  activeRoleButton: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    background: "#667eea",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
  },
  form: { textAlign: "left" },
  inputGroup: { marginBottom: 20 },
  label: { display: "block", marginBottom: 8, fontWeight: "600", color: "#4a5568", fontSize: "1rem" },
  input: {
    width: "100%",
    padding: "14px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: 10,
    fontSize: "1rem",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    outline: "none",
  },
  button: {
    width: "100%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    padding: "16px 24px",
    borderRadius: 10,
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: 8,
    marginBottom: 20,
  },
  buttonLoading: { opacity: 0.7, cursor: "not-allowed" },
  errorMessage: {
    background: "#fed7d7",
    border: "1px solid #feb2b2",
    borderRadius: 10,
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    color: "#c53030",
  },
  errorIcon: { fontSize: "1rem" },
  signupLink: { textAlign: "center", color: "#718096" },
  link: { color: "#667eea", textDecoration: "none", fontWeight: "600" },
};

export default LoginPage;
