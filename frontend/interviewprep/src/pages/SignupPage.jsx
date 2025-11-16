import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function SignupPage() {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false); // Add success state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      // REMOVE THESE LINES - Don't auto-login
      // localStorage.setItem("userId", res.data.user.id);
      // localStorage.setItem("userName", res.data.user.name);
      // localStorage.setItem("token", res.data.token);

      // Show success message instead of navigating
      setSuccess(true);
      
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show success message after signup
  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.icon}>✅</div>
            <h1 style={styles.title}>Check Your Email!</h1>
            <p style={styles.subtitle}>We've sent a verification link to your email</p>
          </div>

          <div style={styles.successContent}>
            <p style={styles.successMessage}>
              Please check your inbox and click the verification link to activate your account.
            </p>
            <div style={styles.successActions}>
              <button 
                style={styles.button}
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
              <Link to="/resend-verification" style={styles.link}>
                Didn't receive email? Resend verification
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>👤</div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join our interview preparation platform</p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
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
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              placeholder="Enter your password"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              style={styles.input}
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
              placeholder="Confirm your password"
            />
          </div>

          {error && (
            <div style={styles.errorMessage}>
              <div style={styles.errorIcon}>❌</div>
              {error}
            </div>
          )}

          <button 
            style={loading ? {...styles.button, ...styles.buttonLoading} : styles.button}
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div style={styles.loginLink}>
            Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add these new styles for the success state
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
  header: { marginBottom: 32 },
  icon: { fontSize: "4rem", marginBottom: 16 },
  title: {
    fontSize: "2.2rem",
    fontWeight: "700",
    color: "#2d3748",
    margin: "0 0 8px 0",
    lineHeight: 1.2
  },
  subtitle: { fontSize: "1.1rem", color: "#718096", margin: 0 },
  form: { textAlign: "left" },
  inputGroup: { marginBottom: 20 },
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
    color: "#c53030"
  },
  errorIcon: { fontSize: "1rem" },
  loginLink: { textAlign: "center", color: "#718096" },
  link: { color: "#667eea", textDecoration: "none", fontWeight: "600" },
  
  // New styles for success state
  successContent: {
    textAlign: "center"
  },
  successMessage: {
    fontSize: "1.1rem",
    color: "#4a5568",
    lineHeight: 1.6,
    marginBottom: 30
  },
  successActions: {
    display: "flex",
    flexDirection: "column",
    gap: 15
  }
};

export default SignupPage;