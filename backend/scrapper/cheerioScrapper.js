const axios = require('axios');
const cheerio = require('cheerio');

const clean = s => s
  .replace(/\s+/g, ' ')
  .replace(/^\d+[\).\s-]+/, '')
  .replace(/^[•\-–]\s*/, '')
  .trim();

function assignInitialDifficulty(text) {
  const w = text.split(/\s+/).length;
  if (w < 8) return -1;  // Easy
  if (w < 15) return 0;  // Medium
  return 2;              // Hard
}

async function scrapeGFGJava() {
  const url = 'https://www.geeksforgeeks.org/java-interview-questions/';
  const { data } = await axios.get(url, { timeout: 30000 });
  const $ = cheerio.load(data);
  const out = [];
  $('h2, h3, li').each((_, el) => {
    const t = clean($(el).text());
    if (t && t.length >= 10 && /[?]$/.test(t)) out.push({
      question_text: t,
      topic: null,
      tags: null,
      difficulty: assignInitialDifficulty(t),
      discrimination: 1.0
    });
  });
  return out;
}

async function scrapeInterviewBitSQL() {
  const url = 'https://www.interviewbit.com/sql-interview-questions/';
  const { data } = await axios.get(url, { timeout: 30000 });
  const $ = cheerio.load(data);
  const out = [];
  $('h2, h3, li, p strong').each((_, el) => {
    let t = clean($(el).text());
    if (!t) return;
    if (!/[?]$/.test(t) && /(what|why|how|define|explain)/i.test(t)) t += '?';
    if (t.length >= 10 && /[?]$/.test(t)) out.push({
      question_text: t,
      topic: null,
      tags: null,
      difficulty: assignInitialDifficulty(t),
      discrimination: 1.0
    });
  });
  return out;
}


async function scrapeGFGC() {
  const url = 'https://www.geeksforgeeks.org/c-interview-questions/';
  const { data } = await axios.get(url, { timeout: 30000 });
  const $ = cheerio.load(data);
  const out = [];
  $('h2, h3, li').each((_, el) => {
    const t = clean($(el).text());
    if (t && t.length >= 10 && /[?]$/.test(t)) out.push({
      question_text: t,
      topic: "C",
      tags: JSON.stringify(["C", "programming"]),
      difficulty: assignInitialDifficulty(t),
      discrimination: 1.0
    });
  });
  return out;
}

async function scrapeInterviewBitPython() {
  const url = 'https://www.interviewbit.com/python-interview-questions/';
  const { data } = await axios.get(url, { timeout: 30000 });
  const $ = cheerio.load(data);
  const out = [];
  $('h2, h3, li, p strong').each((_, el) => {
    let t = clean($(el).text());
    if (!t) return;
    if (!/[?]$/.test(t) && /(what|why|how|define|explain)/i.test(t)) t += '?';
    if (t.length >= 10 && /[?]$/.test(t)) out.push({
      question_text: t,
      topic: "Python",
      tags: ["Python", "programming"],
      difficulty: assignInitialDifficulty(t),
      discrimination: 1.0
    });
  });
  return out;
}










module.exports = { 
  scrapeGFGJava, 
  scrapeInterviewBitSQL, 
  scrapeGFGC, 
  scrapeInterviewBitPython, 
  assignInitialDifficulty 
};
