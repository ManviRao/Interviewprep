
const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

// Create pool directly here
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "Manvitha@04",
  database: process.env.DB_NAME || "interviewprep2",
  multipleStatements: false,
});

// GET Detailed Report
// ----------------------------
router.get("/details/:sessionId", async (req, res) => {
    console.log("Pool is:", pool);
  const { sessionId } = req.params;

   try {
    const [attempts] = await pool.query(
      "SELECT * FROM user_attempts WHERE session_id = ? ORDER BY question_id",
      [sessionId]
    );

    if (!attempts.length) {
      return res.status(404).json({ message: "No data found for this session" });
    }

    res.json({
      sessionId,
      userId: attempts[0].user_id,
      attempts,
    });
  } catch (err) {
    console.error("Error fetching summary:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


// Get all sessions
router.get("/:userId", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          ts.id AS session_id,
          ts.skill,
          ts.start_time,
          ts.completed,
          COUNT(ua.id) AS total_questions,
          SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) AS correct_answers
       FROM test_sessions ts
       LEFT JOIN user_attempts ua ON ts.id = ua.session_id
       WHERE ts.user_id = ? AND ts.completed = TRUE
       GROUP BY ts.id
       ORDER BY ts.start_time ASC`,
      [req.params.userId]
    );

    res.json({ success: true, sessions: rows });

  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



module.exports = router;
