const { mysql, DB_CONFIG } = require("../config/db");

async function updateUserAbility(userId, questionId, isCorrect) {
  const conn = await mysql.createConnection(DB_CONFIG);

  const [[userRow]] = await conn.execute(
    "SELECT ability FROM users WHERE id = ?",
    [userId]
  );
  let theta = userRow?.ability ?? 0;

  const [[qRow]] = await conn.execute(
    "SELECT difficulty, discrimination FROM questions WHERE id = ?",
    [questionId]
  );
  const b = qRow?.difficulty ?? 0;
  const a = qRow?.discrimination ?? 1;

  const p = 1 / (1 + Math.exp(-a * (theta - b)));
  const lr = 0.1;
  theta = theta + lr * ((isCorrect ? 1 : 0) - p);

  await conn.execute(
    "UPDATE users SET ability = ? WHERE id = ?",
    [theta, userId]
  );

  await conn.end();
  return theta;
}

async function getNextQuestion(userId, skill,session_id) {
  const conn = await mysql.createConnection(DB_CONFIG);

  const [[userRow]] = await conn.execute(
    "SELECT ability FROM users WHERE id = ?",
    [userId]
  );
  const theta = userRow?.ability ?? 0;

  const [rows] = await conn.execute(
  `SELECT q.id, q.question_text, q.topic, q.tags, q.difficulty,
          ABS(q.difficulty - ?) AS diff_gap
   FROM questions q
   WHERE q.id NOT IN (
       -- Exclude all questions already attempted in the current session
       SELECT ua.question_id
       FROM user_attempts ua
       WHERE ua.user_id = ?
         AND ua.session_id = ?
   )
   AND q.id NOT IN (
       -- Exclude correctly answered questions from past sessions
       SELECT ua.question_id
       FROM user_attempts ua
       WHERE ua.user_id = ?
         AND ua.is_correct = 1
         AND ua.session_id <> ?
   )
   AND JSON_CONTAINS(q.tags, JSON_QUOTE(?))
   ORDER BY diff_gap ASC, RAND()
   LIMIT 1`,
  [theta, userId, session_id, userId, session_id, skill]
);


  await conn.end();
  return rows[0] || null;
}

module.exports = { updateUserAbility, getNextQuestion };
