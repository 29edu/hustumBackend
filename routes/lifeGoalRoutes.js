const express = require("express");
const router = express.Router();
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addStep,
  updateStep,
  toggleStep,
  deleteStep,
  addMilestone,
  toggleMilestone,
  deleteMilestone,
  addReflection,
  deleteReflection,
  getStats,
} = require("../controllers/lifeGoalController");

// Goals
router.get("/:userId", getGoals);
router.get("/:userId/stats", getStats);
router.post("/", createGoal);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

// Steps
router.post("/:id/steps", addStep);
router.put("/:id/steps/:stepId", updateStep);
router.put("/:id/steps/:stepId/toggle", toggleStep);
router.delete("/:id/steps/:stepId", deleteStep);

// Milestones
router.post("/:id/milestones", addMilestone);
router.put("/:id/milestones/:milestoneId/toggle", toggleMilestone);
router.delete("/:id/milestones/:milestoneId", deleteMilestone);

// Reflections
router.post("/:id/reflections", addReflection);
router.delete("/:id/reflections/:reflectionId", deleteReflection);

module.exports = router;
