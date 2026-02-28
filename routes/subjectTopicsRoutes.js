const express = require("express");
const router = express.Router();
const {
  getSubjects,
  createSubject,
  deleteSubject,
  updateSubjectColor,
  addSection,
  deleteSection,
  addTopic,
  deleteTopic,
} = require("../controllers/subjectTopicsController");

router.get("/:userId", getSubjects);
router.post("/", createSubject);
router.delete("/:id", deleteSubject);
router.patch("/:id/color", updateSubjectColor);

router.post("/:id/sections", addSection);
router.delete("/:id/sections/:sectionId", deleteSection);

router.post("/:id/sections/:sectionId/topics", addTopic);
router.delete("/:id/sections/:sectionId/topics/:topicId", deleteTopic);

module.exports = router;
