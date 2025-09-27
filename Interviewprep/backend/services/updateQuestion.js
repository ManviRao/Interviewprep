const { mysql, DB_CONFIG } = require("../config/db");

async function updateQuestionDifficulty(questionId) {
  const conn = await mysql.createConnection(DB_CONFIG);

  // compute average accuracy just for this question
  const [rows] = await conn.execute(
    `SELECT AVG(is_correct) AS accuracy
     FROM user_attempts
     WHERE question_id = ?`,
    [questionId]
  );

  const acc = rows[0]?.accuracy ?? 0;
  let difficulty;

  // simple mapping from accuracy → difficulty
  if (acc > 0.85) difficulty = -2;
  else if (acc > 0.65) difficulty = -1;
  else if (acc > 0.35) difficulty = 0;
  else if (acc > 0.15) difficulty = 1;
  else difficulty = 2;

  await conn.execute(
    `UPDATE questions
     SET difficulty = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [difficulty, questionId]
  );

  await conn.end();
}

module.exports = { updateQuestionDifficulty };

/*Keeps the difficulty ratings accurate as more people attempt the question.
Makes your adaptive test engine smarter:
If a "hard" question suddenly becomes easy because everyone can solve it → it automatically gets downgraded.
If an "easy" question is tripping people up → it gets upgraded to medium/hard.
Ensures fair question selection for users based on their ability. */