require("dotenv").config();
const axios = require("axios");

async function testGemini() {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: "What is cloud computing in simple terms?" }],
          },
        ],
      }
    );

    console.log("Gemini says:", response.data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

testGemini();
