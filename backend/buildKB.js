//coordinates scraping + saving.
const scrapeKB = require("./scrapper/scrapeKB");
const saveKB = require("./models/saveKB");

async function buildKB() {
  try {
    const url = "https://www.geeksforgeeks.org/java-interview-questions/";
    const topic = "Java";

    const kbData = await scrapeKB(url, topic);//wait for scraped data
    await saveKB(kbData);//wait for save to complete

    console.log("✅ Knowledge Base created successfully!");
  } catch (err) {
    console.error("❌ Error building KB:", err);
  }
}

buildKB();
