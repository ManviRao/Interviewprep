import { useState } from "react";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isScraping, setIsScraping] = useState(false);

  const handleRunScraper = async () => {
    setLoading(true);
    setIsScraping(true);
    setMessage("Running scraper…");
    try {
      const res = await fetch("http://localhost:5000/api/run-scraper", {
        method: "POST",
      });
      const data = await res.json();
      setMessage(data.message || "Scraper run complete!");
      setIsScraping(true);
    } catch (err) {
      setMessage("Error: " + err.message);
      setIsScraping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStopScraper = async () => {
    setLoading(true);
    setMessage("Stopping scraper…");
    try {
      const res = await fetch("http://localhost:5000/api/run-scraper/stop-scraper", {
        method: "POST",
      });
      const data = await res.json();
      setMessage(data.message || "Scraper stopped successfully!");
      setIsScraping(false);
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>🛠️</div>
          <h1 style={styles.title}>Admin Panel</h1>
          <p style={styles.subtitle}>Manage web scraper operations</p>
        </div>
        
        <div style={styles.content}>
          <div style={styles.buttonGroup}>
            <button 
              style={
                loading && isScraping 
                  ? {...styles.runButton, ...styles.buttonLoading} 
                  : styles.runButton
              }
              onClick={handleRunScraper}
              disabled={loading && isScraping}
              onMouseEnter={(e) => {
                if (!(loading && isScraping)) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 20px rgba(72, 187, 120, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {loading && isScraping ? (
                <span style={styles.buttonContent}>
                  <span style={styles.spinnerSmall}></span>
                  Running...
                </span>
              ) : (
                "🚀 Run Scraper"
              )}
            </button>

            <button 
              style={
                loading && !isScraping 
                  ? {...styles.stopButton, ...styles.buttonLoading} 
                  : styles.stopButton
              }
              onClick={handleStopScraper}
             disabled={!isScraping || loading}
              onMouseEnter={(e) => {
                if (!(loading && !isScraping) && isScraping) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 20px rgba(245, 101, 101, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {loading && !isScraping ? (
                <span style={styles.buttonContent}>
                  <span style={styles.spinnerSmall}></span>
                  Stopping...
                </span>
              ) : (
                "⏹️ Stop Scraper"
              )}
            </button>
          </div>

          {message && (
            <div style={styles.messageContainer}>
              <div style={
                message.includes("Error") ? styles.errorMessage : styles.successMessage
              }>
                <div style={styles.messageIcon}>
                  {message.includes("Error") ? "❌" : 
                   message.includes("Stop") ? "⏹️" : "✅"}
                </div>
                <p style={styles.messageText}>{message}</p>
              </div>
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
  content: {
    display: "flex",
    flexDirection: "column",
    gap: 24
  },
  buttonGroup: {
    display: "flex",
    gap: 16,
    flexDirection: "column"
  },
  runButton: {
    width: "100%",
    background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
    color: "white",
    border: "none",
    padding: "16px 24px",
    borderRadius: 12,
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    outline: "none"
  },
  stopButton: {
    width: "100%",
    background: "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)",
    color: "white",
    border: "none",
    padding: "16px 24px",
    borderRadius: 12,
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    outline: "none",
    opacity: 0.7
  },
  buttonLoading: {
    opacity: 0.7,
    cursor: "not-allowed",
    transform: "none !important",
    boxShadow: "none !important"
  },
  buttonContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  spinnerSmall: {
    width: 16,
    height: 16,
    border: "2px solid transparent",
    borderLeft: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  messageContainer: {
    marginTop: 8
  },
  successMessage: {
    background: "#f0fff4",
    border: "1px solid #9ae6b4",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  errorMessage: {
    background: "#fed7d7",
    border: "1px solid #feb2b2",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  messageIcon: {
    fontSize: "1.2rem"
  },
  messageText: {
    margin: 0,
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#2d3748"
  }
};

// Add CSS animations
const styleSheet = document.styleSheets[0];
const addStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

if (styleSheet) {
  styleSheet.insertRule(addStyles, styleSheet.cssRules.length);
}