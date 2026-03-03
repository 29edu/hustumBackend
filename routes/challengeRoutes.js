const express = require("express");
const router = express.Router();
const {
  getChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  toggleArchive,
  logDay,
  getStats,
} = require("../controllers/challengeController");

// Stats (must be before /:id routes)
router.get("/stats/:userId", getStats);

// Detail by id (must be before /:userId)
router.get("/detail/:id", getChallengeById);

// Collection
router.get("/:userId", getChallenges);
router.post("/", createChallenge);

// Single challenge operations
router.put("/:id", updateChallenge);
router.put("/:id/log", logDay);
router.put("/:id/archive", toggleArchive);
router.delete("/:id", deleteChallenge);

module.exports = router;
