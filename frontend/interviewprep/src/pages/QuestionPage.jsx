import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function QuestionPage() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [remainingQuestions, setRemainingQuestions] = useState(0); 
   const [submitting, setSubmitting] = useState(false);

  const [status, setStatus] = useState("idle");
  const [listening, setListening] = useState(false);

  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  // Load question + remaining count from localStorage when component mounts
  useEffect(() => {
    const storedQuestion = localStorage.getItem("currentQuestion");
    const storedRemaining = localStorage.getItem("remainingQuestions");


    if (storedQuestion) setCurrentQuestion(JSON.parse(storedQuestion));
    if (storedRemaining) setRemainingQuestions(parseInt(storedRemaining, 10));
  }, []);

  // Initialize SpeechRecognition
  const initRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("SpeechRecognition not supported in this browser.");
      return null;
    }

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.maxAlternatives = 1;
    recog.lang = "en-US"; // default, can change if needed

    recog.onstart = () => {
      setStatus("listening…");
      setListening(true);
    };

    recog.onend = () => {
      setStatus("stopped");
      setListening(false);
    };

    recog.onerror = (e) => {
      setStatus("error: " + e.error);
    };

    recog.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript;
        } else {
          interim += transcript;
        }
      }
      const combined = finalTranscriptRef.current + interim;
      setAnswer(combined); // updates textarea with speech text
    };

    return recog;
  };

  const handleStartListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop(); // reset
    recognitionRef.current = initRecognition();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("start error:", err);
      }
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  // Handle Submit Answer
  const handleSubmit = async () => {
      if (!answer.trim()) {
    alert("⚠️ Please enter an answer before submitting.");
    return; // Stop execution if answer is blank
  }
  if (submitting) return;
  
  setSubmitting(true);
    try {
      const userId = localStorage.getItem("userId");
      const skill = localStorage.getItem("skill");
      const sessionId = localStorage.getItem("sessionId");


      // Send answer to backend and get next question or finish test
      const res = await axios.post("http://localhost:5000/api/questions/answer", {
        userId,
        sessionId,
        questionId: currentQuestion.id,
        candidateAnswer: answer,
        skill,
        timeTakenSeconds: 30, // Fixed time for simplicity
      });
      console.log("✅ Answer submitted:", res.data.nextQuestion);


      if (res.data.nextQuestion) {
        setCurrentQuestion(res.data.nextQuestion);
        localStorage.setItem(
          "currentQuestion",
          JSON.stringify(res.data.nextQuestion)
        );
        setRemainingQuestions(res.data.remainingQuestions);
        localStorage.setItem(
          "remainingQuestions",
          res.data.remainingQuestions
        );
        setAnswer("");
        finalTranscriptRef.current = ""; // reset speech transcript
      } else {
        navigate("/summary");
      }
    } catch (err) {
      console.error("❌ Failed to submit answer", err);
      alert("Failed to submit answer. Check backend.");
    }finally{
       setSubmitting(false); 
    }
  };

  if (!currentQuestion) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <h2 style={styles.loadingText}>Loading question...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>❓</div>
          <h1 style={styles.title}>Question</h1>
          <p style={styles.subtitle}>Test your knowledge and skills</p>
        </div>

        <div style={styles.questionSection}>
          <h3 style={styles.questionLabel}>Question:</h3>
          <p style={styles.questionText}>{currentQuestion.question_text}</p>
        </div>

        <div style={styles.answerSection}>
          <label style={styles.label}>Your Answer:</label>
          <textarea
            style={styles.textarea}
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              finalTranscriptRef.current = e.target.value;
            }}
            rows={6}
            placeholder="Type or speak your answer here..."
          />
          <div style={styles.controls}>
            <button
              style={{
                ...styles.controlButton,
                background: listening ? "#718096" : "#667eea",
              }}
              onClick={handleStartListening}
              disabled={listening}
            >
              🎙️ Start
            </button>
            <button
              style={styles.controlButton}
              onClick={handleStopListening}
              disabled={!listening}
            >
              ⏹ Stop
            </button>
            <span style={styles.status}>{status}</span>
          </div>
        </div>

        
        <button 
          style={{
    ...styles.button,
    opacity: submitting ? 0.6 : 1,
    cursor: submitting ? "not-allowed" : "pointer",
  }} 
          onClick={handleSubmit}
            disabled={submitting}
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
          {submitting ? "Submitting..." : "Submit Answer"}
        </button>

        <div style={styles.footer}>
          <p style={styles.remainingText}>
            Remaining Questions:{" "}
            <span style={styles.remainingCount}>{remainingQuestions}</span>
          </p>
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
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: "white",
    borderRadius: 20,
    padding: 40,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    maxWidth: 700,
    width: "100%",
    textAlign: "center",
  },
  header: { marginBottom: 32 },
  icon: { fontSize: "4rem", marginBottom: 16 },
  title: {
    fontSize: "2.2rem",
    fontWeight: "700",
    color: "#2d3748",
    margin: "0 0 8px 0",
    lineHeight: 1.2,
  },
  subtitle: { fontSize: "1.1rem", color: "#718096", margin: 0 },
  questionSection: {
    textAlign: "left",
    marginBottom: 24,
    background: "#f7fafc",
    padding: 20,
    borderRadius: 12,
    borderLeft: "4px solid #667eea",
  },
  questionLabel: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#4a5568",
    margin: "0 0 12px 0",
  },
  questionText: {
    fontSize: "1.2rem",
    color: "#2d3748",
    lineHeight: 1.6,
    margin: 0,
  },
  answerSection: { textAlign: "left", marginBottom: 24 },
  label: {
    display: "block",
    marginBottom: 8,
    fontWeight: "600",
    color: "#4a5568",
    fontSize: "1rem",
  },
  textarea: {
    width: "100%",
    padding: "16px",
    border: "2px solid #e2e8f0",
    borderRadius: 12,
    fontSize: "1rem",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    outline: "none",
    resize: "vertical",
    minHeight: "120px",
    fontFamily: "inherit",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },
  controlButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  status: { fontSize: "0.9rem", color: "#4a5568" },
  button: {
    width: "100%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    padding: "16px 24px",
    borderRadius: 12,
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: 20,
  },
  footer: { borderTop: "1px solid #e2e8f0", paddingTop: 20 },
  remainingText: { fontSize: "1rem", color: "#718096", margin: 0 },
  remainingCount: { fontWeight: "700", color: "#667eea", fontSize: "1.2rem" },
  loadingContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  spinner: {
    width: 50,
    height: 50,
    border: "4px solid #e2e8f0",
    borderLeft: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: 20,
  },
  loadingText: { fontSize: "1.5rem", color: "white", fontWeight: "600" },
};

// CSS animations
const styleSheet = document.styleSheets[0];
const addStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (styleSheet) {
  styleSheet.insertRule(addStyles, styleSheet.cssRules.length);
}

export default QuestionPage;
