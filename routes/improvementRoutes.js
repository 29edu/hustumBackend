const express = require("express");
const router = express.Router();
const {
  getAllEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
} = require("../controllers/improvementController");

router.get("/", getAllEntries);
router.get("/:id", getEntryById);
router.post("/", createEntry);
router.put("/:id", updateEntry);
router.delete("/:id", deleteEntry);

module.exports = router;
