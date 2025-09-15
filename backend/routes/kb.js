const express = require('express');
const { evaluateCandidateAnswer } = require('../services/kbService');
const { addReferenceAnswer, getReferenceAnswer, addCandidateAnswer } = require('../models/kbModel');

const router = express.Router();

// Add a reference answer
router.post('/add-answer', async (req, res) => {
  console.log("Received body:", req.body);
  try {
    const { question_id, reference_text, key_points, embedding } = req.body;

    const result = await addReferenceAnswer(
      question_id,
      reference_text,
      key_points || [],     // default to empty array
      embedding || []       // default to empty array
    );

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to add reference answer" });
  }
});


// Evaluate candidate answer
router.post('/evaluate-answer', async (req, res) => {
    try {
        const { userId, questionId, candidateAnswer, candidateEmbedding } = req.body;

        const { score, referenceText } = await evaluateCandidateAnswer(questionId, candidateEmbedding);

        await addCandidateAnswer(userId, questionId, candidateAnswer, candidateEmbedding, score);

        res.json({ success: true, score, referenceText });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to evaluate answer' });
    }
});

// Fetch reference answer
router.get('/get-answer/:questionId', async (req, res) => {
    try {
        const questionId = req.params.questionId;
        const answer = await getReferenceAnswer(questionId);
        res.json({ success: true, answer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to fetch answer' });
    }
});

module.exports = router;
