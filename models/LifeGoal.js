const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  notes: { type: String, trim: true, default: "" },
  order: { type: Number, default: 0 },
});

const reflectionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  mood: {
    type: String,
    enum: ["great", "good", "neutral", "difficult", "struggling"],
    default: "neutral",
  },
  createdAt: { type: Date, default: Date.now },
});

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  targetDate: { type: Date, default: null },
  achieved: { type: Boolean, default: false },
  achievedAt: { type: Date, default: null },
});

const lifeGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
      maxLength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },
    vision: {
      type: String,
      trim: true,
      maxLength: [2000, "Vision cannot exceed 2000 characters"],
      default: "",
    },
    motivation: {
      type: String,
      trim: true,
      maxLength: [1000, "Motivation cannot exceed 1000 characters"],
      default: "",
    },
    category: {
      type: String,
      enum: [
        "career",
        "personal",
        "health",
        "financial",
        "relationships",
        "education",
        "spiritual",
        "adventure",
        "creative",
        "social",
        "other",
      ],
      default: "personal",
    },
    type: {
      type: String,
      enum: ["life", "yearly", "monthly", "quarterly"],
      default: "life",
    },
    year: { type: Number, default: null },
    month: { type: Number, min: 1, max: 12, default: null },
    quarter: { type: Number, min: 1, max: 4, default: null },
    deadline: { type: Date, default: null },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "paused", "abandoned"],
      default: "not_started",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    effortStarted: { type: Boolean, default: false },
    effortStartDate: { type: Date, default: null },
    steps: [stepSchema],
    milestones: [milestoneSchema],
    reflections: [reflectionSchema],
    obstacles: {
      type: String,
      trim: true,
      maxLength: [1000, "Obstacles cannot exceed 1000 characters"],
      default: "",
    },
    resources: {
      type: String,
      trim: true,
      maxLength: [1000, "Resources cannot exceed 1000 characters"],
      default: "",
    },
    tags: [{ type: String, trim: true }],
    color: { type: String, default: "#6366f1" },
    emoji: { type: String, default: "🎯" },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("LifeGoal", lifeGoalSchema);
