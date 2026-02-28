const ImprovementEntry = require("../models/ImprovementEntry");

/**
 * @desc    Get all improvement entries (newest first)
 * @route   GET /api/improvement
 */
const getAllEntries = async (req, res) => {
  try {
    const entries = await ImprovementEntry.find().sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching improvement entries",
        error: error.message,
      });
  }
};

/**
 * @desc    Get single improvement entry
 * @route   GET /api/improvement/:id
 */
const getEntryById = async (req, res) => {
  try {
    const entry = await ImprovementEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    res.status(200).json(entry);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching entry", error: error.message });
  }
};

/**
 * @desc    Create new improvement entry
 * @route   POST /api/improvement
 */
const createEntry = async (req, res) => {
  try {
    const {
      userId,
      date,
      lackedAreas,
      improvementAreas,
      goodParts,
      normalAreas,
      mistakesMade,
      lessonsLearned,
      triedSomethingNew,
      newThingDescription,
      mood,
    } = req.body;

    const today = date || new Date().toISOString().slice(0, 10);

    const entry = new ImprovementEntry({
      userId: userId || "default-user",
      date: today,
      lackedAreas: lackedAreas || "",
      improvementAreas: improvementAreas || "",
      goodParts: goodParts || "",
      normalAreas: normalAreas || "",
      mistakesMade: mistakesMade || "",
      lessonsLearned: lessonsLearned || "",
      triedSomethingNew: triedSomethingNew || false,
      newThingDescription: newThingDescription || "",
      mood: mood || 3,
    });

    const saved = await entry.save();
    res.status(201).json(saved);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating entry", error: error.message });
  }
};

/**
 * @desc    Update improvement entry
 * @route   PUT /api/improvement/:id
 */
const updateEntry = async (req, res) => {
  try {
    const entry = await ImprovementEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    const fields = [
      "lackedAreas",
      "improvementAreas",
      "goodParts",
      "normalAreas",
      "mistakesMade",
      "lessonsLearned",
      "triedSomethingNew",
      "newThingDescription",
      "mood",
      "date",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        entry[field] = req.body[field];
      }
    });

    const updated = await entry.save();
    res.status(200).json(updated);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating entry", error: error.message });
  }
};

/**
 * @desc    Delete improvement entry
 * @route   DELETE /api/improvement/:id
 */
const deleteEntry = async (req, res) => {
  try {
    const entry = await ImprovementEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    await entry.deleteOne();
    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting entry", error: error.message });
  }
};

module.exports = {
  getAllEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
};
