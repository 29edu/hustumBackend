const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    note: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      required: true, // "YYYY-MM-DD"
    },
    emoji: {
      type: String,
      default: "⭐",
    },
    color: {
      type: String,
      default: "#6366f1",
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

ratingSchema.index({ userId: 1, date: 1 });
ratingSchema.index({ userId: 1, category: 1, date: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema);

module.exports = Rating;
