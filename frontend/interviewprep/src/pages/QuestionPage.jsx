import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function QuestionPage() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [remainingQuestions, setRemainingQuestions] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const storedQuestion = localStorage.getItem("currentQuestion");
    const storedRemaining = localStorage.getItem("remainingQuestions");

    if (storedQuestion) setCurrentQuestion(JSON.parse(storedQuestion));
    if (storedRemaining) setRemainingQuestions(parseInt(storedRemaining, 10));
  }, []);

  const handleSubmit = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const skill = localStorage.getItem("skill");
      const sessionId = localStorage.getItem("sessionId");

      const res = await axios.post("http://localhost:5000/api/questions/answer", {
        userId,
        sessionId, // ✅ real sessionId
        questionId: currentQuestion.id,
        candidateAnswer: answer, // ✅ matches backend field name
        skill,
        timeTakenSeconds: 30,
      });

      if (res.data.nextQuestion) {
        setCurrentQuestion(res.data.nextQuestion);
        localStorage.setItem("currentQuestion", JSON.stringify(res.data.nextQuestion));
        setRemainingQuestions(res.data.remainingQuestions);
        localStorage.setItem("remainingQuestions", res.data.remainingQuestions);
        setAnswer("");
      } else {
        navigate("/summary");
      }
    } catch (err) {
      console.error("❌ Failed to submit answer", err);
      alert("Failed to submit answer. Check backend.");
    }
  };

  if (!currentQuestion) return <h2>Loading question...</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Question</h2>
      <p>{currentQuestion.question_text}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={5}
        cols={50}
      />
      <br />
      <button onClick={handleSubmit}>Submit Answer</button>
      <p>Remaining Questions: {remainingQuestions}</p>
    </div>
  );
}

export default QuestionPage;
