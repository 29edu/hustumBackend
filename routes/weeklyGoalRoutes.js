const express = require("express");
const router = express.Router();
const {
  getWeeklyGoals,
  createWeeklyGoal,
  updateWeeklyGoal,
  toggleTopic,
  addTopic,
  deleteTopic,
  deleteWeeklyGoal,
} = require("../controllers/weeklyGoalController");

router.get("/:userId", getWeeklyGoals);
router.post("/", createWeeklyGoal);
router.put("/:id", updateWeeklyGoal);
router.put("/:id/topics/:topicId/toggle", toggleTopic);
router.post("/:id/topics", addTopic);
router.delete("/:id/topics/:topicId", deleteTopic);
router.delete("/:id", deleteWeeklyGoal);

module.exports = router;
