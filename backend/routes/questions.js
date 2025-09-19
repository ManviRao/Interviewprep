const express = require("express");
const router = express.Router();
const { mysql, DB_CONFIG } = require("../config/db");
const { getNextQuestion, updateUserAbility } = require("../services/adaptiveEngine");
const { updateQuestionDifficulty } = require("../services/updateQuestion");

// Start test → get first question
router.post("/start", async (req, res) => {
  const { userId } = req.body;
  try {
    const q = await getNextQuestion(userId); // θ=0 initially
    res.json({ question: q });
  } catch (err) {
    console.error("❌ Error in /start:", err);
    res.status(500).json({ error: "Failed to start test" });
  }
});

// Submit answer → update ability & get next question
router.post("/answer", async (req, res) => {
  const { userId, questionId, isCorrect, timeTakenSeconds } = req.body;

  if (!userId || !questionId || isCorrect == null) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const conn = await mysql.createConnection(DB_CONFIG);

  try {
    // 1. Save attempt
    await conn.execute(
      `INSERT INTO user_attempts (user_id, question_id, is_correct, time_taken_seconds, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [userId, questionId, isCorrect ? 1 : 0, timeTakenSeconds ?? null]
    );

    // 2. Update user ability θ
    const theta = await updateUserAbility(userId, questionId, isCorrect);
 

    // 2a. Update ability_at_attempt in this attempt row
    await conn.execute(
      `UPDATE user_attempts
       SET ability_at_attempt = ?
       WHERE user_id = ? AND question_id = ?`,
      [theta, userId, questionId]
    );

    // 3. Update ability in users table
    try {
  const [result] = await conn.execute(
    `UPDATE users SET ability = ? WHERE id = ?`,
    [theta, userId]
  );

  if (result.affectedRows === 0) {
    console.log(`User ID ${userId} not found in users table`);
  }
} catch (err) {
  console.error("Error updating users table:", err);
}


    // 4. Update ability_at_attempt in user_attempts
    await conn.execute(
      `UPDATE user_attempts
       SET ability_at_attempt = ?
       WHERE user_id = ? AND question_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [theta, userId, questionId]
    );

    // 5. Get next question based on updated θ
    const nextQuestion = await getNextQuestion(userId);

    await conn.end();

    res.json({
      status: "ok",
      ability: theta,
      nextQuestion,
    });

  } catch (err) {
    console.error("❌ Error in /answer:", err);
    await conn.end();
    res.status(500).json({ error: "Failed to process answer" });
  }
});

module.exports = router;
