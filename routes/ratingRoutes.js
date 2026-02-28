const express = require("express");
const router = express.Router();
const {
  upsertRating,
  getRatingsByDate,
  getHistory,
  getAverages,
  deleteRating,
} = require("../controllers/ratingController");

// POST /api/ratings          — upsert (create or update) a rating
router.post("/", upsertRating);

// GET  /api/ratings/:userId/:date — all ratings for a user on a date
router.get("/:userId/:date", getRatingsByDate);

// GET  /api/ratings/history/:userId?days=30&category=Mood — history
router.get("/history/:userId", getHistory);

// GET  /api/ratings/averages/:userId?days=30 — averages per category
router.get("/averages/:userId", getAverages);

// DELETE /api/ratings/:id
router.delete("/:id", deleteRating);

module.exports = router;
