const express = require('express');
const mysql = require("mysql2/promise");
// const pool = require('../config/db'); // MySQL pool
const router = express.Router(); // ✅ use router, not app
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "Manvitha@04",
  database: process.env.DB_NAME || "interviewprep2",
  multipleStatements: false,
});
// POST /api/feedback
router.post("/", async (req, res) => {
  const { userId, sessionId, resumeRating, adaptiveRating, feedback } = req.body;

  if (!userId || !sessionId || !resumeRating || !adaptiveRating) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const sql = `
      INSERT INTO feedback (user_id, session_id, resume_rating, adaptive_rating, feedback_text)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [userId, sessionId, resumeRating, adaptiveRating, feedback || null];

    const [result] = await pool.execute(sql, values);

    res.status(200).json({ message: "Feedback saved successfully", id: result.insertId });
  } catch (err) {
    console.error("Error saving feedback:", err);
    res.status(500).json({ message: "Failed to save feedback" });
  }
});

// GET /api/feedback
router.get("/", async (req, res) => {
  try {
    const sql = "SELECT * FROM feedback ORDER BY created_at DESC";
    const [rows] = await pool.execute(sql);

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

module.exports = router; // ✅ export router
