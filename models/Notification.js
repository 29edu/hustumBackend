const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "announcement", "update", "urgent"],
      default: "info",
    },
    priority: {
      type: String,
      enum: ["normal", "high", "urgent"],
      default: "normal",
    },
    emoji: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    pinnedUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Virtual: check if notification is pinned
notificationSchema.virtual("isPinned").get(function () {
  return this.pinnedUntil && this.pinnedUntil > new Date();
});

// Index for fast active-notification queries
notificationSchema.index({ isActive: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
