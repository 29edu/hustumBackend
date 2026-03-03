const Challenge = require("../models/Challenge");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns "YYYY-MM-DD" for a given Date object (local time)
 */
const toDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Compute days elapsed since startDate (inclusive of today, capped at durationDays)
 */
const daysElapsed = (startDate, durationDays) => {
  const start = new Date(startDate);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(Math.max(diff, 0), durationDays);
};

// ─── GET all challenges ────────────────────────────────────────────────────────

/**
 * @desc    Get all challenges for a user
 * @route   GET /api/challenges/:userId
 * @access  Public
 */
const getChallenges = async (req, res) => {
  try {
    const { userId } = req.params;
    const { archived } = req.query;

    const filter = { userId };
    if (archived === "true") filter.isArchived = true;
    else filter.isArchived = false;

    const challenges = await Challenge.find(filter).sort({ createdAt: -1 });
    res.status(200).json(challenges);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching challenges", error: error.message });
  }
};

// ─── GET single challenge ──────────────────────────────────────────────────────

/**
 * @desc    Get single challenge by ID
 * @route   GET /api/challenges/detail/:id
 * @access  Public
 */
const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge)
      return res.status(404).json({ message: "Challenge not found" });
    res.status(200).json(challenge);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching challenge", error: error.message });
  }
};

// ─── CREATE challenge ──────────────────────────────────────────────────────────

/**
 * @desc    Create a new challenge
 * @route   POST /api/challenges
 * @access  Public
 */
const createChallenge = async (req, res) => {
  try {
    const {
      userId,
      title,
      description,
      category,
      difficulty,
      startDate,
      durationDays,
      targetDescription,
      color,
      milestones,
    } = req.body;

    if (!userId || !title || !startDate || !durationDays) {
      return res.status(400).json({
        message: "Please provide userId, title, startDate, and durationDays",
      });
    }

    const challenge = new Challenge({
      userId,
      title,
      description,
      category: category || "other",
      difficulty: difficulty || "medium",
      startDate,
      durationDays,
      targetDescription,
      color: color || "#6366f1",
      milestones: milestones || [],
      dailyLogs: [],
    });

    await challenge.save();
    res.status(201).json(challenge);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating challenge", error: error.message });
  }
};

// ─── UPDATE challenge ──────────────────────────────────────────────────────────

/**
 * @desc    Update a challenge's metadata
 * @route   PUT /api/challenges/:id
 * @access  Public
 */
const updateChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      targetDescription,
      color,
      milestones,
    } = req.body;

    const challenge = await Challenge.findById(req.params.id);
    if (!challenge)
      return res.status(404).json({ message: "Challenge not found" });

    if (title !== undefined) challenge.title = title;
    if (description !== undefined) challenge.description = description;
    if (category !== undefined) challenge.category = category;
    if (difficulty !== undefined) challenge.difficulty = difficulty;
    if (targetDescription !== undefined)
      challenge.targetDescription = targetDescription;
    if (color !== undefined) challenge.color = color;
    if (milestones !== undefined) challenge.milestones = milestones;

    await challenge.save();
    res.status(200).json(challenge);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating challenge", error: error.message });
  }
};

// ─── DELETE challenge ──────────────────────────────────────────────────────────

/**
 * @desc    Delete a challenge
 * @route   DELETE /api/challenges/:id
 * @access  Public
 */
const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);
    if (!challenge)
      return res.status(404).json({ message: "Challenge not found" });
    res.status(200).json({ message: "Challenge deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting challenge", error: error.message });
  }
};

// ─── ARCHIVE / UNARCHIVE ──────────────────────────────────────────────────────

/**
 * @desc    Toggle archive status
 * @route   PUT /api/challenges/:id/archive
 * @access  Public
 */
const toggleArchive = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge)
      return res.status(404).json({ message: "Challenge not found" });

    challenge.isArchived = !challenge.isArchived;
    await challenge.save();
    res.status(200).json(challenge);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error archiving challenge", error: error.message });
  }
};

// ─── LOG a day ────────────────────────────────────────────────────────────────

/**
 * @desc    Log (upsert) a daily entry for a challenge
 * @route   PUT /api/challenges/:id/log
 * @access  Public
 * @body    { date: "YYYY-MM-DD", completed: Boolean, note: String, mood: String }
 */
const logDay = async (req, res) => {
  try {
    const { date, completed, note, mood } = req.body;

    if (!date)
      return res.status(400).json({ message: "date is required (YYYY-MM-DD)" });

    const challenge = await Challenge.findById(req.params.id);
    if (!challenge)
      return res.status(404).json({ message: "Challenge not found" });

    // Validate date is within challenge range
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.startDate);
    end.setDate(end.getDate() + challenge.durationDays - 1);
    const logDate = new Date(date);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    logDate.setHours(0, 0, 0, 0);

    if (logDate < start || logDate > end) {
      return res
        .status(400)
        .json({ message: "Date is outside challenge range" });
    }

    const idx = challenge.dailyLogs.findIndex((l) => l.date === date);
    if (idx > -1) {
      // Update existing
      if (completed !== undefined)
        challenge.dailyLogs[idx].completed = completed;
      if (note !== undefined) challenge.dailyLogs[idx].note = note;
      if (mood !== undefined) challenge.dailyLogs[idx].mood = mood;
    } else {
      // Insert new
      challenge.dailyLogs.push({
        date,
        completed: completed ?? false,
        note: note ?? "",
        mood: mood ?? "",
      });
    }

    challenge.markModified("dailyLogs");
    await challenge.save();
    res.status(200).json(challenge);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error logging day", error: error.message });
  }
};

// ─── STATS ────────────────────────────────────────────────────────────────────

/**
 * @desc    Get aggregated stats for a user across all challenges
 * @route   GET /api/challenges/stats/:userId
 * @access  Public
 */
const getStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const challenges = await Challenge.find({ userId });

    let totalCompleted = 0;
    let totalDaysLogged = 0;
    let activeCount = 0;
    let completedCount = 0;
    let longestStreak = 0;

    const today = toDateStr(new Date());

    challenges.forEach((c) => {
      const endDate = new Date(c.startDate);
      endDate.setDate(endDate.getDate() + c.durationDays - 1);
      const endStr = toDateStr(endDate);
      const isActive = !c.isArchived && today <= endStr && today >= c.startDate;
      const isCompleted = today > endStr;

      if (isActive) activeCount++;
      if (isCompleted) completedCount++;

      const completedDays = c.dailyLogs.filter((l) => l.completed).length;
      totalCompleted += completedDays;
      totalDaysLogged += c.dailyLogs.length;

      // Calculate streak for this challenge
      let streak = 0;
      let maxStreak = 0;
      const sortedLogs = [...c.dailyLogs].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      sortedLogs.forEach((log) => {
        if (log.completed) {
          streak++;
          maxStreak = Math.max(maxStreak, streak);
        } else {
          streak = 0;
        }
      });
      longestStreak = Math.max(longestStreak, maxStreak);
    });

    res.status(200).json({
      totalChallenges: challenges.length,
      activeChallenges: activeCount,
      completedChallenges: completedCount,
      totalDaysCompleted: totalCompleted,
      longestStreak,
      completionRate:
        totalDaysLogged > 0
          ? Math.round((totalCompleted / totalDaysLogged) * 100)
          : 0,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stats", error: error.message });
  }
};

module.exports = {
  getChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  toggleArchive,
  logDay,
  getStats,
};
