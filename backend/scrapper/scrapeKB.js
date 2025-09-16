const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeKB() {
  const url = "https://www.geeksforgeeks.org/java-interview-questions/";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const chunks = [];//array to hold chunks of text
  $("p").each((i, el) => {//for each paragraph
    chunks.push({
      topic: "Java",
      content: $(el).text(),
      source_url: url,
    });
  });

  return chunks;
}

module.exports = scrapeKB;   // ✅ export function directly
