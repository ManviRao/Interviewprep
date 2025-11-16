const express = require("express");
const router = express.Router();
const userQueries = require("../config/userQueries");
const { runOnce, stopScraper } = require("../scrapper/runScrapper.js"); // adjust path
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
// Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

    const admin = await userQueries.findUserByEmail(email);
    console.log("Admin record from DB:", admin);
    if (!admin || admin.role !== "admin") return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isPasswordValid = await userQueries.verifyPassword(password, admin.password_hash);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: "Invalid credentials" });

    res.json({
      success: true,
      message: "Admin login successful!",
      user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Server error during admin login" });
  }
});
// Start scraping
router.post("/scrape/start", verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await runOnce();
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to start scraper" });
  }
});

// Stop scraping
router.post("/scrape/stop", verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await stopScraper();
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to stop scraper" });
  }
});


module.exports = router;
