require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

// Routes
const questionsRoutes = require("./routes/questions");
const evaluateRoute = require("./routes/evaluate");
const emotionRoute = require("./routes/emotion"); // ✅ NEW

// Root test endpoint
app.get("/", (_, res) => res.send("Adaptive Interview API running"));

// Use routes
app.use("/api/questions", questionsRoutes);
app.use("/api/evaluate", evaluateRoute);
app.use("/api/emotion", emotionRoute); // ✅ NEW

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
