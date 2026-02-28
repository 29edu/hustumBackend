const mongoose = require("mongoose");

const improvementEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "default-user",
    },
    date: {
      type: String, // stored as YYYY-MM-DD
      required: true,
    },
    // Where I lacked today
    lackedAreas: {
      type: String,
      default: "",
      trim: true,
    },
    // Where I can improve
    improvementAreas: {
      type: String,
      default: "",
      trim: true,
    },
    // Good parts of today / what I did good
    goodParts: {
      type: String,
      default: "",
      trim: true,
    },
    // Where it was normal (neutral)
    normalAreas: {
      type: String,
      default: "",
      trim: true,
    },
    // Mistakes I made today
    mistakesMade: {
      type: String,
      default: "",
      trim: true,
    },
    // What I can learn from today
    lessonsLearned: {
      type: String,
      default: "",
      trim: true,
    },
    // Did I try something new?
    triedSomethingNew: {
      type: Boolean,
      default: false,
    },
    // If yes, what was it?
    newThingDescription: {
      type: String,
      default: "",
      trim: true,
    },
    // Overall mood (1-5 scale)
    mood: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
  },
  {
    timestamps: true,
  },
);

improvementEntrySchema.index({ createdAt: -1 });
improvementEntrySchema.index({ userId: 1 });
improvementEntrySchema.index({ date: -1 });

const ImprovementEntry = mongoose.model(
  "ImprovementEntry",
  improvementEntrySchema,
);

module.exports = ImprovementEntry;
