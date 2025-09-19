const express = require("express");
const router = express.Router();
const { mysql, DB_CONFIG } = require("../config/db");
const { getNextQuestion, updateUserAbility } = require("../services/adaptiveEngine");
const { evaluateAnswer } = require("../services/geminiService");

const MAX_QUESTIONS = 15;

// Start test → first question
router.post("/start", async (req, res) => {
  const { userId, skill } = req.body;
  if (!userId || !skill) return res.status(400).json({ error: "Missing userId or skill" });

  try {
    const q = await getNextQuestion(userId, skill); // θ=0 initially
    res.json({ 
      question: q, 
      remainingQuestions: MAX_QUESTIONS 
    });
  } catch (err) {
    console.error("❌ Error in /start:", err);
    res.status(500).json({ error: "Failed to start test" });
  }
});

// Submit answer → evaluate with Gemini, update θ, fetch next
// Submit answer → evaluate with Gemini, update θ, fetch next
router.post("/answer", async (req, res) => {
  const { userId, questionId, candidateAnswer, skill, timeTakenSeconds } = req.body;
  if (!userId || !questionId || !candidateAnswer || !skill) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const conn = await mysql.createConnection(DB_CONFIG);

  try {
    // 1. Fetch question text
    const [[qRow]] = await conn.execute(
      "SELECT question_text FROM questions WHERE id = ?",
      [questionId]
    );

    // 2. Send candidateAnswer to Gemini
    const evaluation = await evaluateAnswer(qRow.question_text, candidateAnswer);

    // Convert correctness → boolean
    const isCorrect = evaluation.correctness?.toLowerCase() === "yes";

    // 3. Save attempt + evaluation JSON
    await conn.execute(
      `INSERT INTO user_attempts 
         (user_id, question_id, is_correct, time_taken_seconds, created_at, evaluation)
       VALUES (?, ?, ?, ?, NOW(), ?)`,
      [userId, questionId, isCorrect ? 1 : 0, timeTakenSeconds ?? null, JSON.stringify(evaluation)]
    );

    // 4. Update ability θ
    const theta = await updateUserAbility(userId, questionId, isCorrect);

    // 5. Update ability_at_attempt
    await conn.execute(
      `UPDATE user_attempts
       SET ability_at_attempt = ?
       WHERE user_id = ? AND question_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [theta, userId, questionId]
    );

    // 6. Count distinct questions attempted
    const [[countRow]] = await conn.execute(
      "SELECT COUNT(DISTINCT question_id) AS cnt FROM user_attempts WHERE user_id = ?",
      [userId]
    );
    const distinctAttempts = countRow.cnt;

    let nextQuestion = null;
    if (distinctAttempts < MAX_QUESTIONS) {
      // Fetch next question excluding already attempted ones
      const [attemptedRows] = await conn.execute(
        "SELECT DISTINCT question_id FROM user_attempts WHERE user_id = ?",
        [userId]
      );
      const attemptedIds = attemptedRows.map(r => r.question_id);

      nextQuestion = await getNextQuestion(userId, skill, attemptedIds);
    }

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



// Get test summary after 15 questions
router.get("/summary/:userId", async (req, res) => {
  const { userId } = req.params;
  const conn = await mysql.createConnection(DB_CONFIG);

  try {
    // 1. Get final ability
    const [[userRow]] = await conn.execute(
      "SELECT ability FROM users WHERE id = ?",
      [userId]
    );

    // 2. Get last 15 attempts
    const [attempts] = await conn.execute(
  `SELECT ua.question_id, q.question_text, ua.is_correct,
          ua.ability_at_attempt, ua.evaluation, ua.created_at
   FROM user_attempts ua
   JOIN questions q ON ua.question_id = q.id
   WHERE ua.user_id = ?
   ORDER BY ua.created_at ASC
   LIMIT ${MAX_QUESTIONS}`,
  [userId]
);


    // Mark completion
    const completed = attempts.length >= MAX_QUESTIONS;

    await conn.end();

    res.json({
      userId,
      finalAbility: userRow?.ability ?? 0,
      completed,
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
