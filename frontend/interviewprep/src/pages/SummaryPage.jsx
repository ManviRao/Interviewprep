import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";



// Emotion color mapping
const getEmotionColor = (emotion) => {
  const emotionMap = {
    'happy': '#48bb78',      // green
    'surprise': '#38b2ac',   // teal
    'neutral': '#4299e1',    // blue
    'sad': '#ed8936',        // orange
    'fear': '#ecc94b',       // yellow
    'angry': '#f56565',      // red
    'disgust': '#9f7aea',    // purple
    'no_face': '#a0aec0',    // gray
    'default': '#718096'
  };
  return emotionMap[emotion] || emotionMap['default'];
};

const getConfidenceColor = (confidenceLevel) => {
  const confidenceMap = {
    'Confident': '#48bb78',           // green
    'Moderately Confident': '#ecc94b', // yellow
    'Low Confidence': '#ed8936',       // orange
    'Tensed/Stressed': '#f56565',      // red
    'Neutral': '#4299e1',              // blue
    'No Data': '#a0aec0'               // gray
  };
  return confidenceMap[confidenceLevel] || confidenceMap['Neutral'];
};

// Emotion Chart Component
const EmotionChart = ({ emotionData }) => {
  if (!emotionData || emotionData.length === 0) {
    return (
      <div style={chartStyles.chartContainer}>
        <h3 style={chartStyles.chartTitle}>Emotion Analysis</h3>
        <p style={chartStyles.noDataText}>No emotion data available</p>
      </div>
    );
  }

  const emotionCounts = emotionData.reduce((acc, data) => {
    const emotion = data.emotion || 'neutral';
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {});

  const totalSamples = emotionData.length;
  const emotions = Object.keys(emotionCounts);

  return (
    <div style={chartStyles.chartContainer}>
      <h3 style={chartStyles.chartTitle}>Emotion Distribution</h3>
      <p style={chartStyles.chartDescription}>
        {totalSamples} emotion samples collected during test
      </p>
      
      <div style={chartStyles.emotionBars}>
        {emotions.map(emotion => {
          const count = emotionCounts[emotion];
          const percentage = (count / totalSamples) * 100;
          const color = getEmotionColor(emotion);
          
          return (
            <div key={emotion} style={chartStyles.emotionBar}>
              <div style={chartStyles.emotionLabel}>
                <span style={chartStyles.emotionName}>{emotion}</span>
                <span style={chartStyles.emotionCount}>{count}</span>
              </div>
              <div style={chartStyles.barContainer}>
                <div 
                  style={{
                    ...chartStyles.barFill,
                    width: `${percentage}%`,
                    background: color
                  }}
                ></div>
              </div>
              <span style={chartStyles.percentage}>{percentage.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Confidence Level Component
const ConfidenceLevel = ({ emotionStats }) => {
  if (!emotionStats) {
    return (
      <div style={confidenceStyles.container}>
        <h3 style={confidenceStyles.title}>Confidence Level</h3>
        <p style={confidenceStyles.noData}>No emotion data available</p>
      </div>
    );
  }

  const { confidenceLevel, engagement, stress, dominantEmotion, totalSamples } = emotionStats;
  const color = getConfidenceColor(confidenceLevel);

  return (
    <div style={confidenceStyles.container}>
      <h3 style={confidenceStyles.title}>Confidence Analysis</h3>
      
      <div 
        style={{
          ...confidenceStyles.confidenceBadge,
          background: color
        }}
      >
        <strong>{confidenceLevel}</strong>
      </div>
      
      <div style={confidenceStyles.stats}>
        <div style={confidenceStyles.statItem}>
          <span style={confidenceStyles.statLabel}>Dominant Emotion:</span>
          <span style={confidenceStyles.statValue}>{dominantEmotion}</span>
        </div>
        <div style={confidenceStyles.statItem}>
          <span style={confidenceStyles.statLabel}>Engagement:</span>
          <span style={confidenceStyles.statValue}>{engagement}%</span>
        </div>
        <div style={confidenceStyles.statItem}>
          <span style={confidenceStyles.statLabel}>Stress Level:</span>
          <span style={confidenceStyles.statValue}>{stress}%</span>
        </div>
        <div style={confidenceStyles.statItem}>
          <span style={confidenceStyles.statLabel}>Total Samples:</span>
          <span style={confidenceStyles.statValue}>{totalSamples}</span>
        </div>
      </div>

      <div style={confidenceStyles.feedback}>
        <h4>Emotional Feedback:</h4>
        {confidenceLevel === 'Confident' && (
          <p>🎯 Excellent! You maintained high confidence and composure throughout the test.</p>
        )}
        {confidenceLevel === 'Moderately Confident' && (
          <p>👍 Good composure. With more practice, you can build even greater confidence.</p>
        )}
        {confidenceLevel === 'Low Confidence' && (
          <p>💡 You showed some uncertainty. Practice and preparation will help build confidence.</p>
        )}
        {confidenceLevel === 'Tensed/Stressed' && (
          <p>🧘 Consider relaxation techniques before interviews to manage stress better.</p>
        )}
        {confidenceLevel === 'Neutral' && (
          <p>😐 You maintained a neutral composure throughout the assessment.</p>
        )}
        {confidenceLevel === 'No Data' && (
          <p>📷 No emotion data was collected during this session.</p>
        )}
      </div>
    </div>
  );
};

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
          {/* <div 
            style={{
              ...chartStyles.finalPoint,
              left: '100%',
              bottom: `${((finalAbility - minAbility) / range) * 100}%`,
            }}
            title={`Final: ${finalAbility.toFixed(2)}`}
          >
            Final
          </div> */}
          
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
      
      {/* X-axis labels */}
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
        {/* <div style={chartStyles.legendItem}>
          <div style={{...chartStyles.legendDot, background: '#667eea', border: '2px dashed #667eea'}}></div>
          <span>Final Ability</span>
        </div> */}
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
  const [emotionData, setEmotionData] = useState([]);
  const [emotionStats, setEmotionStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { sessionId } = useParams() || {};
const idToFetch = sessionId || localStorage.getItem("sessionId");

  useEffect(() => {
    const fetchSummaryAndEmotions = async () => {
      try {
        const userId = localStorage.getItem("userId");
       // const sessionId = localStorage.getItem("sessionId");

        console.log("📊 Fetching summary and emotions for:", { userId, idToFetch });

        // 1. Fetch test summary
        const summaryRes = await axios.get(
          `http://localhost:5000/api/questions/summary/${userId}/${idToFetch}`
        );
        setSummary(summaryRes.data);

        // 2. ✅ FETCH EMOTION DATA FROM DATABASE
        try {
          const emotionRes = await axios.get(
            `http://localhost:5000/api/emotion/session/${idToFetch}`
          );
          
          console.log("🎭 Emotion API response:", emotionRes.data);
          
          if (emotionRes.data.emotionData) {
            setEmotionData(emotionRes.data.emotionData);
            
            // 3. ✅ FETCH EMOTION STATISTICS
            const statsRes = await axios.get(
              `http://localhost:5000/api/emotion/session/${idToFetch}/stats`
            );
            setEmotionStats(statsRes.data.stats);
            console.log("📈 Emotion stats:", statsRes.data.stats);
          } else {
            console.log("❌ No emotion data in response");
          }
        } catch (emotionError) {
          console.error("❌ Emotion API error:", emotionError);
        }

      } catch (err) {
        console.error("❌ Failed to fetch data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaryAndEmotions();
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
            style={activeTab === 'overview' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('overview')}
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

        {activeTab === 'overview' ? (
          <div style={styles.overviewContainer}>
            {/* ✅ NEW: Emotion Tracking Section */}
            <div style={styles.emotionSection}>
              <h2 style={styles.sectionTitle}>🎭 Emotion & Confidence Analysis</h2>
              
              <div style={styles.emotionDashboard}>
                <ConfidenceLevel emotionStats={emotionStats} />
                <EmotionChart emotionData={emotionData} />
              </div>
            </div>

            {/* Your existing performance summary - UNCHANGED */}
            <div style={styles.performanceSection}>
              <h2 style={styles.sectionTitle}>📊 Performance Summary</h2>
              
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
          </div>
        ) : (
          /* Detailed View - UNCHANGED */
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

// Chart Styles
const chartStyles = {
  progressContainer: {
    marginBottom: 20
  },
  progressLabel: {
    fontSize: "0.9rem",
    color: "#718096",
    marginBottom: 8,
    fontWeight: "600"
  },
  progressBar: {
    width: "100%",
    height: 12,
    background: "#e2e8f0",
    borderRadius: 6,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease"
  },
  progressValue: {
    fontSize: "0.8rem",
    color: "#718096",
    marginTop: 4,
    textAlign: "right"
  },
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
  noDataText: {
    textAlign: 'center',
    color: '#718096',
    fontStyle: 'italic'
  },
  emotionBars: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  emotionBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  emotionLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '120px',
    fontSize: '0.9rem'
  },
  emotionName: {
    fontWeight: '600',
    color: '#2d3748',
    textTransform: 'capitalize'
  },
  emotionCount: {
    color: '#718096'
  },
  barContainer: {
    flex: 1,
    height: '20px',
    background: '#f1f5f9',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: '10px'
  },
  percentage: {
    width: '50px',
    textAlign: 'right',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#2d3748'
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
  },
  pieChartContainer: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    textAlign: 'center'
  },
  pieChart: {
    position: 'relative',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    margin: '0 auto 20px',
    background: '#e2e8f0'
  },
  pieSegment: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    transition: 'all 0.3s ease'
  },
  pieCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60px',
    height: '60px',
    background: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  piePercentage: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2d3748'
  },
  legendColor: {
    width: '12px',
    height: '12px',
    borderRadius: '2px'
  }
};

// Confidence Level Styles
const confidenceStyles = {
  container: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '15px',
    textAlign: 'center'
  },
  confidenceBadge: {
    color: 'white',
    padding: '12px 20px',
    borderRadius: '25px',
    fontSize: '1.1rem',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  stats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px'
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9'
  },
  statLabel: {
    fontWeight: '600',
    color: '#4a5568',
    fontSize: '0.9rem'
  },
  statValue: {
    color: '#2d3748',
    fontSize: '0.9rem',
    textTransform: 'capitalize'
  },
  feedback: {
    background: '#f7fafc',
    padding: '15px',
    borderRadius: '8px',
    borderLeft: '4px solid #4299e1'
  },
  noData: {
    textAlign: 'center',
    color: '#718096',
    fontStyle: 'italic'
  }
};

// Main Styles
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
    maxWidth: 1200,
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
  overviewContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 30
  },
  emotionSection: {
    background: "#f8fafc",
    padding: 25,
    borderRadius: 15,
    border: "1px solid #e2e8f0"
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 10
  },
  emotionDashboard: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 25
  },
  performanceSection: {
    display: "flex",
    flexDirection: "column",
    gap: 25
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
    marginBottom: 30
  },
  summaryItem: {
    display: "flex",
    alignItems: "center",
    gap: 15,
    background: "#f7fafc",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #e2e8f0"
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
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 25,
    marginBottom: 20
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

// Add CSS animations
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

export default SummaryPage;