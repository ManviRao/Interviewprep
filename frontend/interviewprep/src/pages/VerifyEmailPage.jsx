import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      try {
        const res = await axios.post("http://localhost:5000/api/auth/verify-email", {
          token: token
        });

        setStatus("success");
        setMessage(res.data.message);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>
            {status === "verifying" ? "⏳" : status === "success" ? "✅" : "❌"}
          </div>
          <h1 style={styles.title}>
            {status === "verifying" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </h1>
        </div>

        <div style={styles.content}>
          <p style={styles.message}>{message}</p>
          
          {status === "success" && (
            <button 
              style={styles.button}
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          )}
          
          {status === "error" && (
            <div style={styles.actions}>
              <Link to="/resend-verification" style={styles.link}>
                Resend Verification Email
              </Link>
              <Link to="/login" style={styles.secondaryLink}>
                Back to Login
              </Link>
            </div>
          )}
        </div>
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
    maxWidth: 500,
    width: "100%",
    textAlign: "center"
  },
  header: {
    marginBottom: 30
  },
  icon: {
    fontSize: "4rem",
    marginBottom: 20
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#2d3748",
    margin: 0
  },
  content: {
    textAlign: "center"
  },
  message: {
    fontSize: "1.1rem",
    color: "#4a5568",
    marginBottom: 30,
    lineHeight: 1.6
  },
  button: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: 10,
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: 15
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 15
  },
  link: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "1rem"
  },
  secondaryLink: {
    color: "#718096",
    textDecoration: "none",
    fontSize: "0.9rem"
  }
};

export default VerifyEmailPage;