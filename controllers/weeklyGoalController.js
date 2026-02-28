const WeeklyGoal = require("../models/WeeklyGoal");

/**
 * @desc    Get weekly goals for a user, optionally filtered by week range
 * @route   GET /api/weekly-goals/:userId
 * @access  Public
 */
const getWeeklyGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    const { weekStart, weekEnd } = req.query;

    const query = { userId };

    if (weekStart && weekEnd) {
      query.weekStart = { $gte: new Date(weekStart) };
      query.weekEnd = { $lte: new Date(weekEnd) };
    }

    const goals = await WeeklyGoal.find(query).sort({
      weekStart: 1,
      createdAt: 1,
    });
    res.status(200).json(goals);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching weekly goals", error: error.message });
  }
};

/**
 * @desc    Create a new weekly goal
 * @route   POST /api/weekly-goals
 * @access  Public
 */
const createWeeklyGoal = async (req, res) => {
  try {
    const { userId, weekStart, weekEnd, subject, topics, color } = req.body;

    if (!userId || !weekStart || !weekEnd || !subject) {
      return res
        .status(400)
        .json({
          message: "userId, weekStart, weekEnd, and subject are required",
        });
    }

    const goal = new WeeklyGoal({
      userId,
      weekStart: new Date(weekStart),
      weekEnd: new Date(weekEnd),
      subject,
      topics: topics || [],
      color: color || "#3B82F6",
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating weekly goal", error: error.message });
  }
};

/**
 * @desc    Update a weekly goal (subject, color, topics list)
 * @route   PUT /api/weekly-goals/:id
 * @access  Public
 */
const updateWeeklyGoal = async (req, res) => {
  try {
    const goal = await WeeklyGoal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!goal)
      return res.status(404).json({ message: "Weekly goal not found" });
    res.status(200).json(goal);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating weekly goal", error: error.message });
  }
};

/**
 * @desc    Toggle a topic's completed status
 * @route   PUT /api/weekly-goals/:id/topics/:topicId/toggle
 * @access  Public
 */
const toggleTopic = async (req, res) => {
  try {
    const goal = await WeeklyGoal.findById(req.params.id);
    if (!goal)
      return res.status(404).json({ message: "Weekly goal not found" });

    const topic = goal.topics.id(req.params.topicId);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    topic.completed = !topic.completed;
    await goal.save();
    res.status(200).json(goal);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error toggling topic", error: error.message });
  }
};

/**
 * @desc    Add a topic to a weekly goal
 * @route   POST /api/weekly-goals/:id/topics
 * @access  Public
 */
const addTopic = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title)
      return res.status(400).json({ message: "Topic title is required" });

    const goal = await WeeklyGoal.findById(req.params.id);
    if (!goal)
      return res.status(404).json({ message: "Weekly goal not found" });

    goal.topics.push({ title, completed: false });
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error adding topic", error: error.message });
  }
};

/**
 * @desc    Delete a topic from a weekly goal
 * @route   DELETE /api/weekly-goals/:id/topics/:topicId
 * @access  Public
 */
const deleteTopic = async (req, res) => {
  try {
    const goal = await WeeklyGoal.findById(req.params.id);
    if (!goal)
      return res.status(404).json({ message: "Weekly goal not found" });

    goal.topics = goal.topics.filter(
      (t) => t._id.toString() !== req.params.topicId,
    );
    await goal.save();
    res.status(200).json(goal);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting topic", error: error.message });
  }
};

/**
 * @desc    Delete a weekly goal
 * @route   DELETE /api/weekly-goals/:id
 * @access  Public
 */
const deleteWeeklyGoal = async (req, res) => {
  try {
    const goal = await WeeklyGoal.findByIdAndDelete(req.params.id);
    if (!goal)
      return res.status(404).json({ message: "Weekly goal not found" });
    res.status(200).json({ message: "Weekly goal deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting weekly goal", error: error.message });
  }
};

module.exports = {
  getWeeklyGoals,
  createWeeklyGoal,
  updateWeeklyGoal,
  toggleTopic,
  addTopic,
  deleteTopic,
  deleteWeeklyGoal,
};
