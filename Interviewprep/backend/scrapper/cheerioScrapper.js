//Works for static websites, where all the content is present in the HTML when the page loads

const axios = require('axios');
const cheerio = require('cheerio');

const clean = s => s
  .replace(/\s+/g, ' ')
  .replace(/^\d+[\).\s-]+/, '')
  .replace(/^[•\--]\s*/, '')
  .trim();

function assignInitialDifficulty(text) {
  const w = text.split(/\s+/).length;
  if (w < 8) return -1;  // Easy
  if (w < 15) return 0;  // Medium
  return 2;              // Hard
}

//corrected java
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

//----------------------Added SQL-------------------------
async function scrapeInterviewBitSQL() {
  const url = 'https://www.interviewbit.com/sql-interview-questions/';
  const { data } = await axios.get(url, { timeout: 30000 });
  const $ = cheerio.load(data);
  const out = [];

  // Target only h3 inside the main content section
  $('section.ibpage-article-header h3').each((_, el) => {
    let t = clean($(el).text());
    if (!t) return;

    // Add ? if it's clearly a question but missing a question mark
    if (!/[?]$/.test(t) && /(what|why|how|define|explain|list|difference|when|where|give|name)/i.test(t)) {
      t += '?';
    }

    if (t.length >= 5 && /[?]$/.test(t)) {
      out.push({
        question_text: t,
        topic: "SQL",
        tags: JSON.stringify(["SQL", "database"]),
        difficulty: assignInitialDifficulty(t),
        discrimination: 1.0
      });
    }
  });

  return out;
}

