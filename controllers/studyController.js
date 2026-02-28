const Study = require("../models/Study");

/**
 * @desc    Get all study entries
 * @route   GET /api/studies
 * @access  Public
 */
const getAllStudies = async (req, res) => {
  try {
    const { date, category, startDate, endDate } = req.query;
    let query = {};

    // Filter by specific date
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.studyDate = { $gte: startOfDay, $lte: endOfDay };
    }

    // Filter by date range
    if (startDate && endDate) {
      query.studyDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Filter by category
    if (category && category !== "all") {
      query.category = category;
    }

    const studies = await Study.find(query).sort({
      studyDate: -1,
      createdAt: -1,
    });
    res.status(200).json(studies);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching study entries",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single study entry by ID
 * @route   GET /api/studies/:id
 * @access  Public
 */
const getStudyById = async (req, res) => {
  try {
    const study = await Study.findById(req.params.id);

    if (!study) {
      return res.status(404).json({ message: "Study entry not found" });
    }

    res.status(200).json(study);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching study entry",
      error: error.message,
    });
  }
};

/**
 * @desc    Create new study entry
 * @route   POST /api/studies
 * @access  Public
 */
const createStudy = async (req, res) => {
  try {
    const {
      topic,
      category,
      notes,
      duration,
      studyDate,
      resources,
      completed,
    } = req.body;

    if (!topic || topic.trim() === "") {
      return res.status(400).json({ message: "Topic is required" });
    }

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const study = new Study({
      topic: topic.trim(),
      category,
      notes: notes ? notes.trim() : "",
      duration: duration || 0,
      studyDate: studyDate || new Date(),
      resources: resources || [],
      completed: completed || false,
    });

    const newStudy = await study.save();
    res.status(201).json(newStudy);
  } catch (error) {
    res.status(400).json({
      message: "Error creating study entry",
      error: error.message,
    });
  }
};

/**
 * @desc    Update study entry
 * @route   PUT /api/studies/:id
 * @access  Public
 */
const updateStudy = async (req, res) => {
  try {
    const study = await Study.findById(req.params.id);

    if (!study) {
      return res.status(404).json({ message: "Study entry not found" });
    }

    if (req.body.topic !== undefined) {
      study.topic = req.body.topic.trim();
    }
    if (req.body.category !== undefined) {
      study.category = req.body.category;
    }
    if (req.body.notes !== undefined) {
      study.notes = req.body.notes.trim();
    }
    if (req.body.duration !== undefined) {
      study.duration = req.body.duration;
    }
    if (req.body.studyDate !== undefined) {
      study.studyDate = req.body.studyDate;
    }
    if (req.body.resources !== undefined) {
      study.resources = req.body.resources;
    }
    if (req.body.completed !== undefined) {
      study.completed = req.body.completed;
    }

    const updatedStudy = await study.save();
    res.status(200).json(updatedStudy);
  } catch (error) {
    res.status(400).json({
      message: "Error updating study entry",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete study entry
 * @route   DELETE /api/studies/:id
 * @access  Public
 */
const deleteStudy = async (req, res) => {
  try {
    const study = await Study.findById(req.params.id);

    if (!study) {
      return res.status(404).json({ message: "Study entry not found" });
    }

    await study.deleteOne();
    res.status(200).json({ message: "Study entry deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting study entry",
      error: error.message,
    });
  }
};

/**
 * @desc    Get study statistics
 * @route   GET /api/studies/stats/summary
 * @access  Public
 */
const getStudyStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};

    if (startDate && endDate) {
      dateFilter.studyDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const stats = await Study.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$category",
          totalStudies: { $sum: 1 },
          totalDuration: { $sum: "$duration" },
        },
      },
      { $sort: { totalDuration: -1 } },
    ]);

    const totalEntries = await Study.countDocuments(dateFilter);
    const totalDuration = stats.reduce(
      (acc, curr) => acc + curr.totalDuration,
      0,
    );

    res.status(200).json({
      stats,
      totalEntries,
      totalDuration,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching study statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getAllStudies,
  getStudyById,
  createStudy,
  updateStudy,
  deleteStudy,
  getStudyStats,
};
