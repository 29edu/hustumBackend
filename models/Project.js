const mongoose = require("mongoose");

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const featureSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: "" },
  status: {
    type: String,
    enum: ["planned", "in-progress", "completed", "paused", "cancelled"],
    default: "planned",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  deadline: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  notes: { type: String, trim: true, default: "" },
  tags: [{ type: String, trim: true }],
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const futureGoalSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: "" },
  category: {
    type: String,
    enum: ["feature", "performance", "ux", "security", "integration", "other"],
    default: "feature",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  estimatedQuarter: { type: String, trim: true, default: "" }, // e.g. "Q3 2026"
  createdAt: { type: Date, default: Date.now },
});

const updateLogSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ["note", "milestone", "blocker", "release", "bugfix"],
    default: "note",
  },
  createdAt: { type: Date, default: Date.now },
});

const techStackSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ["frontend", "backend", "database", "devops", "tool", "other"],
    default: "other",
  },
});

// ─── Main Schema ──────────────────────────────────────────────────────────────

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxLength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [3000, "Description cannot exceed 3000 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: [
        "upcoming",
        "planning",
        "active",
        "paused",
        "completed",
        "archived",
      ],
      default: "planning",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    category: {
      type: String,
      enum: [
        "web",
        "mobile",
        "desktop",
        "api",
        "ml",
        "data",
        "game",
        "tool",
        "open-source",
        "personal",
        "freelance",
        "other",
      ],
      default: "web",
    },
    color: { type: String, default: "#6366f1" }, // accent color for the project card
    emoji: { type: String, default: "🚀" },

    // Dates
    startDate: { type: Date, default: null },
    targetDate: { type: Date, default: null }, // overall project deadline
    completedAt: { type: Date, default: null },

    // Progress (0-100), auto-calculated from features but can be overridden
    progress: { type: Number, default: 0, min: 0, max: 100 },
    autoProgress: { type: Boolean, default: true }, // derive from features

    // Links
    githubUrl: { type: String, trim: true, default: "" },
    liveUrl: { type: String, trim: true, default: "" },
    designUrl: { type: String, trim: true, default: "" },
    docsUrl: { type: String, trim: true, default: "" },

    // Rich sub-documents
    features: [featureSchema],
    futureGoals: [futureGoalSchema],
    techStack: [techStackSchema],
    updateLogs: [updateLogSchema],

    // Tags / visibility
    tags: [{ type: String, trim: true }],
    isPinned: { type: Boolean, default: false },
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
  },
  { timestamps: true },
);

// ─── Virtual: computed progress ───────────────────────────────────────────────
projectSchema.virtual("computedProgress").get(function () {
  if (!this.features || this.features.length === 0) return this.progress;
  const done = this.features.filter((f) => f.status === "completed").length;
  return Math.round((done / this.features.length) * 100);
});

projectSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Project", projectSchema);
