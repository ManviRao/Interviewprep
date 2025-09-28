//for the dynamic websites like leetcode disscussion page where content will load after the page loads
const puppeteer = require('puppeteer');
const { assignInitialDifficulty } = require('./cheerioScrapper');

function clean(s) {
  return s
    .replace(/\s+/g, ' ')
    .replace(/^\d+[\).\s-]+/, '')
    .replace(/^[•\--]\s*/, '')
    .trim();
}

async function scrapeLeetCodeWithPuppeteer() {
  const url = 'https://leetcode.com/discuss/interview-question';
  const browser = await puppeteer.launch({
    headless: 'new', // headless true on servers
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  await page.waitForSelector('a');

  const raw = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    return links.map(el => el.innerText.trim()).filter(Boolean);
  });

  await browser.close();

  const out = []; 
  for (const t0 of raw) {
    const t = clean(t0);
    if (t.length >= 15 && t.includes('?')) {
      out.push({
        question_text: t,
        topic: null,
        tags: null,
        difficulty: assignInitialDifficulty(t),
        discrimination: 1.0
      });
    }
  }
  return out;
}

(async () => {
  try {
    const results = await scrapeLeetCodeWithPuppeteer();
    console.log('✅ Scraping successful, found questions:\n');
    console.log(results);
  } catch (err) {
    console.error('❌ Scraping failed:', err);
  }
})();

module.exports = { scrapeLeetCodeWithPuppeteer };