const axios = require('axios');
const { mysql, DB_CONFIG } = require("../config/db");

const EMOTION_API_URL = 'http://localhost:5001';

class EmotionService {
  async analyzeFrame(imageData, userId, sessionId, questionId) {
    try {
      // ✅ ADD DEBUG LOG HERE
      console.log("🚀 [EMOTION-SERVICE] Calling Python emotion API...", {
        userId,
        sessionId,
        questionId,
        imageDataLength: imageData ? imageData.length : 0,
        imageDataPreview: imageData ? imageData.substring(0, 50) + "..." : "none"
      });
      
      const response = await axios.post(`${EMOTION_API_URL}/analyze`, {
        imageData,
        userId,
        sessionId,
        questionId
      });
      
      // ✅ ADD DEBUG LOG HERE
      console.log("✅ [EMOTION-SERVICE] Python API response received:", {
        dominant: response.data.dominant,
        confidence: response.data.confidence,
        confidence_level: response.data.confidence_level,
        face_detected: response.data.face_detected
      });
      
      // STORE emotion data in database after analysis
      await this.storeEmotionData(response.data, userId, sessionId, questionId);
      
      return response.data;
    } catch (error) {
      console.error('❌ [EMOTION-SERVICE] Emotion analysis error:', error.message);
      console.error('❌ [EMOTION-SERVICE] Error details:', {
        url: EMOTION_API_URL,
        userId,
        sessionId,
        errorCode: error.code,
        errorMessage: error.message
      });
      
      // Return default emotion data if service is down
      return {
        dominant: 'neutral',
        confidence: 0,
        confidence_level: 'service_unavailable',
        face_detected: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ✅ FIXED: Store emotion data in database (handles undefined values)
  async storeEmotionData(emotionResult, userId, sessionId, questionId) {
    let conn;
    try {
      conn = await mysql.createConnection(DB_CONFIG);
      
      // ✅ FIX: Convert undefined to null for database
      const safeQuestionId = (questionId !== undefined && questionId !== null && questionId !== 'undefined') 
        ? questionId 
        : null;
      
      // ✅ ADD DEBUG LOG HERE
      console.log("💾 [EMOTION-SERVICE] Storing emotion data in DB...", {
        userId,
        sessionId,
        originalQuestionId: questionId,
        safeQuestionId: safeQuestionId,
        emotion: emotionResult.dominant,
        confidence: emotionResult.confidence,
        confidence_level: emotionResult.confidence_level
      });
      
      await conn.execute(
        `INSERT INTO user_emotions (user_id, session_id, question_id, emotion, confidence, confidence_level, face_detected, timestamp) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          sessionId,
          safeQuestionId,
          emotionResult.dominant,
          emotionResult.confidence || 0,
          emotionResult.confidence_level || 'unknown',
          emotionResult.face_detected ? 1 : 0,
          emotionResult.timestamp || new Date().toISOString()
        ]
      );
      
      // ✅ ADD DEBUG LOG HERE
      console.log("✅ [EMOTION-SERVICE] Successfully stored emotion data");
      
    } catch (error) {
      console.error("❌ [EMOTION-SERVICE] Error storing emotion data:", error);
      console.error("❌ [EMOTION-SERVICE] DB Error details:", {
        userId,
        sessionId,
        questionId: questionId,
        errorCode: error.code,
        errorMessage: error.message,
        sqlState: error.sqlState
      });
      
      // Log the exact SQL parameters for debugging
      console.error("🔍 [EMOTION-SERVICE] SQL Parameters that failed:", [
        userId,
        sessionId,
        (questionId !== undefined && questionId !== null) ? questionId : null,
        emotionResult.dominant,
        emotionResult.confidence || 0,
        emotionResult.confidence_level || 'unknown',
        emotionResult.face_detected ? 1 : 0,
        emotionResult.timestamp || new Date().toISOString()
      ]);
    } finally {
      if (conn) {
        await conn.end();
        console.log("🔌 [EMOTION-SERVICE] Database connection closed");
      }
    }
  }

  // ✅ FIXED: Get session emotions from database
  async getSessionEmotions(sessionId) {
    let conn;
    try {
      conn = await mysql.createConnection(DB_CONFIG);
      
      // ✅ ADD DEBUG LOG HERE
      console.log("🔍 [EMOTION-SERVICE] Querying emotions for session:", sessionId);
      
      const [rows] = await conn.execute(
        `SELECT emotion, confidence, confidence_level, face_detected, timestamp 
         FROM user_emotions 
         WHERE session_id = ? 
         ORDER BY timestamp ASC`,
        [sessionId]
      );
      
      // ✅ ADD DEBUG LOG HERE
      console.log("📄 [EMOTION-SERVICE] Database query result:", {
        sessionId,
        rowCount: rows.length,
        emotions: rows.map(r => ({
          emotion: r.emotion,
          confidence: r.confidence,
          confidence_level: r.confidence_level,
          faceDetected: r.face_detected,
          timestamp: r.timestamp
        }))
      });
      
      // Log confidence_level specifically
      if (rows.length > 0) {
        console.log("🎯 [EMOTION-SERVICE] Confidence levels in data:", 
          rows.map(r => `${r.emotion} -> ${r.confidence_level}`)
        );
      }
      
      return rows;
    } catch (error) {
      console.error('❌ [EMOTION-SERVICE] Error fetching session emotions:', error);
      console.error('❌ [EMOTION-SERVICE] DB Query Error details:', {
        sessionId,
        errorCode: error.code,
        errorMessage: error.message,
        sqlState: error.sqlState
      });
      return [];
    } finally {
      if (conn) {
        await conn.end();
        console.log("🔌 [EMOTION-SERVICE] Database connection closed for query");
      }
    }
  }

  // ✅ FIXED: Use confidence_level from Python API instead of recalculating
  calculateEmotionStats(emotionData) {
    // ✅ ADD DEBUG LOG HERE
    console.log("📈 [EMOTION-SERVICE] Calculating emotion stats...", {
      inputDataLength: emotionData ? emotionData.length : 0,
      inputDataSample: emotionData ? emotionData.slice(0, 2) : "none"
    });

    if (!emotionData || emotionData.length === 0) {
      console.log("📭 [EMOTION-SERVICE] No emotion data provided for stats calculation");
      return {
        confidenceLevel: 'No Data',
        engagement: 0,
        stress: 0,
        dominantEmotion: 'neutral',
        totalSamples: 0,
        emotionDistribution: {}
      };
    }

    const validEmotions = emotionData.filter(data => data.face_detected);

    console.log("👥 [EMOTION-SERVICE] Face detection stats:", {
      totalSamples: emotionData.length,
      validEmotions: validEmotions.length,
      noFaceDetected: emotionData.length - validEmotions.length
    });

    if (validEmotions.length === 0) {
      console.log("🚫 [EMOTION-SERVICE] No faces detected in any emotion samples");
      return {
        confidenceLevel: 'No Face Detected',
        engagement: 0,
        stress: 0,
        dominantEmotion: 'neutral',
        totalSamples: emotionData.length,
        emotionDistribution: {}
      };
    }

    // ✅ CRITICAL FIX: Use confidence_level from Python API
    const confidenceLevels = validEmotions.map(data => data.confidence_level).filter(Boolean);
    
    let finalConfidenceLevel = 'Neutral';
    
    if (confidenceLevels.length > 0) {
        // Count occurrences of each confidence level
        const confidenceCounts = {};
        confidenceLevels.forEach(level => {
            confidenceCounts[level] = (confidenceCounts[level] || 0) + 1;
        });
        
        console.log("🎯 [EMOTION-SERVICE] Confidence level counts from DB:", confidenceCounts);
        
        // Find the most frequent confidence level
        let maxCount = 0;
        Object.keys(confidenceCounts).forEach(level => {
            if (confidenceCounts[level] > maxCount) {
                maxCount = confidenceCounts[level];
                finalConfidenceLevel = level;
            }
        });
    } else {
        // Fallback: If no confidence_level in data, use our mapping
        console.log("⚠️ [EMOTION-SERVICE] No confidence_level found in data, using fallback mapping");
        const dominantEmotion = this.getDominantEmotion(validEmotions);
        if (['happy', 'surprise', 'neutral'].includes(dominantEmotion)) {
            finalConfidenceLevel = 'Confident';
        } else {
            finalConfidenceLevel = 'Low Confidence';
        }
    }

    // Count emotions for distribution display
    const emotionCounts = {};
    validEmotions.forEach(data => {
        const emotion = data.emotion || 'neutral';
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    console.log("🎭 [EMOTION-SERVICE] Emotion counts:", emotionCounts);

    // Find dominant emotion
    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => 
        emotionCounts[a] > emotionCounts[b] ? a : b
    );

    // Calculate engagement and stress for additional insights
    const positiveEmotions = validEmotions.filter(data => 
        ['happy', 'surprise'].includes(data.emotion)
    ).length;
    const engagement = (positiveEmotions / validEmotions.length) * 100;

    const negativeEmotions = validEmotions.filter(data => 
        ['angry', 'fear', 'sad', 'disgust'].includes(data.emotion)
    ).length;
    const stress = (negativeEmotions / validEmotions.length) * 100;

    const finalStats = {
        confidenceLevel: finalConfidenceLevel, // ✅ This now correctly uses Python API's confidence_level
        engagement: Math.round(engagement),
        stress: Math.round(stress),
        confidence: 0,
        dominantEmotion,
        totalSamples: emotionData.length,
        emotionDistribution: emotionCounts
    };

    // ✅ ADD DEBUG LOG HERE
    console.log("✅ [EMOTION-SERVICE] Final emotion stats:", finalStats);

    return finalStats;
  }

  // Helper function to get dominant emotion
  getDominantEmotion(emotionData) {
    const emotionCounts = {};
    emotionData.forEach(data => {
        const emotion = data.emotion || 'neutral';
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    return Object.keys(emotionCounts).reduce((a, b) => 
        emotionCounts[a] > emotionCounts[b] ? a : b
    );
  }

  // Helper function to get emotion insights
  getEmotionInsights(emotionStats) {
    const insights = [];
    
    if (emotionStats.engagement > 70) {
      insights.push("High engagement detected - you seemed focused and positive during the test.");
    }
    
    if (emotionStats.stress > 50) {
      insights.push("Moderate stress levels detected - this is common during challenging assessments.");
    }
    
    if (emotionStats.confidence > 0.7) {
      insights.push("High confidence in your answers based on emotional cues.");
    }
    
    if (emotionStats.dominantEmotion === 'neutral') {
      insights.push("You maintained a neutral and composed demeanor throughout.");
    }
    
    if (insights.length === 0) {
      insights.push("Emotional patterns were varied throughout the assessment.");
    }
    
    return insights;
  }

  // ✅ NEW: Method to check if database connection is working
  async testDatabaseConnection() {
    let conn;
    try {
      conn = await mysql.createConnection(DB_CONFIG);
      console.log("✅ [EMOTION-SERVICE] Database connection test: SUCCESS");
      return true;
    } catch (error) {
      console.error("❌ [EMOTION-SERVICE] Database connection test: FAILED", error.message);
      return false;
    } finally {
      if (conn) {
        await conn.end();
      }
    }
  }

  // ✅ NEW: Method to get database schema info
  async getTableSchema() {
    let conn;
    try {
      conn = await mysql.createConnection(DB_CONFIG);
      const [rows] = await conn.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'user_emotions' 
        AND TABLE_SCHEMA = DATABASE()
      `);
      console.log("📋 [EMOTION-SERVICE] user_emotions table schema:", rows);
      return rows;
    } catch (error) {
      console.error("❌ [EMOTION-SERVICE] Error getting table schema:", error.message);
      return [];
    } finally {
      if (conn) {
        await conn.end();
      }
    }
  }
}

module.exports = new EmotionService();