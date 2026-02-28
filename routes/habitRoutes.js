const express = require("express");
const router = express.Router();
const {
  getHabits,
  createHabit,
  toggleHabitDay,
  deleteHabit,
  updateHabit,
} = require("../controllers/habitController");

// Routes
router.get("/:userId/:month", getHabits);
router.post("/", createHabit);
router.put("/:id", updateHabit);
router.put("/:id/toggle", toggleHabitDay);
router.delete("/:id", deleteHabit);

module.exports = router;
