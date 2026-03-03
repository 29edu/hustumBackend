const express = require("express");
const router = express.Router();
const {
  getProjects,
  getStats,
  createProject,
  updateProject,
  deleteProject,
  addFeature,
  updateFeature,
  deleteFeature,
  addFutureGoal,
  deleteFutureGoal,
  addLog,
  deleteLog,
  addTech,
  deleteTech,
} = require("../controllers/projectController");

// Projects
router.get("/:userId", getProjects);
router.get("/:userId/stats", getStats);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// Features
router.post("/:id/features", addFeature);
router.put("/:id/features/:featureId", updateFeature);
router.delete("/:id/features/:featureId", deleteFeature);

// Future Goals
router.post("/:id/future-goals", addFutureGoal);
router.delete("/:id/future-goals/:goalId", deleteFutureGoal);

// Update Logs
router.post("/:id/logs", addLog);
router.delete("/:id/logs/:logId", deleteLog);

// Tech Stack
router.post("/:id/tech-stack", addTech);
router.delete("/:id/tech-stack/:techId", deleteTech);

module.exports = router;
