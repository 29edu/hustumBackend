const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");
const diaryRoutes = require("./routes/diaryRoutes");
const profileRoutes = require("./routes/profileRoutes");
const habitRoutes = require("./routes/habitRoutes");
const studyRoutes = require("./routes/studyRoutes");
const weeklyGoalRoutes = require("./routes/weeklyGoalRoutes");
const subjectTopicsRoutes = require("./routes/subjectTopicsRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const improvementRoutes = require("./routes/improvementRoutes");
const researchRoutes = require("./routes/researchRoutes");
const lifeGoalRoutes = require("./routes/lifeGoalRoutes");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(requestLogger);

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/studies", studyRoutes);
app.use("/api/weekly-goals", weeklyGoalRoutes);
app.use("/api/subject-topics", subjectTopicsRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/improvement", improvementRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/life-goals", lifeGoalRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Edison Todo API is running!" });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
