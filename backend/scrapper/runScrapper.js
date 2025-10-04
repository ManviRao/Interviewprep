require('dotenv').config();
const cron = require('node-cron');
const { mysql, DB_CONFIG } = require('../config/db');
const { 
  scrapeGFGJava, 
  scrapeInterviewBitSQL, 
  scrapeGreatLearningC, 
  scrapePython, 
   scrapeGFGJavaScript,
 scrapeCPP,
  scrapeGFGAWS,
  scrapeGFGDocker,
  scrapeHTMLQuestions,
  scrapeCSSQuestions,
  scrapeReactQuestions,
  scrapeNodeJSQuestions,
   // ✅ add Python scraper
} = require('./cheerioScrapper.js');
const { scrapeLeetCodeWithPuppeteer } = require('./puppeteerScraper.js');
const { runClassifier } = require('./classifyTopics.js'); // ✅ use runClassifier instead

async function saveQuestions(rawQuestions) {
  const conn = await mysql.createConnection(DB_CONFIG);
  const sql = `INSERT IGNORE INTO questions
    (question_text, topic, tags, difficulty, discrimination)
    VALUES (?, ?, ?, ?, ?)`;

  for (const q of rawQuestions) {
    await conn.execute(sql, [
      q.question_text,
      null, // topic will be filled later by runClassifier
      JSON.stringify([]), // tags will be updated later
      null, // difficulty updated later
      null  // discrimination updated later
    ]);
  }

  await conn.end();
}


async function updateDifficultyFromUserData() {
  const conn = await mysql.createConnection(DB_CONFIG);
  const [rows] = await conn.execute(`
    SELECT question_id, AVG(is_correct) AS accuracy, COUNT(*) AS total
    FROM user_attempts
    GROUP BY question_id
  `);

  for (const row of rows) {
    const { question_id, accuracy, total } = row;

    // --- Difficulty (b) ---
    let difficulty;
    if (accuracy > 0.85) difficulty = -2;
    else if (accuracy > 0.65) difficulty = -1;
    else if (accuracy > 0.35) difficulty = 0;
    else if (accuracy > 0.15) difficulty = 1;
    else difficulty = 2;

    // --- Discrimination (a) ---
    let discrimination;
    if (total < 5) {
      discrimination = 1.0;
    } else {
      discrimination = (accuracy * (1 - accuracy)) * 4; // range 0–1
      if (discrimination < 0.25) discrimination = 0.25;
      if (discrimination > 2.0) discrimination = 2.0;
    }

    await conn.execute(
      `UPDATE questions 
       SET difficulty = ?, discrimination = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [difficulty, discrimination, question_id]
    );
  }

  await conn.end();
}

async function runOnce() {
  console.log('🔍 Scraping…');

  const scrapers = [
    scrapeGFGJava,
    scrapeInterviewBitSQL,
    scrapeLeetCodeWithPuppeteer,
    scrapeGreatLearningC,
    scrapePython,
    scrapeGFGJavaScript,
    scrapeCPP,
    scrapeGFGAWS,
    scrapeGFGDocker,
    scrapeHTMLQuestions,
    scrapeCSSQuestions,
    scrapeReactQuestions,
    scrapeNodeJSQuestions
  ];

  const results = await Promise.allSettled(scrapers.map(fn => fn()));

  // flatten successful results
  const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);

  // dedupe by question text
  const seen = new Set();
  const unique = all.filter(q => {
    const key = q.question_text.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`📥 Scraped ${all.length}, unique ${unique.length}. Saving raw…`);
  await saveQuestions(unique);

  console.log('🤖 Running classifier on unclassified questions…');
  await runClassifier();

  console.log('⚡ Updating difficulty from user attempts…');
  await updateDifficultyFromUserData();

  console.log('✅ Scraper run complete.');
}
// schedule (daily 2:00 AM)
const CRON = process.env.SCRAPER_CRON || '0 2 * * *';
cron.schedule(CRON, () => {
  console.log('[CRON] Running scheduled scraper…');
  runOnce().catch(console.error);
});

module.exports = { runOnce };

// ✅ Run immediately if this file is executed directly
if (require.main === module) {
  runOnce().catch(console.error);
}