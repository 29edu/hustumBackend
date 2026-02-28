const express = require("express");
const router = express.Router();
const {
  getAllStudies,
  getStudyById,
  createStudy,
  updateStudy,
  deleteStudy,
  getStudyStats,
} = require("../controllers/studyController");

// Routes
router.get("/", getAllStudies);
router.get("/stats/summary", getStudyStats);
router.get("/:id", getStudyById);
router.post("/", createStudy);
router.put("/:id", updateStudy);
router.delete("/:id", deleteStudy);

module.exports = router;
