const express = require("express");
const router = express.Router();
const { runOnce, stopScraper } = require("../scrapper/runScrapper");


router.post("/", async (req, res) => {
  const result = await runOnce();
  res.json(result);
});

router.post("/stop-scraper", async (req, res) => {
  const result = await stopScraper();
  res.json(result);
});


module.exports = router;
