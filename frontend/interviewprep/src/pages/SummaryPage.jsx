import React, { useEffect, useState } from "react";
import axios from "axios";

function SummaryPage() {
  const [summary, setSummary] = useState(null);

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
      }
    };

    fetchSummary();
  }, []);

  if (!summary) return <h2>Loading summary...</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Test Summary</h1>
      <p>User ID: {summary.userId}</p>
      <p>Final Ability: {summary.finalAbility}</p>
      <p>Total Questions Attempted: {summary.distinctAttempts}</p>

      <h2>Attempts</h2>
      <ul>
        {summary.attempts.map((a, idx) => (
          <li key={idx}>
            <strong>Q:</strong> {a.question} <br />
            <strong>Correct:</strong> {a.isCorrect ? "Yes" : "No"} <br />
            <strong>Ability at Attempt:</strong> {a.abilityAtAttempt} <br />
            <strong>Evaluation:</strong>{" "}
            {a.evaluation ? JSON.stringify(a.evaluation) : "N/A"}
            <br />
            <strong>Timestamp:</strong> {a.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SummaryPage;


