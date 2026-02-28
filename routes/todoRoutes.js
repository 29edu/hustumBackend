const express = require("express");
const router = express.Router();
const {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  getDailyAnalytics,
} = require("../controllers/todoController");
const { protect } = require("../middleware/authMiddleware");

// All routes protected
router.use(protect);

// Analytics routes (must be before /:id route)
router.get("/analytics/today", getDailyAnalytics);

// CRUD routes
router.get("/", getAllTodos);
router.get("/:id", getTodoById);
router.post("/", createTodo);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

module.exports = router;
