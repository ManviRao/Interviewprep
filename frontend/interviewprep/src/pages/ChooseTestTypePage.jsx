import React from "react";
import { useNavigate } from "react-router-dom";

function ChooseTestTypePage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.cardContainer}>
        <div
          style={{ ...styles.card, background: "linear-gradient(135deg, #0cdcb3ff 0%, #764ba2 100%)" }}
          onClick={() => navigate("/test-skill")}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <h2 style={styles.title}>🧠 Take Test Based on Skill</h2>
          <p style={styles.text}>Upload your resume and let the system extract your top skills.</p>
        </div>
{/* 
        <div
          style={{ ...styles.card, background: "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)" }}
          onClick={() => navigate("/test-role")}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <h2 style={styles.title}>💼 Take Test Based on Role</h2>
          <p style={styles.text}>Choose your role and start a tailored assessment.</p>
        </div> */}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  cardContainer: {
    display: "flex",
    gap: "40px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    color: "white",
    width: "300px",
    height: "200px",
    borderRadius: "20px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.3s ease",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "10px",
  },
  text: {
    fontSize: "1rem",
  },
};

export default ChooseTestTypePage;
