const mongoose = require("mongoose");

const dailyLogSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Format: "YYYY-MM-DD"
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    mood: {
      type: String,
      enum: ["great", "good", "okay", "tough", "skipped", ""],
      default: "",
    },
  },
  { _id: false },
);

const challengeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "fitness",
        "learning",
        "mindfulness",
        "coding",
        "reading",
        "nutrition",
        "creativity",
        "social",
        "finance",
        "career",
        "other",
      ],
      default: "other",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "extreme"],
      default: "medium",
    },
    startDate: {
      type: String, // Format: "YYYY-MM-DD"
      required: true,
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
    },
    targetDescription: {
      type: String,
      trim: true,
      default: "",
    },
    color: {
      type: String,
      default: "#6366f1",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    dailyLogs: {
      type: [dailyLogSchema],
      default: [],
    },
    milestones: {
      type: [
        {
          day: Number,
          label: String,
          achieved: Boolean,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

challengeSchema.index({ userId: 1, isArchived: 1 });
challengeSchema.index({ userId: 1, startDate: 1 });

const Challenge = mongoose.model("Challenge", challengeSchema);

module.exports = Challenge;
