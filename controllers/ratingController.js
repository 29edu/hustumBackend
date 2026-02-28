const Rating = require("../models/Rating");

// Upsert (create or update) a rating for a specific date + category
const upsertRating = async (req, res) => {
  try {
    const { userId, category, score, note, date, emoji, color, isCustom } =
      req.body;

    if (!userId || !category || !score || !date) {
      return res
        .status(400)
        .json({ message: "userId, category, score, and date are required" });
    }

    const rating = await Rating.findOneAndUpdate(
      { userId, category, date },
      {
        userId,
        category,
        score,
        note: note || "",
        date,
        emoji: emoji || "⭐",
        color: color || "#6366f1",
        isCustom: isCustom || false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.status(200).json(rating);
  } catch (error) {
    console.error("Error upserting rating:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all ratings for a specific date (for one user)
const getRatingsByDate = async (req, res) => {
  try {
    const { userId, date } = req.params;
    const ratings = await Rating.find({ userId, date }).sort({ category: 1 });
    res.status(200).json(ratings);
  } catch (error) {
    console.error("Error fetching ratings by date:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get history for a user: last N days across all categories
const getHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30, category } = req.query;

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parseInt(days));
    const fromStr = fromDate.toISOString().split("T")[0];

    const filter = { userId, date: { $gte: fromStr } };
    if (category) filter.category = category;

    const ratings = await Rating.find(filter).sort({ date: 1, category: 1 });
    res.status(200).json(ratings);
  } catch (error) {
    console.error("Error fetching rating history:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get averages per category (last N days)
const getAverages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parseInt(days));
    const fromStr = fromDate.toISOString().split("T")[0];

    const averages = await Rating.aggregate([
      { $match: { userId, date: { $gte: fromStr } } },
      {
        $group: {
          _id: "$category",
          avgScore: { $avg: "$score" },
          count: { $sum: 1 },
          lastScore: { $last: "$score" },
          emoji: { $last: "$emoji" },
          color: { $last: "$color" },
          isCustom: { $last: "$isCustom" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(averages);
  } catch (error) {
    console.error("Error fetching rating averages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a rating entry
const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Rating.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Rating not found" });
    res.status(200).json({ message: "Rating deleted" });
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  upsertRating,
  getRatingsByDate,
  getHistory,
  getAverages,
  deleteRating,
};
