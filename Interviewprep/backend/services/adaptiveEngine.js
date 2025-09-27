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

async function getNextQuestion(userId, skill) {
  const conn = await mysql.createConnection(DB_CONFIG);

  // get user ability
  const [[userRow]] = await conn.execute(
    "SELECT ability FROM users WHERE id = ?",
    [userId]
  );
  const theta = userRow?.ability ?? 0;

  // fetch next question by topic (C, Java, SQL, Python)
  const [rows] = await conn.execute(
    `SELECT id, question_text, topic, tags, difficulty,
            ABS(difficulty - ?) AS diff_gap
     FROM questions
     WHERE id NOT IN (
       SELECT question_id FROM user_attempts WHERE user_id = ?
     )
       AND topic = ?
     ORDER BY diff_gap ASC, RAND()
     LIMIT 1`,
    [theta, userId, skill]
  );

  await conn.end();
  return rows[0] || null;
}


module.exports = { updateUserAbility, getNextQuestion };



/*Update question difficulty
Over time, updateQuestionDifficulty(questionId) updates difficulty values in questions:
Based on the average accuracy of all users for that question.
Easier questions (high accuracy) get negative difficulty values.
Harder questions (low accuracy) get positive values.
✅ This makes the adaptive engine smarter as more candidates attempt. 
*/