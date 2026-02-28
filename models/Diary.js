const mongoose = require("mongoose");

const diarySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Untitled Entry",
      trim: true,
      maxLength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    userId: {
      type: String,
      default: "default-user",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
diarySchema.index({ createdAt: -1 });
diarySchema.index({ userId: 1 });

const Diary = mongoose.model("Diary", diarySchema);

module.exports = Diary;
