const { mysql, DB_CONFIG } = require('../config/db');

async function getNextQuestion(userId, lastQuestionId, wasCorrect) {
  const conn = await mysql.createConnection(DB_CONFIG);

  let nextDifficulty = 0;
  if (lastQuestionId != null && wasCorrect != null) {
    const [[lastQ]] = await conn.execute(
      'SELECT difficulty FROM questions WHERE id = ?',
      [lastQuestionId]
    );
    if (lastQ) {
      nextDifficulty = wasCorrect
        ? Math.min((lastQ.difficulty ?? 0) + 1, 2)
        : Math.max((lastQ.difficulty ?? 0) - 1, -2);
    }
  }

  const [rows] = await conn.execute(
    `SELECT id, question_text, topic, tags, difficulty
     FROM questions
     WHERE difficulty = ?
       AND id NOT IN (SELECT question_id FROM user_attempts WHERE user_id = ?)
     ORDER BY RAND()
     LIMIT 1`,
    [nextDifficulty, userId]
  );

  await conn.end();
  return rows[0] || null;
}

module.exports = { getNextQuestion };
