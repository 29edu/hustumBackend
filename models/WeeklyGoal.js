const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const weeklyGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      trim: true,
    },
    weekStart: {
      type: Date,
      required: [true, "Week start date is required"],
    },
    weekEnd: {
      type: Date,
      required: [true, "Week end date is required"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxLength: [100, "Subject cannot exceed 100 characters"],
    },
    topics: [topicSchema],
    color: {
      type: String,
      default: "#3B82F6",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("WeeklyGoal", weeklyGoalSchema);
