require("dotenv").config();
const express = require("express");
const app = express();

//cors for allowing frontend to access backend
const cors = require("cors");
app.use(cors());


//cron jobs
const cron = require("node-cron"); //  Added this for cron jobs
const { exec } = require("child_process"); //  Added this for cron jobs


// Routes
const questionsRoutes = require("./routes/questions");
const evaluateRoute = require("./routes/evaluate");
const scraperRoutes = require('./routes/runScraper');//for scrape button page


app.use(express.json());

// Add this with your other route imports
const authRoutes = require("./routes/auth");

// Add this with your other app.use() routes
app.use("/api/auth", authRoutes);




// Root test endpoint
app.get("/", (_, res) => res.send("Adaptive Interview API running"));

// Use routes
app.use("/api/questions", questionsRoutes);
app.use("/api/evaluate", evaluateRoute);
app.use("/api/run-scraper", scraperRoutes); //for scrape button page

// ✅ CRON JOB SECTION
const scraperCron = process.env.SCRAPER_CRON || "*/1 * * * *"; // Default daily every minute


cron.schedule(
  scraperCron,
  () => {
    console.log("🕑 Running daily scraper job at:", new Date());

    // Run your scraper script
    exec("node ./routes/runScraper.js", (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Scraper error:", err);
        return;
      }
      if (stderr) console.error("⚠️ Scraper stderr:", stderr);
      console.log("✅ Scraper output:", stdout);
    });
  },
  {
    timezone: "Asia/Kolkata",
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


