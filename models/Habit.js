const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    month: {
      type: String,
      required: true, // Format: "2025-01" for January 2025
    },
    completedDays: {
      type: [Number], // Array of day numbers (1-31) when habit was completed
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient queries
habitSchema.index({ userId: 1, month: 1 });

const Habit = mongoose.model("Habit", habitSchema);

module.exports = Habit;
