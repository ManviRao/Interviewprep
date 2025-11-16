import React, { useEffect, useState } from "react";
import axios from "axios";

function FeedbackTable() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/feedback")
      .then(res => {
        setFeedbackList(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading feedback...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>All Feedback</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>User ID</th>
            <th style={thStyle}>Session ID</th>
            <th style={thStyle}>Resume Rating</th>
            <th style={thStyle}>Adaptive Rating</th>
            <th style={thStyle}>Feedback</th>
            <th style={thStyle}>Date</th>
          </tr>
        </thead>
        <tbody>
          {feedbackList.map(f => (
            <tr key={f.id}>
              <td style={tdStyle}>{f.user_id}</td>
              <td style={tdStyle}>{f.session_id}</td>
              <td style={tdStyle}>{f.resume_rating}</td>
              <td style={tdStyle}>{f.adaptive_rating}</td>
              <td style={tdStyle}>{f.feedback_text || "-"}</td>
              <td style={tdStyle}>{new Date(f.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  border: "1px solid #CBD5E0",
  padding: 10,
  background: "#F7FAFC",
  textAlign: "left"
};

const tdStyle = {
  border: "1px solid #E2E8F0",
  padding: 10
};

export default FeedbackTable;
