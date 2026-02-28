const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    topics: [topicSchema],
  },
  { timestamps: true }
);

const subjectTopicsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: "#3b82f6" },
    sections: [sectionSchema],
  },
  { timestamps: true }
);

subjectTopicsSchema.index({ userId: 1 });

const SubjectTopics = mongoose.model("SubjectTopics", subjectTopicsSchema);
module.exports = SubjectTopics;
