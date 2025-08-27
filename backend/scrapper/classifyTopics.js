// classifyTopics.js (CommonJS)
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { mysql, DB_CONFIG } = require("../config/db");

const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Helper: wait
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Classify a batch of questions
 */
async function classifyBatch(questions) {
  const prompt = `You are a strict JSON generator.
Return ONLY a JSON array, no explanations, no markdown fences.Classify the following interview questions into JSON:
  Each item should look like:
  { "question_text": "...", "topic": "...", "tags": ["..."], "difficulty": 0, "discrimination": 1.0 }

Questions:
${questions.map((q, i) => `${i + 1}. ${q.question_text}`).join("\n")}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Get unclassified questions from DB
 */
async function getUnclassifiedQuestions(limit = 50) {
  const conn = await mysql.createConnection(DB_CONFIG);
  const [rows] = await conn.execute(
    `SELECT id, question_text FROM questions WHERE topic IS NULL LIMIT ${limit}`
  );
  await conn.end();
  return rows;
}

/**
 * Save classification back to DB
 */
async function saveClassification(id, topic, tags, difficulty, discrimination) {
  const conn = await mysql.createConnection(DB_CONFIG);
  await conn.execute(
    "UPDATE questions SET topic=?, tags=?, difficulty=?, discrimination=? WHERE id=?",
    [topic, JSON.stringify(tags), difficulty, discrimination, id]
  );
  await conn.end();
}

/**
 * Main flow
 */
async function runClassifier() {
  console.log("Fetching unclassified questions…");

  while (true) {
    const questions = await getUnclassifiedQuestions(50); // batch of 50
    if (questions.length === 0) {
      console.log("🎉 All questions classified!");
      break;
    }

    const batchSize = 2;
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);

      try {
        console.log(`Classifying batch ${i / batchSize + 1}…`);

        const result = await classifyBatch(batch);

        let clean = result.replace(/```json|```/g, "").trim();
        let parsed = JSON.parse(clean);
        if (!Array.isArray(parsed)) throw new Error("Expected array");

        for (let j = 0; j < batch.length; j++) {
          const q = parsed[j];
          if (!q) continue;
          await saveClassification(
            batch[j].id,
            q.topic || "Uncategorized",
            q.tags || [],
            q.difficulty ?? 0,
            q.discrimination ?? 1.0
          );
          console.log(`✅ Saved Q${batch[j].id} → ${q.topic}`);
        }
      } catch (err) {
        console.error("❌ Error:", err.message);
      }

      console.log("⏳ Waiting 40s before next batch…");
      await sleep(40000);
    }
  }

  console.log("Done for today 🚀");
}

// Run directly
if (require.main === module) {
  runClassifier();
}

module.exports = { runClassifier };
