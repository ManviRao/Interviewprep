const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // ✅ free model

router.post("/", async (req, res) => {
  const { question, answer } = req.body;

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
        "feedback": "Short feedback"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean response (remove ```json blocks if any)
    const cleanText = text.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleanText);

    res.json({ evaluation: parsed });
  } catch (err) {
    console.error("❌ Error in /evaluate:", err);
    res.status(500).json({ error: "Failed to evaluate answer" });
  }
});

module.exports = router;
