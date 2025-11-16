
const { mysql, DB_CONFIG } = require("../config/db");
const emotionService = require("./emotionService");


async function updateUserAbility(userId, questionId, isCorrect, emotionData = []) {
  const conn = await mysql.createConnection(DB_CONFIG);

  const [[userRow]] = await conn.execute(
  "SELECT final_ability FROM user_skills WHERE user_id = ? AND skill = (SELECT topic FROM questions WHERE id = ?)",
  [userId, questionId]
);

  let theta = userRow?.ability ?? 0;

 const [[skillRow]] = await conn.execute(
  "SELECT topic FROM questions WHERE id = ?",
  [questionId]
);
const skill = skillRow?.topic || "General";

  const [[qRow]] = await conn.execute(
    "SELECT difficulty, discrimination FROM questions WHERE id = ?",
    [questionId]
  );
  const b = qRow?.difficulty ?? 0;
  const a = qRow?.discrimination ?? 1;

  const p = 1 / (1 + Math.exp(-a * (theta - b)));
  
  // Emotion factor (confidence, stress, engagement)
  const emotionFactor = calculateEmotionFactor(emotionData);
  
  const lr = 0.1;
  theta = theta + lr * ((isCorrect ? 1 : 0) - p) * emotionFactor;

//   await conn.execute(`
//   INSERT INTO user_skills (user_id, skill, final_ability, test_count, last_tested)
//   VALUES (?, ?, ?, 1, NOW())
//   ON DUPLICATE KEY UPDATE
//     final_ability = VALUES(final_ability),
//     test_count = test_count + 1,
//     last_tested = NOW()
// `, [userId, skill, theta]);


  // Store emotion data if available
  if (emotionData && emotionData.length > 0) {
    await storeEmotionData(conn, userId, questionId, emotionData);
  }

  // Store emotion data if available
  if (emotionData && emotionData.length > 0) {
    await storeEmotionData(conn, userId, questionId, emotionData);
  }

  await conn.end();
  return theta;
}

function calculateEmotionFactor(emotionData) {
  if (!emotionData || emotionData.length === 0) return 1.0;

  const stats = emotionService.calculateEmotionStats(emotionData);
  
  // Positive emotions increase confidence factor
  if (stats.confidence > 0.7 || stats.engagement > 70) {
    console.log(`🎯 Positive emotion factor applied: 1.2 (Confidence: ${stats.confidence}, Engagement: ${stats.engagement})`);
    return 1.2;
  }
  
  // Negative emotions may indicate guessing or stress
  if (stats.stress > 50) {
    console.log(`😰 Stress factor applied: 0.8 (Stress: ${stats.stress})`);
    return 0.8;
  }
  
  console.log(`😐 Neutral emotion factor: 1.0`);
  return 1.0;
}

async function storeEmotionData(conn, userId, questionId, emotionData) {
  try {
    const sessionId = emotionData[0]?.sessionId;
    
    for (const emotion of emotionData) {
      await conn.execute(
        `INSERT INTO user_emotions (user_id, question_id, session_id, emotion, confidence, confidence_level, face_detected, timestamp) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, 
          questionId, 
          sessionId,
          emotion.dominant, 
          emotion.confidence, 
          emotion.confidence_level,
          emotion.face_detected ? 1 : 0,
          emotion.timestamp || new Date().toISOString()
        ]
      );
    }
    console.log(`💾 Stored ${emotionData.length} emotion samples for user ${userId}, question ${questionId}`);
  } catch (error) {
    console.error("❌ Error storing emotion data:", error);
  }
}

async function getNextQuestion(userId, skill, session_id) {
  const conn = await mysql.createConnection(DB_CONFIG);

  // get user ability
  const [[userRow]] = await conn.execute(
  "SELECT final_ability FROM user_skills WHERE user_id = ? AND skill = ?",
  [userId, skill]
);
const theta = userRow?.final_ability ?? 0;

  // fetch next question by topic (C, Java, SQL, Python)
  const[rows]=await conn.execute(`SELECT q.id, q.question_text, q.topic, q.tags, q.difficulty,
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
   AND q.topic = ?
   ORDER BY diff_gap ASC, RAND()
   LIMIT 1`,
  [theta, userId, session_id, userId, session_id, skill]
  );

  await conn.end();
  return rows[0] || null;
}

// New function to get emotion data for summary
async function getUserEmotionData(userId, sessionId) {
  const conn = await mysql.createConnection(DB_CONFIG);
  
  try {
    const [rows] = await conn.execute(
      `SELECT emotion, confidence, confidence_level, face_detected, timestamp, question_id
       FROM user_emotions 
       WHERE user_id = ? AND session_id = ?
       ORDER BY timestamp ASC`,
      [userId, sessionId]
    );
    
    return rows;
  } catch (error) {
    console.error("❌ Error fetching user emotion data:", error);
    return [];
  } finally {
    await conn.end();
  }
}

// Enhanced function to update question difficulty with emotion consideration
async function updateQuestionDifficulty(questionId) {
  const conn = await mysql.createConnection(DB_CONFIG);
  
  try {
    // Get average accuracy and emotion data for this question
    const [attempts] = await conn.execute(
      `SELECT ua.is_correct, ue.emotion, ue.confidence
       FROM user_attempts ua
       LEFT JOIN user_emotions ue ON ua.user_id = ue.user_id AND ua.question_id = ue.question_id
       WHERE ua.question_id = ?`,
      [questionId]
    );
    
    if (attempts.length === 0) return;
    
    const correctAttempts = attempts.filter(a => a.is_correct).length;
    const accuracy = correctAttempts / attempts.length;
    
    // Calculate emotion-adjusted difficulty
    // Questions with high stress/low confidence but correct answers might be harder
    const emotionAdjustedDifficulty = calculateEmotionAdjustedDifficulty(attempts, accuracy);
    
    await conn.execute(
      "UPDATE questions SET difficulty = ? WHERE id = ?",
      [emotionAdjustedDifficulty, questionId]
    );
    
    console.log(`📊 Updated question ${questionId} difficulty to ${emotionAdjustedDifficulty.toFixed(2)} (accuracy: ${accuracy.toFixed(2)})`);
    
  } catch (error) {
    console.error("❌ Error updating question difficulty:", error);
  } finally {
    await conn.end();
  }
}

function calculateEmotionAdjustedDifficulty(attempts, baseAccuracy) {
  // Base difficulty: negative for easy, positive for hard
  let baseDifficulty = (0.5 - baseAccuracy) * 5; // Scale to -2.5 to 2.5 range
  
  // Adjust based on emotions during attempts
  let emotionAdjustment = 0;
  const emotionSamples = attempts.filter(a => a.emotion);
  
  if (emotionSamples.length > 0) {
    const avgConfidence = emotionSamples.reduce((sum, a) => sum + (a.confidence || 0), 0) / emotionSamples.length;
    
    // Low confidence but correct answers suggest the question is challenging
    // High confidence but wrong answers suggest the question is misleading
    if (avgConfidence < 0.4) {
      emotionAdjustment += 0.3; // Make slightly harder
    } else if (avgConfidence > 0.8) {
      emotionAdjustment -= 0.2; // Make slightly easier
    }
  }
  
  return baseDifficulty + emotionAdjustment;
}

module.exports = { 
  updateUserAbility, 
  getNextQuestion, 
  getUserEmotionData,
  updateQuestionDifficulty 
};