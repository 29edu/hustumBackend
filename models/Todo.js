const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxLength: [200, "Title cannot exceed 200 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "started", "completed"],
      default: "pending",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    deadline: {
      type: Date,
      default: null,
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxLength: [1000, "Description cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
todoSchema.index({ createdAt: -1 });
todoSchema.index({ status: 1 });

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
