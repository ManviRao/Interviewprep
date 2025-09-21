import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function StartTestPage() {
  const [userId, setUserId] = useState(2);
  const [skill, setSkill] = useState("java");
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/questions/start", {
        userId,
        skill,
      });

      // ✅ Save everything to localStorage
      localStorage.setItem("userId", userId);
      localStorage.setItem("skill", skill);
      localStorage.setItem("sessionId", res.data.sessionId); // real session id from DB
      localStorage.setItem("currentQuestion", JSON.stringify(res.data.question));
      localStorage.setItem("remainingQuestions", res.data.remainingQuestions);

      navigate("/question");
    } catch (err) {
      console.error("❌ Failed to start test", err);
      alert("Failed to start test. Check backend.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Start Test</h1>
      <label>User ID: </label>
      <input
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <br />
      <label>Skill: </label>
      <input
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
      />
      <br />
      <button onClick={handleStart}>Start Test</button>
    </div>
  );
}

export default StartTestPage;
