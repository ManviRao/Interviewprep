const express = require("express");
const router = express.Router();
const { mysql, DB_CONFIG } = require("../config/db");
const { getNextQuestion, updateUserAbility } = require("../services/adaptiveEngine");
const { evaluateAnswer } = require("../services/geminiService");

var MAX_QUESTIONS = 5;


// Start test → first question
router.post("/start", async (req, res) => {
  const { userId, skill } = req.body;
  if (!userId || !skill) return res.status(400).json({ error: "Missing userId or skill" });

  const conn = await mysql.createConnection(DB_CONFIG);

  try {
    //check if user exists
    const [[userRow]] = await conn.execute(
  "SELECT COUNT(*) AS cnt FROM users WHERE id = ?",
  [userId]
);

if (userRow.cnt === 0) {  // access the count using the alias "cnt"
  await conn.end();
  return res.status(404).json({ error: "User not found" });
}

    // 1. Create a new test session
    const [sessionResult] = await conn.execute(
      "INSERT INTO test_sessions (user_id, skill) VALUES (?, ?)",
      [userId, skill]
    );
    const sessionId = sessionResult.insertId;

    // 2. Fetch first question
    const firstQuestion = await getNextQuestion(userId, skill,sessionId,[]);
  
    await conn.end();

    res.json({ 
      sessionId,          // return session ID
       sessionId, // return session ID because frontend needs to send it back with each answer
      question: firstQuestion,
      remainingQuestions: MAX_QUESTIONS-1
    });
    
  } catch (err) {
    console.error("❌ Error in /start:", err);
    await conn.end();
    res.status(500).json({ error: "Failed to start test" });
  }
});

// Submit answer → evaluate with Gemini, update θ, fetch next
router.post("/answer", async (req, res) => {
  console.log(req.body);
  const { userId, questionId, candidateAnswer, skill, sessionId, timeTakenSeconds } = req.body;
  if (!userId || !questionId || !candidateAnswer || !skill || !sessionId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const conn = await mysql.createConnection(DB_CONFIG);

  try {
    // 1. Check if user already attempted this question in this session
    const [[existingAttempt]] = await conn.execute(
      "SELECT id FROM user_attempts WHERE session_id = ? AND user_id = ? AND question_id = ?",
      [sessionId, userId, questionId]
    );

    // if (existingAttempt) {
    //   await conn.end();
    //   return res.status(400).json({ error: "Question already attempted" });
    // }
    // 1. Fetch question text
    const [[qRow]] = await conn.execute(
      "SELECT question_text FROM questions WHERE id = ?",
      [questionId]
    );

    // 2. Send candidateAnswer to Gemini
    const evaluation = await evaluateAnswer(qRow.question_text, candidateAnswer);
    const isCorrect = evaluation.correctness?.toLowerCase() === "yes";

   

    // 6. Count distinct questions attempted in this session
    const [[countRow]] = await conn.execute(
      "SELECT COUNT(*) AS cnt FROM user_attempts WHERE session_id = ? and user_id = ?",
      [sessionId, userId]
    );
    const distinctAttempts = countRow.cnt;

    let nextQuestion = null;
    if (distinctAttempts < MAX_QUESTIONS) {
      const [attemptedRows] = await conn.execute(
        "SELECT DISTINCT question_id FROM user_attempts WHERE session_id = ?",
        [sessionId]
      );
      const attemptedIds = attemptedRows.map(r => r.question_id);

      nextQuestion = await getNextQuestion(userId, skill,sessionId,attemptedIds);
    }

     // 3. Save attempt linked to session
     if ( distinctAttempts < MAX_QUESTIONS) {
       await conn.execute(
         `INSERT INTO user_attempts 
            (user_id, question_id, is_correct, time_taken_seconds, created_at, evaluation, session_id)
          VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
         [userId, questionId, isCorrect ? 1 : 0, timeTakenSeconds ?? null, JSON.stringify(evaluation), sessionId]
       );
      }
    // 4. Update ability θ
    const theta = await updateUserAbility(userId, questionId, isCorrect);

    // 5. Update ability_at_attempt
    await conn.execute(
      `UPDATE user_attempts
       SET ability_at_attempt = ?
       WHERE user_id = ? AND question_id = ? AND session_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [theta, userId, questionId, sessionId]
    );
    await conn.end();

    res.json({
      status: "ok",
      ability: theta,
      evaluation,
      remainingQuestions: MAX_QUESTIONS - distinctAttempts,
      nextQuestion
    });

  } catch (err) {
    console.error("❌ Error in /answer:", err);
    await conn.end();
    res.status(500).json({ error: "Failed to process answer" });
  }
});

// Get test summary for a session
router.get("/summary/:userId/:sessionId", async (req, res) => {
  const { userId, sessionId } = req.params;
  const conn = await mysql.createConnection(DB_CONFIG);

  try {
    const [[sessionRow]] = await conn.execute(
      "SELECT  skill, completed FROM test_sessions WHERE id = ? and user_id = ?",
      [sessionId, userId]
    );
    if (!sessionRow ) return res.status(404).json({ error: "Session not found" });


    const [attempts] = await conn.execute(
      `SELECT ua.question_id, q.question_text, ua.is_correct,
              ua.ability_at_attempt, ua.evaluation, ua.created_at
       FROM user_attempts ua
       JOIN questions q ON ua.question_id = q.id
       WHERE ua.session_id = ? and ua.user_id = ?
       ORDER BY ua.created_at ASC`,
      [sessionId, userId]
    );

    const completed = attempts.length >= MAX_QUESTIONS;

    // Mark session as completed if necessary
    if (completed && !sessionRow.completed) {
      await conn.execute(
        "UPDATE test_sessions SET completed = TRUE WHERE id = ?",
        [sessionId]
      );
    }

    await conn.end();

    res.json({
      userId,
      finalAbility: attempts.length ? attempts[attempts.length - 1].ability_at_attempt : 0,
      distinctAttempts: attempts.length,
      attempts: attempts.map(a => ({
        questionId: a.question_id,
        question: a.question_text,
        isCorrect: !!a.is_correct,
        abilityAtAttempt: a.ability_at_attempt,
        evaluation: a.evaluation ?? null,
        timestamp: a.created_at
      }))
    });

  } catch (err) {
    console.error("❌ Error in /summary:", err);
    await conn.end();
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

module.exports = router; 