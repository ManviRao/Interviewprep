const { mysql, DB_CONFIG } = require("../config/db");

/**
 * Update user ability (θ) using a simple 2PL IRT gradient update
 */
async function updateUserAbility(userId, questionId, isCorrect) {
  const conn = await mysql.createConnection(DB_CONFIG);

  // 1. Get the user’s current θ
  const [[userRow]] = await conn.execute(
    "SELECT ability FROM users WHERE id = ?",
    [userId]
  );
  let theta = userRow?.ability ?? 0;

  // 2. Get the question’s difficulty (b) and discrimination (a)
  const [[qRow]] = await conn.execute(
    "SELECT difficulty, discrimination FROM questions WHERE id = ?",
    [questionId]
  );
  const b = qRow?.difficulty ?? 0;     // difficulty
  const a = qRow?.discrimination ?? 1; // discrimination

  // 3. IRT probability of correct answer (2PL)
  const p = 1 / (1 + Math.exp(-a * (theta - b)));

  // 4. Gradient update for θ
  const lr = 0.1; // learning rate (tune if needed)
  theta = theta + lr * ((isCorrect ? 1 : 0) - p);

  // 5. Save updated θ back into users table
  await conn.execute(
    "UPDATE users SET ability = ? WHERE id = ?",
    [theta, userId]
  );

  await conn.end();
  return theta;
}

/**
 * Select next question based on user ability (θ)
 */
async function getNextQuestion(userId) {
  const conn = await mysql.createConnection(DB_CONFIG);

  // For demo purposes: hardcoded user skills
  const userSkills = ["Java", "Databases"];

  // 1. Get user ability θ
  const [[userRow]] = await conn.execute(
    "SELECT ability FROM users WHERE id = ?",
    [userId]
  );
  const theta = userRow?.ability ?? 0;

  // 2. Pick the closest difficulty question not attempted yet
  const [rows] = await conn.execute(
    `SELECT id, question_text, topic, tags, difficulty,
            ABS(difficulty - ?) AS diff_gap
     FROM questions
     WHERE id NOT IN (
       SELECT question_id FROM user_attempts WHERE user_id = ?
     )
        AND JSON_OVERLAPS(tags, ?)  
     ORDER BY diff_gap ASC, RAND()
     LIMIT 1`,
    [theta, userId, JSON.stringify(userSkills)]
  );

  await conn.end();
  return rows[0] || null;
}

module.exports = { updateUserAbility, getNextQuestion };
