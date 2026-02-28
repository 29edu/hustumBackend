const express = require("express");
const router = express.Router();
const {
  getAllResearch,
  getResearchById,
  createResearch,
  updateResearch,
  deleteResearch,
} = require("../controllers/researchController");

router.get("/", getAllResearch);
router.get("/:id", getResearchById);
router.post("/", createResearch);
router.put("/:id", updateResearch);
router.delete("/:id", deleteResearch);

module.exports = router;
