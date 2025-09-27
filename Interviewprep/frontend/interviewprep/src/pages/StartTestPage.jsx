import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
/*React Router useNavigate handles page transitions

What it means:
React is a Single Page Application (SPA) — you don't reload the page when going to another URL.
useNavigate lets you move to another route/page programmatically.
After starting the test, the app automatically goes from /start-test → /question page.
No full page reload happens; React just switches the component.
*/

function StartTestPage() {
  const [userId, setUserId] = useState(2);//default userId to 2
  const [skill, setSkill] = useState("java"); //default skill to java
  const navigate = useNavigate();


/*That function:

Sends a POST request to your backend (/api/questions/start) with { userId, skill }.
Stores the returned session data in localStorage.
Navigates you to /question page (using React Router). */

  const handleStart = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/questions/start", {  //sends post request to backend
        userId,       
        skill,
      });

     /* Backend returns:
sessionId – a unique identifier for the test session.
question – first question of the test.
remainingQuestions – how many questions are left.
Saves these details in localStorage so other pages can access them
*/
      // ✅ Save everything to localStorage

      /*Normally, React state (useState) only lives while the page/component is active. If you refresh or move to another page, that state is lost.
       localStorage is a browser storage that keeps data even if you refresh the page or navigate to another page*/
      localStorage.setItem("userId", userId);
      localStorage.setItem("skill", skill);
      localStorage.setItem("sessionId", res.data.sessionId); // real session id from DB
      localStorage.setItem("currentQuestion", JSON.stringify(res.data.question));
      localStorage.setItem("remainingQuestions", res.data.remainingQuestions);

      navigate("/question");       //navigates to question page using useNavigate hook
    } catch (err) {
      console.error("❌ Failed to start test", err);
      alert("Failed to start test. Check backend.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>🎯</div>
          <h1 style={styles.title}>Let's Begin the Test</h1>
          <p style={styles.subtitle}>Get ready to showcase your skills</p>
        </div>
        
        <div style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>User ID</label>
            <input
              style={styles.input}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              type="number"
              onMouseEnter={(e) => e.target.style.borderColor = '#667eea'}
              onMouseLeave={(e) => e.target.style.borderColor = '#e2e8f0'}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
              }}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Skill</label>
            <input
              style={styles.input}
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              onMouseEnter={(e) => e.target.style.borderColor = '#667eea'}
              onMouseLeave={(e) => e.target.style.borderColor = '#e2e8f0'}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
              }}
            />
          </div>
          
          <button 
            style={styles.button} 
            onClick={handleStart}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
            onMouseDown={(e) => {
              e.target.style.transform = 'translateY(0)';
            }}
            onMouseUp={(e) => {
              e.target.style.transform = 'translateY(-2px)';
            }}
          >
            Start Test
          </button>
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
    fontSize: "2.2rem",
    fontWeight: "700",
    color: "#2d3748",
    margin: "0 0 8px 0",
    lineHeight: 1.2
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#718096",
    margin: 0
  },
  form: {
    textAlign: "left"
  },
  inputGroup: {
    marginBottom: 24
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
    outline: "none"
  }
};

export default StartTestPage;