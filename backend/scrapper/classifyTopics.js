require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { mysql, DB_CONFIG } = require("../config/db");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Shared scraping flag
let scraping = false;

function startScraping() { scraping = true; }
function stopScraping() { scraping = false; }
function isScraping() { return scraping; }

// Interruptible sleep
function sleep(ms) {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (!scraping) { clearInterval(interval); resolve(); }
    }, 100);
    setTimeout(() => { clearInterval(interval); resolve(); }, ms);
  });
}

// Fetch unclassified questions
async function getUnclassifiedQuestions(limit = 50) {
  const conn = await mysql.createConnection(DB_CONFIG);
  const [rows] = await conn.execute(
    `SELECT id, question_text FROM questions WHERE topic IS NULL LIMIT ${limit}`
  );
  await conn.end();
  return rows;
}

// Save classification to DB
async function saveClassification(id, topic, tags, difficulty, discrimination) {
  const conn = await mysql.createConnection(DB_CONFIG);
  await conn.execute(
    "UPDATE questions SET topic=?, tags=?, difficulty=?, discrimination=? WHERE id=?",
    [topic, JSON.stringify(tags), difficulty, discrimination, id]
  );
  await conn.end();
}

// Classify batch using Gemini AI
async function classifyBatch(questions) {
  const prompt = `You are a strict JSON generator.
Return ONLY a JSON array, no explanations, no markdown fences.
Classify the following interview questions into JSON with the format:
{ "question_text": "...", "topic": "C|Java|SQL|Python|C++|React|Node|Javascript|Aws|Docker|Html|Css", "tags": ["..."], "difficulty": 0, "discrimination": 1.0 }
Rules:
- Only use the listed topics.
Questions:
${questions.map((q, i) => `${i + 1}. ${q.question_text}`).join("\n")}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// Main classifier loop
async function runClassifier() {
  startScraping();
  console.log("Fetching unclassified questions…");

  while (isScraping()) {
    const questions = await getUnclassifiedQuestions(50);
    if (questions.length === 0) {
      console.log("🎉 All questions classified!");
      break;
    }

    const batchSize = 2;
    for (let i = 0; i < questions.length; i += batchSize) {
      if (!isScraping()) break;

      const batch = questions.slice(i, i + batchSize);
      try {
        console.log(`Classifying batch ${i / batchSize + 1}…`);
        const result = await classifyBatch(batch);

        let clean = result.replace(/```json|```/g, "").trim();
        let parsed = JSON.parse(clean);
        if (!Array.isArray(parsed)) throw new Error("Expected array");

        for (let j = 0; j < batch.length; j++) {
          if (!isScraping()) break;
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
  stopScraping();
}

// Export functions for external control
module.exports = { runClassifier, startScraping, stopScraping, isScraping };
