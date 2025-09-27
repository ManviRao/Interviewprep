import React, { useEffect, useState } from "react";
import axios from "axios";

// Simple chart components since we're not using external libraries
const ProgressBar = ({ value, max, label, color }) => (
  <div style={chartStyles.progressContainer}>
    <div style={chartStyles.progressLabel}>{label}</div>
    <div style={chartStyles.progressBar}>
      <div 
        style={{
          ...chartStyles.progressFill,
          width: `${(value / max) * 100}%`,
          background: color
        }}
      ></div>
    </div>
    <div style={chartStyles.progressValue}>{value}/{max}</div>
  </div>
);

const AbilityChart = ({ finalAbility, attempts }) => {
  const abilityPoints = attempts.map((a, idx) => ({
    question: `Q${idx + 1}`,
    ability: a.abilityAtAttempt,
    correct: a.isCorrect
  }));

  // Calculate min/max for scaling - include finalAbility in the range
  const allAbilities = [...abilityPoints.map(p => p.ability), finalAbility];
  const minAbility = Math.min(...allAbilities);
  const maxAbility = Math.max(...allAbilities);
  const range = Math.max(maxAbility - minAbility, 0.1);

  return (
    <div style={chartStyles.chartContainer}>
      <h3 style={chartStyles.chartTitle}>Ability Progression</h3>
      <p style={chartStyles.chartDescription}>
        Shows how your estimated ability changed after each question
      </p>
      
      <div style={chartStyles.chartWrapper}>
        {/* Y-axis labels */}
        <div style={chartStyles.yAxis}>
          <span>{maxAbility.toFixed(1)}</span>
          <span>{((maxAbility + minAbility) / 2).toFixed(1)}</span>
          <span>{minAbility.toFixed(1)}</span>
        </div>
        
        {/* Chart area */}
        <div style={chartStyles.chartArea}>
          {/* Grid line in the middle */}
          <div style={chartStyles.gridLine}></div>
          
          {/* Data points */}
          {abilityPoints.map((point, idx) => (
            <div 
              key={idx}
              style={{
                ...chartStyles.dataPoint,
                left: `${(idx / (abilityPoints.length - 1)) * 100}%`,
                bottom: `${((point.ability - minAbility) / range) * 100}%`,
                background: point.correct ? '#48bb78' : '#f56565'
              }}
              title={`${point.question}: ${point.ability.toFixed(2)}`}
            >
              {point.question}
            </div>
          ))}
          
          {/* Final ability point */}
          <div 
            style={{
              ...chartStyles.finalPoint,
              left: '100%',
              bottom: `${((finalAbility - minAbility) / range) * 100}%`,
            }}
            title={`Final: ${finalAbility.toFixed(2)}`}
          >
            Final
          </div>
          
          {/* Connection lines */}
          <svg style={chartStyles.linesSvg} width="100%" height="100%">
            {/* Lines between question points */}
            {abilityPoints.map((point, idx) => {
              if (idx === abilityPoints.length - 1) return null;
              
              const nextPoint = abilityPoints[idx + 1];
              const x1 = (idx / (abilityPoints.length - 1)) * 100;
              const y1 = 100 - ((point.ability - minAbility) / range) * 100;
              const x2 = ((idx + 1) / (abilityPoints.length - 1)) * 100;
              const y2 = 100 - ((nextPoint.ability - minAbility) / range) * 100;
              
              return (
                <line
                  key={idx}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="#667eea"
                  strokeWidth="2"
                />
              );
            })}
            
            {/* Line from last question to final ability */}
            {abilityPoints.length > 0 && (
              <line
                x1={`${((abilityPoints.length - 1) / (abilityPoints.length - 1)) * 100}%`}
                y1={`${100 - ((abilityPoints[abilityPoints.length - 1].ability - minAbility) / range) * 100}%`}
                x2="100%"
                y2={`${100 - ((finalAbility - minAbility) / range) * 100}%`}
                stroke="#667eea"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
            )}
          </svg>
        </div>
      </div>
      
      {/* X-axis labels - FIXED */}
      <div style={chartStyles.xAxis}>
        <span>Start (Q1)</span>
        <span>Final: {finalAbility.toFixed(2)}</span>
      </div>
      
      {/* Legend */}
      <div style={chartStyles.legend}>
        <div style={chartStyles.legendItem}>
          <div style={{...chartStyles.legendDot, background: '#48bb78'}}></div>
          <span>Correct Answer</span>
        </div>
        <div style={chartStyles.legendItem}>
          <div style={{...chartStyles.legendDot, background: '#f56565'}}></div>
          <span>Incorrect Answer</span>
        </div>
        <div style={chartStyles.legendItem}>
          <div style={{...chartStyles.legendDot, background: '#667eea', border: '2px dashed #667eea'}}></div>
          <span>Final Ability</span>
        </div>
      </div>
    </div>
  );
};

