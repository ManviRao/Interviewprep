require("dotenv").config();
const express = require("express");
const app = express();

// CORS for allowing frontend to access backend
const cors = require("cors");
app.use(cors());

// For parsing multipart/form-data (for image uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
const questionsRoutes = require("./routes/questions");
const evaluateRoute = require("./routes/evaluate");
const scraperRoutes = require('./routes/runScraper');
const emotionRoutes = require('./routes/emotion'); // New emotion routes

// Root test endpoint
app.get("/", (_, res) => res.send("Adaptive Interview API running"));

// Use routes
app.use("/api/questions", questionsRoutes);
app.use("/api/evaluate", evaluateRoute);
app.use("/api/run-scraper", scraperRoutes);
app.use("/api/emotion", emotionRoutes); // New emotion routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));