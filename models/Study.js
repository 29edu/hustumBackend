const mongoose = require("mongoose");

const studySchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
      maxLength: [500, "Topic cannot exceed 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "JavaScript",
        "React",
        "Node.js",
        "System Design",
        "Data Structures",
        "Algorithms",
        "Database",
        "DevOps",
        "HTML/CSS",
        "TypeScript",
        "Python",
        "Other",
      ],
      default: "Other",
    },
    notes: {
      type: String,
      trim: true,
      maxLength: [2000, "Notes cannot exceed 2000 characters"],
    },
    duration: {
      type: Number, // Duration in minutes
      default: 0,
      min: [0, "Duration cannot be negative"],
    },
    studyDate: {
      type: Date,
      default: Date.now,
      required: [true, "Study date is required"],
    },
    resources: [
      {
        title: String,
        url: String,
      },
    ],
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for faster queries
studySchema.index({ studyDate: -1 });
studySchema.index({ category: 1 });
studySchema.index({ createdAt: -1 });

const Study = mongoose.model("Study", studySchema);

module.exports = Study;
