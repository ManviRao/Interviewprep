import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/resend-verification", {
        email: email
      });

      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>📧</div>
          <h1 style={styles.title}>Resend Verification Email</h1>
          <p style={styles.subtitle}>Enter your email to receive a new verification link</p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          {error && (
            <div style={styles.errorMessage}>
              <div style={styles.errorIcon}>❌</div>
              {error}
            </div>
          )}

          {message && (
            <div style={styles.successMessage}>
              <div style={styles.successIcon}>✅</div>
              {message}
            </div>
          )}

          <button 
            style={loading ? {...styles.button, ...styles.buttonLoading} : styles.button}
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Resend Verification Email"}
          </button>

          <div style={styles.links}>
            <Link to="/login" style={styles.link}>Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  card: {
    background: "white",
    borderRadius: 20,
    padding: 40,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    maxWidth: 450,
    width: "100%",
    textAlign: "center"
  },
  header: {
    marginBottom: 32
  },
  icon: {
    fontSize: "4rem",
    marginBottom: 16
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#2d3748",
    margin: "0 0 8px 0"
  },
  subtitle: {
    fontSize: "1rem",
    color: "#718096",
    margin: 0
  },
  form: {
    textAlign: "left"
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    display: "block",
    marginBottom: 8,
    fontWeight: "600",
    color: "#4a5568",
    fontSize: "1rem"
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: 10,
    fontSize: "1rem",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    outline: "none"
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
    marginBottom: 20
  },
  buttonLoading: {
    opacity: 0.7,
    cursor: "not-allowed"
  },
  errorMessage: {
    background: "#fed7d7",
    border: "1px solid #feb2b2",
    borderRadius: 10,
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    color: "#c53030"
  },
  successMessage: {
    background: "#c6f6d5",
    border: "1px solid #9ae6b4",
    borderRadius: 10,
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    color: "#276749"
  },
  errorIcon: {
    fontSize: "1rem"
  },
  successIcon: {
    fontSize: "1rem"
  },
  links: {
    textAlign: "center"
  },
  link: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "600"
  }
};

export default ResendVerificationPage;