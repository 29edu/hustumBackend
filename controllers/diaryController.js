const Diary = require("../models/Diary");

/**
 * @desc    Get all diary entries
 * @route   GET /api/diary
 * @access  Public
 */
const getAllDiaries = async (req, res) => {
  try {
    const diaries = await Diary.find().sort({ createdAt: -1 });
    res.status(200).json(diaries);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching diary entries",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single diary entry by ID
 * @route   GET /api/diary/:id
 * @access  Public
 */
const getDiaryById = async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);

    if (!diary) {
      return res.status(404).json({ message: "Diary entry not found" });
    }

    res.status(200).json(diary);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching diary entry",
      error: error.message,
    });
  }
};

/**
 * @desc    Create new diary entry
 * @route   POST /api/diary
 * @access  Public
 */
const createDiary = async (req, res) => {
  try {
    const { title, content, userId } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content is required" });
    }

    const diary = new Diary({
      title: title || "Untitled Entry",
      content: content.trim(),
      userId: userId || "default-user",
    });

    const newDiary = await diary.save();
    res.status(201).json(newDiary);
  } catch (error) {
    res.status(400).json({
      message: "Error creating diary entry",
      error: error.message,
    });
  }
};

/**
 * @desc    Update diary entry
 * @route   PUT /api/diary/:id
 * @access  Public
 */
const updateDiary = async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);

    if (!diary) {
      return res.status(404).json({ message: "Diary entry not found" });
    }

    if (req.body.title !== undefined) {
      diary.title = req.body.title.trim();
    }
    if (req.body.content !== undefined) {
      diary.content = req.body.content.trim();
    }

    const updatedDiary = await diary.save();
    res.status(200).json(updatedDiary);
  } catch (error) {
    res.status(400).json({
      message: "Error updating diary entry",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete diary entry
 * @route   DELETE /api/diary/:id
 * @access  Public
 */
const deleteDiary = async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);

    if (!diary) {
      return res.status(404).json({ message: "Diary entry not found" });
    }

    await diary.deleteOne();
    res.status(200).json({ message: "Diary entry deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting diary entry",
      error: error.message,
    });
  }
};

module.exports = {
  getAllDiaries,
  getDiaryById,
  createDiary,
  updateDiary,
  deleteDiary,
};
