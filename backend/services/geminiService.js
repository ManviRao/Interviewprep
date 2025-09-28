const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function evaluateAnswer(question, answer) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// or use "gemini-1.5-flash" if you want faster, cheaper responses

//Candidate answers → Evaluation using Gemini


  const prompt = `
You are evaluating a candidate's technical interview answer.
Question: ${question}
Answer: ${answer}
Return ONLY JSON:
{
  "correctness": "Yes/No/Partial",
  "completeness": 1-5,
  "clarity": 1-5,
  "feedback": "Short constructive feedback"
}
`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  try {
    const jsonStr = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("⚠️ Gemini returned unparseable output:", raw);
    throw new Error("Failed to parse Gemini output");
  }
}

module.exports = { evaluateAnswer };