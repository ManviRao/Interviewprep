require('dotenv').config();
const { 
  scrapeGFGJava, scrapeInterviewBitSQL, scrapeGreatLearningC, scrapePython,
  scrapeGFGJavaScript, scrapeCPP, scrapeGFGAWS, scrapeGFGDocker,
  scrapeHTMLQuestions, scrapeCSSQuestions, scrapeReactQuestions, scrapeNodeJSQuestions
} = require('./cheerioScrapper.js');
const { scrapeLeetCodeWithPuppeteer } = require('./puppeteerScraper.js');
const { runClassifier, startScraping, stopScraping: stopClassifier } = require('./classifyTopics.js');
const { mysql, DB_CONFIG } = require('../config/db');

let scraping = false;

// Save scraped questions to DB
async function saveQuestions(rawQuestions) {
  const conn = await mysql.createConnection(DB_CONFIG);
  const sql = `INSERT IGNORE INTO questions
    (question_text, topic, tags, difficulty, discrimination)
    VALUES (?, ?, ?, ?, ?)`;
  for (const q of rawQuestions) {
    await conn.execute(sql, [q.question_text, null, JSON.stringify([]), null, null]);
  }
  await conn.end();
}

// Update difficulty based on user attempts
async function updateDifficultyFromUserData() {
  const conn = await mysql.createConnection(DB_CONFIG);
  const [rows] = await conn.execute(`
    SELECT question_id, AVG(is_correct) AS accuracy, COUNT(*) AS total
    FROM user_attempts
    GROUP BY question_id
  `);

  for (const row of rows) {
    const { question_id, accuracy, total } = row;

    let difficulty;
    if (accuracy > 0.85) difficulty = -2;
    else if (accuracy > 0.65) difficulty = -1;
    else if (accuracy > 0.35) difficulty = 0;
    else if (accuracy > 0.15) difficulty = 1;
    else difficulty = 2;

    let discrimination = total < 5 ? 1.0 : Math.min(Math.max((accuracy*(1-accuracy))*4, 0.25), 2.0);

    await conn.execute(
      `UPDATE questions SET difficulty = ?, discrimination = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [difficulty, discrimination, question_id]
    );
  }

  await conn.end();
}

// Main scraper function
let scrapingTask = null;

async function runOnce() {
  if (scrapingTask) return; // already running
  scraping = true;

  scrapingTask = (async () => {
    try {
      console.log("🔍 Scraping…");

      const scrapers = [
        scrapeGFGJava, scrapeInterviewBitSQL, scrapeLeetCodeWithPuppeteer, scrapeGreatLearningC,
        scrapePython, scrapeGFGJavaScript, scrapeCPP, scrapeGFGAWS, scrapeGFGDocker,
        scrapeHTMLQuestions, scrapeCSSQuestions, scrapeReactQuestions, scrapeNodeJSQuestions
      ];

      const allResults = [];

      for (const fn of scrapers) {
        if (!scraping) break; // <-- check stop flag
        try {
          const res = await fn(); // run scraper
          allResults.push(...res);
        } catch (err) {
          console.error(err);
        }
      }

      const seen = new Set();
      const unique = allResults.filter(q => {
        const key = q.question_text.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      console.log(`📥 Scraped ${allResults.length}, unique ${unique.length}. Saving raw…`);
      await saveQuestions(unique);

      console.log('🤖 Running classifier…');
      await runClassifier();  // this will respect scraping flag

      console.log('⚡ Updating difficulty…');
      await updateDifficultyFromUserData();

      console.log('✅ Scraper run complete!');
    } catch (err) {
      console.error(err);
    } finally {
      scraping = false;
      scrapingTask = null;
      stopClassifier();
    }
  })();

  return { message: "Scraper started in background!" };
}


async function stopScraper() {
  if (!scraping) return { message: "Scraper is not running" };

  scraping = false; // stop all loops
  stopClassifier(); // stop classifier
  scrapingTask = null; // reset task
  console.log("⏹️ Scraper stopped!");
  return { message: "Scraper stopped successfully!" };
}


module.exports = { runOnce, stopScraper };
