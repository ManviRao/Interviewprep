const express = require("express");
const { spawn } = require("child_process");
const path = require("path");

const router = express.Router();

// GET /api/emotion/analyze
router.get("/analyze", async (req, res) => {
  try {
    // Resolve full path to your Python script
    const scriptPath = path.resolve(__dirname, "../../../ml/emotion_detection/realtimedetection.py");

    const python = spawn("python", [scriptPath]);

    let dataToSend = "";

    python.stdout.on("data", (data) => {
      dataToSend += data.toString();
    });

    python.stderr.on("data", (data) => {
      console.error(`Python stderr: ${data}`);
    });

    python.on("close", (code) => {
      try {
        const result = JSON.parse(dataToSend);
        res.json(result);
      } catch (err) {
        console.error("Error parsing Python output:", err);
        res.status(500).json({ status: "fail", message: "Invalid Python output" });
      }
    });
  } catch (error) {
    console.error("Error running emotion detection:", error);
    res.status(500).json({ status: "fail", message: "Internal server error" });
  }
});

module.exports = router;