const CorrectnessChart = ({ attempts }) => {
  const correctCount = attempts.filter(a => a.isCorrect).length;
  const total = attempts.length;
  const percentage = total > 0 ? (correctCount / total) * 100 : 0;

  return (
    <div style={chartStyles.pieChartContainer}>
      <h3 style={chartStyles.chartTitle}>Performance Summary</h3>
      <div style={chartStyles.pieChart}>
        <div 
          style={{
            ...chartStyles.pieSegment,
            background: `conic-gradient(
              #48bb78 0% ${percentage}%, 
              #f56565 ${percentage}% 100%
            )`
          }}
        ></div>
        <div style={chartStyles.pieCenter}>
          <span style={chartStyles.piePercentage}>{percentage.toFixed(1)}%</span>
        </div>
      </div>
      <div style={chartStyles.legend}>
        <div style={chartStyles.legendItem}>
          <div style={{...chartStyles.legendColor, background: '#48bb78'}}></div>
          <span>Correct: {correctCount}</span>
        </div>
        <div style={chartStyles.legendItem}>
          <div style={{...chartStyles.legendColor, background: '#f56565'}}></div>
          <span>Incorrect: {total - correctCount}</span>
        </div>
      </div>
    </div>
  );
};

function SummaryPage() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('charts'); // 'charts' or 'detailed'

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const sessionId = localStorage.getItem("sessionId");

        const res = await axios.get(
          `http://localhost:5000/api/questions/summary/${userId}/${sessionId}`
        );
        setSummary(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch summary", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <h2 style={styles.loadingText}>Loading summary...</h2>
      </div>
    );
  }

  if (!summary) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.errorContainer}>
            <div style={styles.errorIcon}>⚠️</div>
            <h2 style={styles.errorText}>Failed to load summary</h2>
            <p style={styles.errorSubtext}>Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  const correctCount = summary.attempts.filter(a => a.isCorrect).length;
  const totalQuestions = summary.attempts.length;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>📊</div>
          <h1 style={styles.title}>Test Summary</h1>
          <p style={styles.subtitle}>Your interview preparation results</p>
        </div>
        
        {/* Tab Navigation */}
        <div style={styles.tabContainer}>
          <button 
            style={activeTab === 'charts' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('charts')}
          >
            📈 Overview
          </button>
          <button 
            style={activeTab === 'detailed' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('detailed')}
          >
            📋 Detailed Results
          </button>
        </div>

        {activeTab === 'charts' ? (
          /* Charts View */
          <div style={styles.chartsContainer}>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <div style={styles.summaryIcon}>👤</div>
                <div>
                  <div style={styles.summaryLabel}>User ID</div>
                  <div style={styles.summaryValue}>{summary.userId}</div>
                </div>
              </div>
              
              <div style={styles.summaryItem}>
                <div style={styles.summaryIcon}>🎯</div>
                <div>
                  <div style={styles.summaryLabel}>Final Ability</div>
                  <div style={styles.summaryValue}>{summary.finalAbility.toFixed(2)}</div>
                </div>
              </div>
              
              <div style={styles.summaryItem}>
                <div style={styles.summaryIcon}>📝</div>
                <div>
                  <div style={styles.summaryLabel}>Questions Attempted</div>
                  <div style={styles.summaryValue}>{summary.distinctAttempts}</div>
                </div>
              </div>

              <div style={styles.summaryItem}>
                <div style={styles.summaryIcon}>✅</div>
                <div>
                  <div style={styles.summaryLabel}>Correct Answers</div>
                  <div style={styles.summaryValue}>{correctCount}/{totalQuestions}</div>
                </div>
              </div>
            </div>

            <div style={styles.chartsGrid}>
              <CorrectnessChart attempts={summary.attempts} />
              <AbilityChart 
                finalAbility={summary.finalAbility} 
                attempts={summary.attempts} 
              />
            </div>

            <ProgressBar 
              value={correctCount}
              max={totalQuestions}
              label="Correct Answers"
              color="#48bb78"
            />

            <div style={styles.insightsSection}>
              <h3 style={styles.insightsTitle}>📋 Key Insights</h3>
              <div style={styles.insightsGrid}>
                <div style={styles.insightCard}>
                  <div style={styles.insightIcon}>⚡</div>
                  <div style={styles.insightText}>
                    <strong>Performance:</strong> {correctCount === totalQuestions ? 
                      "Excellent! Perfect score!" : 
                      `You got ${correctCount} out of ${totalQuestions} questions correct`}
                  </div>
                </div>
                <div style={styles.insightCard}>
                  <div style={styles.insightIcon}>📈</div>
                  <div style={styles.insightText}>
                    <strong>Progress:</strong> Your ability score changed from {
                      summary.attempts[0]?.abilityAtAttempt.toFixed(2) || 0
                    } to {summary.finalAbility.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Detailed View */
          <div style={styles.attemptsSection}>
            <h2 style={styles.attemptsTitle}>Detailed Attempts</h2>
            <div style={styles.attemptsList}>
              {summary.attempts.map((a, idx) => (
                <div key={idx} style={styles.attemptCard}>
                  <div style={styles.questionHeader}>
                    <span style={styles.questionNumber}>Q{idx + 1}</span>
                    <span style={a.isCorrect ? styles.correctBadge : styles.incorrectBadge}>
                      {a.isCorrect ? "✅ Correct" : "❌ Incorrect"}
                    </span>
                  </div>
                  
                  <p style={styles.questionText}>{a.question}</p>
                  
                  <div style={styles.attemptDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Ability at Attempt:</span>
                      <span style={styles.detailValue}>{a.abilityAtAttempt.toFixed(2)}</span>
                    </div>
                    
                    {a.evaluation && (
                      <div style={styles.evaluationSection}>
                        <div style={styles.detailRow}>
                          <span style={styles.detailLabel}>Clarity:</span>
                          <span style={styles.detailValue}>{a.evaluation.clarity || "N/A"}</span>
                        </div>
                        <div style={styles.detailRow}>
                          <span style={styles.detailLabel}>Completeness:</span>
                          <span style={styles.detailValue}>{a.evaluation.completeness || "N/A"}</span>
                        </div>
                        <div style={styles.feedbackSection}>
                          <span style={styles.detailLabel}>Feedback:</span>
                          <p style={styles.feedbackText}>{a.evaluation.feedback || "No feedback available"}</p>
                        </div>
                      </div>
                    )}
                    
                    <div style={styles.timestamp}>
                      <span style={styles.detailLabel}>Timestamp:</span>
                      <span style={styles.detailValue}>{new Date(a.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Updated chart styles - much simpler and cleaner
const chartStyles = {
  chartContainer: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  chartTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '8px',
    textAlign: 'center'
  },
  chartDescription: {
    fontSize: '0.8rem',
    color: '#718096',
    textAlign: 'center',
    marginBottom: '20px'
  },
  chartWrapper: {
    display: 'flex',
    height: '200px',
    marginBottom: '10px'
  },
  yAxis: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '40px',
    fontSize: '0.7rem',
    color: '#718096',
    fontWeight: '600',
    padding: '10px 0'
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    background: '#f7fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginLeft: '10px'
  },
  gridLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: '1px',
    background: '#e2e8f0',
    transform: 'translateY(-50%)'
  },
  dataPoint: {
    position: 'absolute',
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    transform: 'translate(-50%, 50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    border: '3px solid white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    zIndex: 2
  },
  linesSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1
  },
  xAxis: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: '#718096',
    marginTop: '10px'
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '15px',
    fontSize: '0.8rem'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%'
  },
  finalPoint: {
    position: 'absolute',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    transform: 'translate(-50%, 50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#667eea',
    fontSize: '10px',
    fontWeight: 'bold',
    border: '2px dashed #667eea',
    background: 'white',
    zIndex: 2
  }

};

// Rest of the styles remain the same as previous version, with some additions:
const styles = {
  // ... (all previous styles remain the same)
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
    maxWidth: 900,
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  header: {
    marginBottom: 32,
    textAlign: "center"
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
  tabContainer: {
    display: "flex",
    marginBottom: 30,
    background: "#f7fafc",
    borderRadius: 12,
    padding: 4
  },
  tab: {
    flex: 1,
    padding: "12px 16px",
    border: "none",
    background: "transparent",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "600",
    color: "#718096",
    transition: "all 0.3s ease"
  },
  activeTab: {
    flex: 1,
    padding: "12px 16px",
    border: "none",
    background: "white",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "600",
    color: "#667eea",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease"
  },
  chartsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 20
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 20,
    marginBottom: 20
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
    marginBottom: 30,
    padding: 20,
    background: "#f7fafc",
    borderRadius: 12
  },
  summaryItem: {
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  summaryIcon: {
    fontSize: "2rem"
  },
  summaryLabel: {
    fontSize: "0.9rem",
    color: "#718096",
    fontWeight: "600"
  },
  summaryValue: {
    fontSize: "1.3rem",
    fontWeight: "700",
    color: "#2d3748"
  },
  insightsSection: {
    background: "#f0fff4",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #c6f6d5"
  },
  insightsTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 15
  },
  insightsGrid: {
    display: "grid",
    gap: 15
  },
  insightCard: {
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  insightIcon: {
    fontSize: "1.5rem"
  },
  insightText: {
    color: "#2d3748",
    lineHeight: 1.4
  },
  // ... (rest of the previous styles remain unchanged)
  attemptsSection: {
    marginTop: 20
  },
  attemptsTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: "2px solid #e2e8f0"
  },
  attemptsList: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  attemptCard: {
    background: "#f8fafc",
    borderRadius: 12,
    padding: 20,
    border: "1px solid #e2e8f0",
    transition: "all 0.3s ease"
  },
  questionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  questionNumber: {
    fontWeight: "700",
    color: "#667eea",
    fontSize: "1.1rem"
  },
  correctBadge: {
    background: "#48bb78",
    color: "white",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: "0.9rem",
    fontWeight: "600"
  },
  incorrectBadge: {
    background: "#f56565",
    color: "white",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: "0.9rem",
    fontWeight: "600"
  },
  questionText: {
    fontSize: "1rem",
    color: "#2d3748",
    lineHeight: 1.5,
    marginBottom: 16,
    fontWeight: "500"
  },
  attemptDetails: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  detailLabel: {
    fontWeight: "600",
    color: "#4a5568",
    fontSize: "0.9rem"
  },
  detailValue: {
    color: "#2d3748",
    fontSize: "0.9rem"
  },
  evaluationSection: {
    background: "white",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    border: "1px solid #e2e8f0"
  },
  feedbackSection: {
    marginTop: 8
  },
  feedbackText: {
    color: "#4a5568",
    fontSize: "0.9rem",
    lineHeight: 1.4,
    margin: "4px 0 0 0",
    fontStyle: "italic"
  },
  timestamp: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1px solid #e2e8f0"
  },
  loadingContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  spinner: {
    width: 50,
    height: 50,
    border: "4px solid #e2e8f0",
    borderLeft: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: 20
  },
  loadingText: {
    fontSize: "1.5rem",
    color: "white",
    fontWeight: "600"
  },
  errorContainer: {
    textAlign: "center",
    padding: 40
  },
  errorIcon: {
    fontSize: "4rem",
    marginBottom: 16
  },
  errorText: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 8
  },
  errorSubtext: {
    color: "#718096",
    fontSize: "1rem"
  }
};

export default SummaryPage;