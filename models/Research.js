const mongoose = require("mongoose");

const researchSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "default-user",
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxLength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    tags: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      trim: true,
      default: "",
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

researchSchema.index({ createdAt: -1 });
researchSchema.index({ userId: 1 });
researchSchema.index({ category: 1 });

const Research = mongoose.model("Research", researchSchema);
module.exports = Research;
