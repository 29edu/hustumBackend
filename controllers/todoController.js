const Todo = require("../models/Todo");

/**
 * @desc    Get all todos
 * @route   GET /api/todos
 * @access  Public
 */
const getAllTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching todos",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single todo by ID
 * @route   GET /api/todos/:id
 * @access  Public
 */
const getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching todo",
      error: error.message,
    });
  }
};

/**
 * @desc    Create new todo
 * @route   POST /api/todos
 * @access  Public
 */
const createTodo = async (req, res) => {
  try {
    const {
      title,
      status,
      completed,
      deadline,
      startTime,
      endTime,
      description,
    } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const todo = new Todo({
      user: req.user._id,
      title: title.trim(),
      status: status || "pending",
      completed: completed || false,
      deadline: deadline || null,
      startTime: startTime || null,
      endTime: endTime || null,
      description: description || "",
    });

    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(400).json({
      message: "Error creating todo",
      error: error.message,
    });
  }
};

/**
 * @desc    Update todo
 * @route   PUT /api/todos/:id
 * @access  Public
 */
const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    if (req.body.title !== undefined) {
      todo.title = req.body.title.trim();
    }
    if (req.body.status !== undefined) {
      todo.status = req.body.status;
    }
    if (req.body.completed !== undefined) {
      todo.completed = req.body.completed;
    }
    if (req.body.deadline !== undefined) {
      todo.deadline = req.body.deadline;
    }
    if (req.body.startTime !== undefined) {
      todo.startTime = req.body.startTime;
    }
    if (req.body.endTime !== undefined) {
      todo.endTime = req.body.endTime;
    }
    if (req.body.description !== undefined) {
      todo.description = req.body.description;
    }
    if (req.body.completed !== undefined) {
      todo.completed = req.body.completed;
    }
    if (req.body.deadline !== undefined) {
      todo.deadline = req.body.deadline;
    }

    const updatedTodo = await todo.save();
    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(400).json({
      message: "Error updating todo",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete todo
 * @route   DELETE /api/todos/:id
 * @access  Public
 */
const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    await Todo.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting todo",
      error: error.message,
    });
  }
};

/**
 * @desc    Get daily task statistics for last 7 days
 * @route   GET /api/todos/analytics/daily
 * @access  Public
 */
const getDailyAnalytics = async (req, res) => {
  try {
    const days = 7;
    const dailyData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayTodos = await Todo.find({
        user: req.user._id,
        createdAt: {
          $gte: date,
          $lt: nextDate,
        },
      });

      const total = dayTodos.length;
      const completed = dayTodos.filter(
        (todo) => todo.status === "completed" || todo.completed,
      ).length;

      dailyData.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        total,
        completed,
      });
    }

    res.status(200).json(dailyData);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching analytics",
      error: error.message,
    });
  }
};

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  getDailyAnalytics,
};
