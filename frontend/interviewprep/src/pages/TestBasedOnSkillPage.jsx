import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function TestBasedOnSkillPage() {
  const [userId, setUserId] = useState("");
  const [resume, setResume] = useState(null);
  const [resumes, setResumes] = useState(
    JSON.parse(localStorage.getItem("resumes")) || []
  );
  const [selectedResume, setSelectedResume] = useState("");
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ADDED: Authentication check - Replace the existing useEffect
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("userName");
    
    if (!storedUserId) {
      // Redirect to login if not authenticated
      navigate("/login");
      return;
    }
    
    setUserId(storedUserId);
  }, [navigate]);

  const handleResumeUpload = async () => {
    if (!userId || !resume) {
      alert("Please provide both User ID and Resume file!");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("file", resume);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/extract-skills", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.skills) {
        const newResumeData = {
          name: resume.name,
          userId,
          skills: res.data.skills,
        };

        const updatedResumes = [...resumes, newResumeData];
        setResumes(updatedResumes);
        localStorage.setItem("resumes", JSON.stringify(updatedResumes));
        localStorage.setItem("userId", userId);

        setSelectedResume(resume.name);
        setSkills(res.data.skills);
        alert("✅ Resume uploaded and skills extracted successfully!");
      } else {
        alert("No skills found in the resume!");
      }
    } catch (err) {
      console.error("❌ Skill extraction failed:", err);
      alert("Failed to extract skills. Please check the backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResume = (resumeName) => {
    if (resumeName === "upload-new") {
      setSelectedResume("upload-new");
      setSkills([]);
      setResume(null);
      return;
    }

    const selected = resumes.find((r) => r.name === resumeName);
    if (selected) {
      setSelectedResume(selected.name);
      setSkills(selected.skills);
      localStorage.setItem("userId", selected.userId);
    }
  };

  const handleStartTest = async () => {
    if (!selectedSkill) {
      alert("Please select a skill to start the test.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/questions/start", {
        userId,
        skill: selectedSkill,
      });

      localStorage.setItem("userId", userId);
      localStorage.setItem("skill", selectedSkill);
      localStorage.setItem("sessionId", res.data.sessionId);
      localStorage.setItem("currentQuestion", JSON.stringify(res.data.question));
      localStorage.setItem("remainingQuestions", res.data.remainingQuestions);

      navigate("/question");
    } catch (err) {
      console.error("❌ Failed to start test", err);
      alert("Failed to start test. Check backend.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🧾 Take Test Based on Skill</h1>

        <div style={styles.form}>
          {/* ADDED: User info display - REMOVED manual User ID input */}
          <div style={styles.userInfo}>
            <strong>Logged in as User ID:</strong> {userId}
          </div>

          {/* Resume selection */}
          <label style={styles.label}>Select or Upload Resume</label>
          <select
            style={styles.input}
            value={selectedResume}
            onChange={(e) => handleSelectResume(e.target.value)}
          >
            <option value="">-- Select Resume --</option>
            {resumes.map((r, idx) => (
              <option key={idx} value={r.name}>
                {r.name}
              </option>
            ))}
            <option value="upload-new">📂 Upload from Local Machine</option>
          </select>

          {selectedResume === "upload-new" && (
            <>
              <input
                type="file"
                accept=".pdf,.docx"
                style={styles.input}
                onChange={(e) => setResume(e.target.files[0])}
              />
              <button
                style={styles.uploadButton}
                onClick={handleResumeUpload}
                disabled={loading}
              >
                {loading ? "Extracting..." : "Extract Skills"}
              </button>
            </>
          )}
        </div>

        {/* Skill Section */}
        {skills.length > 0 && (
          <div style={styles.skillsSection}>
            <h3 style={styles.subheading}>Select a Skill:</h3>
            <div style={styles.skillsGrid}>
              {skills.map((skill, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.skillChip,
                    background:
                      selectedSkill === skill
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "#edf2f7",
                    color: selectedSkill === skill ? "white" : "#2d3748",
                    border:
                      selectedSkill === skill
                        ? "none"
                        : "2px solid #e2e8f0",
                  }}
                  onClick={() => setSelectedSkill(skill)}
                >
                  {skill}
                </div>
              ))}
            </div>

            <button style={styles.startButton} onClick={handleStartTest}>
              Start Test
            </button>
          </div>
        )}
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
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: 20,
  },
  card: {
    background: "white",
    borderRadius: 20,
    padding: 40,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    maxWidth: 600,
    width: "100%",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
    color: "#2d3748",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  // ADDED: User info style
  userInfo: {
    background: "#f7fafc",
    padding: "12px 16px",
    borderRadius: 8,
    marginBottom: 10,
    textAlign: "center",
    color: "#4a5568",
    border: "1px solid #e2e8f0"
  },
  label: {
    fontWeight: 600,
    color: "#4a5568",
  },
  input: {
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: 10,
    fontSize: "1rem",
    outline: "none",
  },
  uploadButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "14px 20px",
    borderRadius: 10,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    marginTop: 10,
  },
  skillsSection: {
    marginTop: 30,
    textAlign: "center",
  },
  subheading: {
    color: "#2d3748",
  },
  skillsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center",
    marginTop: 10,
  },
  skillChip: {
    padding: "10px 16px",
    borderRadius: 20,
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.2s ease",
  },
  startButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "14px 24px",
    borderRadius: 10,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    marginTop: 20,
  },
};

export default TestBasedOnSkillPage;