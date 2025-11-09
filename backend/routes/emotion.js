const express = require("express");
const router = express.Router();
const emotionService = require("../services/emotionService");

// Analyze frame for emotions
router.post("/analyze-frame", async (req, res) => {
  try {
    const { imageData, userId, sessionId, questionId } = req.body;

    // ✅ ADD DEBUG LOG HERE
    console.log("🎯 [EMOTION-ROUTE] Analyze-frame called:", { 
      userId, 
      sessionId, 
      questionId,
      hasImageData: !!imageData,
      imageDataLength: imageData ? imageData.length : 0 
    });

    if (!imageData) {
      console.log("❌ [EMOTION-ROUTE] No image data provided");
      return res.status(400).json({ error: "No image data provided" });
    }

    const emotionResult = await emotionService.analyzeFrame(
      imageData, 
      userId, 
      sessionId, 
      questionId
    );

    // ✅ ADD DEBUG LOG HERE
    console.log("✅ [EMOTION-ROUTE] Emotion analysis result:", {
      dominant: emotionResult.dominant,
      confidence: emotionResult.confidence,
      confidence_level: emotionResult.confidence_level,
      face_detected: emotionResult.face_detected
    });

    res.json({ emotion: emotionResult });
  } catch (error) {
    console.error("❌ [EMOTION-ROUTE] Error in emotion analysis:", error);
    res.status(500).json({ error: "Failed to analyze emotion" });
  }
});

// Get emotion data for a session
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // ✅ ADD DEBUG LOG HERE
    console.log("📊 [EMOTION-ROUTE] Fetching emotions for session:", sessionId);

    const emotionData = await emotionService.getSessionEmotions(sessionId);

    // ✅ ADD DEBUG LOG HERE
    console.log("📈 [EMOTION-ROUTE] Retrieved emotion data:", {
      sessionId,
      emotionCount: emotionData.length,
      sampleEmotions: emotionData.slice(0, 3) // Show first 3 emotions
    });
    
    res.json({ emotionData });
  } catch (error) {
    console.error("❌ [EMOTION-ROUTE] Error fetching session emotions:", error);
    res.status(500).json({ error: "Failed to fetch emotion data" });
  }
});

// Get emotion statistics for a session
router.get("/session/:sessionId/stats", async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // ✅ ADD DEBUG LOG HERE
    console.log("📈 [EMOTION-ROUTE] Calculating stats for session:", sessionId);

    const emotionData = await emotionService.getSessionEmotions(sessionId);
    
    // ✅ ADD DEBUG LOG HERE
    console.log("📊 [EMOTION-ROUTE] Data for stats calculation:", {
      sessionId,
      totalEmotions: emotionData.length,
      emotions: emotionData.map(e => e.emotion)
    });

    const stats = emotionService.calculateEmotionStats(emotionData);
    
    // ✅ ADD DEBUG LOG HERE
    console.log("✅ [EMOTION-ROUTE] Calculated emotion stats:", stats);
    
    res.json({ stats });
  } catch (error) {
    console.error("❌ [EMOTION-ROUTE] Error calculating emotion stats:", error);
    res.status(500).json({ error: "Failed to calculate emotion statistics" });
  }
});

module.exports = router;