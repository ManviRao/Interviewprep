require("dotenv").config();
const express = require("express");
const app = express();

//cors for allowing frontend to access backend
const cors = require("cors");
app.use(cors());


// Routes
const questionsRoutes = require("./routes/questions");
const evaluateRoute = require("./routes/evaluate");

app.use(express.json());

// Root test endpoint
app.get("/", (_, res) => res.send("Adaptive Interview API running"));

// Use routes
app.use("/api/questions", questionsRoutes);
app.use("/api/evaluate", evaluateRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
