const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const emotionService = require("../services/emotionService");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post("/", async (req, res) => {
  const { question, answer, userId, sessionId, emotionData } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const prompt = `
      Evaluate the following interview answer.

      Question: ${question}
      Candidate Answer: ${answer}

      Return ONLY valid JSON:
      {
        "correctness": "Yes/No",
        "completeness": 1-5,
        "clarity": 1-5,
        "confidence": 1-5,
        "feedback": "Short feedback"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanText);

    // Add emotion analysis to evaluation
    const emotionAnalysis = emotionService.calculateEmotionStats(emotionData || []);
    
    const finalEvaluation = {
      ...parsed,
      emotionAnalysis: {
        dominantEmotion: emotionAnalysis.dominantEmotion,
        confidenceLevel: emotionAnalysis.confidence,
        engagementScore: emotionAnalysis.engagement,
        stressLevel: emotionAnalysis.stress,
        totalSamples: emotionAnalysis.totalSamples
      }
    };

    res.json({ evaluation: finalEvaluation });
  } catch (err) {
    console.error("❌ Error in /evaluate:", err);
    res.status(500).json({ error: "Failed to evaluate answer" });
  }
});

module.exports = router;