//----------------------Added GFG-------------------------
// 100+ greatlearning C questions url but function name and all remains same
async function scrapeGreatLearningC() {
  const url = 'https://www.mygreatlearning.com/blog/c-interview-questions/?utm_source=chatgpt.com#c-interview-questions-for-freshers';
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

//----------------------Added PYTHON-------------------------
//greatlearning python questions page 
async function scrapePython() {
  const url = 'https://www.mygreatlearning.com/blog/python-interview-questions/';
  const { data } = await axios.get(url, { timeout: 30000 });
  const $ = cheerio.load(data);
  const out = [];
  const seen = new Set();

  // Select both h3.wp-block-heading and h2
  $('h3.wp-block-heading, h4.wp-block-heading').each((_, el) => {
const strong = $(el).find('strong').filter((_, s) => $(s).parents('a').length === 0);
     // Skip if strong contains an anchor tag
    if (strong.length && strong.find('a').length > 0) return;
    //If strong exists and is valid, take its text
let text = strong.length
  ? clean(strong.map((_, s) => $(s).text()).get().join(' '))
  : clean($(el).text());
    if (!text) return;

    // Skip section headings only
    if (/basic|intermediate|advanced/i.test(text)) return;

    // Avoid duplicates
    if (seen.has(text)) return;
    seen.add(text);

    // Add question mark if missing
    if (!/[?]$/.test(text) && /(what|why|how|define|explain|list|difference|when|where|give|name|which)/i.test(text)) {
      text += '?';
    }

    out.push({
      question_text: text,
      topic: "Python",
      tags: JSON.stringify(["Python", "programming"]),
      difficulty: assignInitialDifficulty(text),
      discrimination: 1.0
    });
  });

  return out;
}
//----------------------Added c++-------------------------
async function scrapeCPP() {
  const url = 'https://www.wecreateproblems.com/interview-questions/cpp-interview-questions';
  const { data } = await axios.get(url, { timeout: 30000 });
  const $ = cheerio.load(data);
  const out = [];

  // Scrape all h3 tags (as questions are inside <h3>)
  $('h3').each((_, el) => {
    const t = clean($(el).text());
    if (t && t.length >= 8 && /[?]$/.test(t)) {
      out.push({
        question_text: t,
        topic: "C++",
        tags: JSON.stringify(["C++", "programming"]),
        difficulty: assignInitialDifficulty(t),
        discrimination: 1.0
      });
    }
  });

  return out;
}


//----------------------Added HTML-------------------------
async function scrapeHTMLQuestions() {
  const url = "https://www.simplilearn.com/html-interview-questions-and-answers-article";
  const { data } = await axios.get(url, { timeout: 30000 });
  const $ = cheerio.load(data);
  const out = [];

  // Select all h2, h3, li tags that may contain questions
  $("h2, h3, li").each((_, el) => {
    let t = clean($(el).text());
    
    // Only keep text that looks like a question
    if (t && t.length >= 8 && /[?]$/.test(t)) {
      // Remove numbering at start if exists, e.g., "3. "
      t = t.replace(/^\d+\.\s*/, "");

      out.push({
        question_text: t,
        topic: "HTML",
        tags: JSON.stringify(["HTML", "frontend"]),
        difficulty: 1, // assign initial difficulty
        discrimination: 1.0
      });
    }
  });

  return out;
}


//----------------------Added CSS-------------------------
async function scrapeCSSQuestions() {
  const url = "https://www.simplilearn.com/tutorials/css-tutorial/css-interview-questions";
  const { data } = await axios.get(url, { timeout: 30000 });
  const $ = cheerio.load(data);
  const out = [];

  // Select all h2, h3, li elements
  $("h2, h3, li").each((_, el) => {
    let t = clean($(el).text());
    
    // Only keep text that looks like a question
    if (t && t.length >= 8 && /[?]$/.test(t)) {
      // Remove numbering at start if exists, e.g., "3. "
      t = t.replace(/^\d+\.\s*/, "");

      out.push({
        question_text: t,
        topic: "CSS",
        tags: JSON.stringify(["CSS", "frontend"]),
        difficulty: 1, // initial difficulty
        discrimination: 1.0
      });
    }
  });

  return out;
}


//----------------------Added JS-------------------------
async function scrapeGFGJavaScript() {
  const url = 'https://www.geeksforgeeks.org/javascript-interview-questions/';
  const { data } = await axios.get(url, { timeout: 30000 });
  const $ = cheerio.load(data);
  const out = [];
  $('h2, h3, li').each((_, el) => {
    const t = clean($(el).text());
    if (t && t.length >= 8 && /[?]$/.test(t)) {
      out.push({
        question_text: t,
        topic: "JavaScript",
        tags: JSON.stringify(["JavaScript", "frontend"]),
        difficulty: assignInitialDifficulty(t),
        discrimination: 1.0
      });
    }
  });
  return out;
}



//----------------------Added AWS-------------------------
async function scrapeGFGAWS() {
  const url = 'https://www.geeksforgeeks.org/aws-interview-questions/';
  const { data } = await axios.get(url, { timeout: 30000 });
  const $ = cheerio.load(data);
  const out = [];
  $('h2, h3, li').each((_, el) => {
    const t = clean($(el).text());
    if (t && t.length >= 8 && /[?]$/.test(t)) {
      out.push({
        question_text: t,
        topic: "AWS",
        tags: JSON.stringify(["AWS", "cloud"]),
        difficulty: assignInitialDifficulty(t),
        discrimination: 1.0
      });
    }
  });
  return out;
}

//----------------------Added DOCKER------------------------
async function scrapeGFGDocker() {
  const url = 'https://www.geeksforgeeks.org/docker-interview-questions/';
  const { data } = await axios.get(url, { timeout: 30000 });
  const $ = cheerio.load(data);
  const out = [];
  $('h2, h3, li').each((_, el) => {
    const t = clean($(el).text());
    if (t && t.length >= 8 && /[?]$/.test(t)) {
      out.push({
        question_text: t,
        topic: "Docker",
        tags: JSON.stringify(["Docker", "DevOps"]),
        difficulty: assignInitialDifficulty(t),
        discrimination: 1.0
      });
    }
  });
  return out;
}




////----------------------Added REACT------------------------

function cleanQuestionNumber(text) {
  // Remove leading numbers and dots (like "1. " or "12. ")
  return text.replace(/^\d+\.\s*/, '').trim();
}

async function scrapeReactQuestions() {
  const url = 'https://hackr.io/blog/react-interview-questions';
  const { data } = await axios.get(url, { timeout: 30000 });
  const $ = cheerio.load(data);
  const questions = [];

  $('h3[id^="toc-"]').each((_, el) => {
    let questionText = $(el).text().trim();
    questionText = cleanQuestionNumber(questionText); // remove numbering

    if (questionText && questionText.length >= 8 && /\?$/.test(questionText)) {
      questions.push({
        question_text: questionText,
        topic: 'React',
        tags: JSON.stringify(['React', 'frontend']),
        difficulty: assignInitialDifficulty(questionText),
        discrimination: 1.0
      });
    }
  });

  return questions;
}


//----------------------Added NODEJS-------------------------

async function scrapeNodeJSQuestions() {
  const url = 'https://www.simplilearn.com/tutorials/nodejs-tutorial/nodejs-interview-questions';
  const { data } = await axios.get(url, { timeout: 30000 });
  const $ = cheerio.load(data);
  const questions = [];

  $('h3').each((_, el) => {
    let questionText = $(el).text().trim();
    questionText = cleanQuestionNumber(questionText); // remove numbering

    if (questionText && questionText.length >= 8 && /\?$/.test(questionText)) {
      questions.push({
        question_text: questionText,
        topic: 'Node.js',
        tags: JSON.stringify(['Node.js', 'backend']),
        difficulty: assignInitialDifficulty(questionText),
        discrimination: 1.0
      });
    }
  });

  return questions;
}



module.exports = { 
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
  assignInitialDifficulty 
};



// for testing in the vscode terminal ,if the scrapper works fine or not ,,run the command  inside scrapper as node cheerioScrapper.js
//later change the function names to test here:
if (require.main === module) {
scrapeCSSQuestions() .then(questions => {
    console.log(`📥 Found ${questions.length} htmlll questions:\n`);
    questions.forEach((q, i) => console.log(`${i + 1}. ${q.question_text}`));
    console.log("\n✅ Done! (DB not touched)");
  }).catch(err => {
    console.error("❌ Error while scraping react questions:", err);
  });
}
