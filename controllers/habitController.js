const Habit = require("../models/Habit");

/**
 * @desc    Get all habits for a user and month
 * @route   GET /api/habits/:userId/:month
 * @access  Public
 */
const getHabits = async (req, res) => {
  try {
    const { userId, month } = req.params;
    const habits = await Habit.find({ userId, month }).sort({ createdAt: 1 });
    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching habits",
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new habit
 * @route   POST /api/habits
 * @access  Public
 */
const createHabit = async (req, res) => {
  try {
    const { userId, name, month } = req.body;

    if (!userId || !name || !month) {
      return res.status(400).json({
        message: "Please provide userId, name, and month",
      });
    }

    const habit = new Habit({
      userId,
      name,
      month,
      completedDays: [],
    });

    await habit.save();
    res.status(201).json(habit);
  } catch (error) {
    res.status(400).json({
      message: "Error creating habit",
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle habit completion for a day
 * @route   PUT /api/habits/:id/toggle
 * @access  Public
 */
const toggleHabitDay = async (req, res) => {
  try {
    const { id } = req.params;
    const { day } = req.body;

    if (!day || day < 1 || day > 31) {
      return res.status(400).json({
        message: "Please provide a valid day (1-31)",
      });
    }

    const habit = await Habit.findById(id);

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const dayIndex = habit.completedDays.indexOf(day);

    if (dayIndex > -1) {
      // Day exists, remove it (uncheck)
      habit.completedDays.splice(dayIndex, 1);
    } else {
      // Day doesn't exist, add it (check)
      habit.completedDays.push(day);
      habit.completedDays.sort((a, b) => a - b);
    }

    await habit.save();
    res.status(200).json(habit);
  } catch (error) {
    res.status(400).json({
      message: "Error toggling habit day",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a habit
 * @route   DELETE /api/habits/:id
 * @access  Public
 */
const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await Habit.findByIdAndDelete(id);

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.status(200).json({ message: "Habit deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting habit",
      error: error.message,
    });
  }
};

/**
 * @desc    Update habit name
 * @route   PUT /api/habits/:id
 * @access  Public
 */
const updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Please provide a name" });
    }

    const habit = await Habit.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.status(200).json(habit);
  } catch (error) {
    res.status(400).json({
      message: "Error updating habit",
      error: error.message,
    });
  }
};

module.exports = {
  getHabits,
  createHabit,
  toggleHabitDay,
  deleteHabit,
  updateHabit,
};
