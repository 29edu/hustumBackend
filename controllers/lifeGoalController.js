const LifeGoal = require("../models/LifeGoal");

// ─── Goals CRUD ─────────────────────────────────────────────────────────────

/** GET /api/life-goals/:userId */
const getGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, category, status, year, month, isArchived } = req.query;

    const query = { userId };
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (year) query.year = Number(year);
    if (month) query.month = Number(month);
    query.isArchived = isArchived === "true" ? true : { $ne: true };

    const goals = await LifeGoal.find(query).sort({
      isPinned: -1,
      priority: 1,
      createdAt: -1,
    });

    res.status(200).json(goals);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching goals", error: error.message });
  }
};

/** POST /api/life-goals */
const createGoal = async (req, res) => {
  try {
    const { userId, title } = req.body;
    if (!userId || !title) {
      return res.status(400).json({ message: "userId and title are required" });
    }
    const goal = new LifeGoal(req.body);
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating goal", error: error.message });
  }
};

/** PUT /api/life-goals/:id */
const updateGoal = async (req, res) => {
  try {
    const goal = await LifeGoal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    // Auto-set effortStartDate when effort flag turns on
    if (req.body.effortStarted && !goal.effortStartDate) {
      goal.effortStartDate = new Date();
      await goal.save();
    }

    res.status(200).json(goal);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating goal", error: error.message });
  }
};

/** DELETE /api/life-goals/:id */
const deleteGoal = async (req, res) => {
  try {
    const goal = await LifeGoal.findByIdAndDelete(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting goal", error: error.message });
  }
};

// ─── Steps ───────────────────────────────────────────────────────────────────

/** POST /api/life-goals/:id/steps */
const addStep = async (req, res) => {
  try {
    const goal = await LifeGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    const { title, notes } = req.body;
    if (!title)
      return res.status(400).json({ message: "Step title is required" });
    goal.steps.push({ title, notes: notes || "", order: goal.steps.length });
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error adding step", error: error.message });
  }
};

/** PUT /api/life-goals/:id/steps/:stepId */
const updateStep = async (req, res) => {
  try {
    const goal = await LifeGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    const step = goal.steps.id(req.params.stepId);
    if (!step) return res.status(404).json({ message: "Step not found" });
    Object.assign(step, req.body);
    await goal.save();
    res.status(200).json(goal);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating step", error: error.message });
  }
};

/** PUT /api/life-goals/:id/steps/:stepId/toggle */
const toggleStep = async (req, res) => {
  try {
    const goal = await LifeGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    const step = goal.steps.id(req.params.stepId);
    if (!step) return res.status(404).json({ message: "Step not found" });
    step.completed = !step.completed;
    step.completedAt = step.completed ? new Date() : null;

    // Auto-recalculate progress from steps
    const total = goal.steps.length;
    const done = goal.steps.filter((s) => s.completed).length;
    goal.progress =
      total > 0 ? Math.round((done / total) * 100) : goal.progress;

    await goal.save();
    res.status(200).json(goal);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error toggling step", error: error.message });
  }
};

/** DELETE /api/life-goals/:id/steps/:stepId */
const deleteStep = async (req, res) => {
  try {
    const goal = await LifeGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    goal.steps.pull({ _id: req.params.stepId });
    await goal.save();
    res.status(200).json(goal);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting step", error: error.message });
  }
};

// ─── Milestones ──────────────────────────────────────────────────────────────

/** POST /api/life-goals/:id/milestones */
const addMilestone = async (req, res) => {
  try {
    const goal = await LifeGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    const { title, targetDate } = req.body;
    if (!title)
      return res.status(400).json({ message: "Milestone title is required" });
    goal.milestones.push({ title, targetDate: targetDate || null });
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error adding milestone", error: error.message });
  }
};

/** PUT /api/life-goals/:id/milestones/:milestoneId/toggle */
const toggleMilestone = async (req, res) => {
  try {
    const goal = await LifeGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    const ms = goal.milestones.id(req.params.milestoneId);
    if (!ms) return res.status(404).json({ message: "Milestone not found" });
    ms.achieved = !ms.achieved;
    ms.achievedAt = ms.achieved ? new Date() : null;
    await goal.save();
    res.status(200).json(goal);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error toggling milestone", error: error.message });
  }
};

/** DELETE /api/life-goals/:id/milestones/:milestoneId */
const deleteMilestone = async (req, res) => {
  try {
    const goal = await LifeGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    goal.milestones.pull({ _id: req.params.milestoneId });
    await goal.save();
    res.status(200).json(goal);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting milestone", error: error.message });
  }
};

// ─── Reflections ─────────────────────────────────────────────────────────────

/** POST /api/life-goals/:id/reflections */
const addReflection = async (req, res) => {
  try {
    const goal = await LifeGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    const { text, mood } = req.body;
    if (!text)
      return res.status(400).json({ message: "Reflection text is required" });
    goal.reflections.unshift({ text, mood: mood || "neutral" });
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error adding reflection", error: error.message });
  }
};

/** DELETE /api/life-goals/:id/reflections/:reflectionId */
const deleteReflection = async (req, res) => {
  try {
    const goal = await LifeGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    goal.reflections.pull({ _id: req.params.reflectionId });
    await goal.save();
    res.status(200).json(goal);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting reflection", error: error.message });
  }
};

// ─── Stats ───────────────────────────────────────────────────────────────────

/** GET /api/life-goals/:userId/stats */
const getStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const goals = await LifeGoal.find({ userId, isArchived: { $ne: true } });

    const stats = {
      total: goals.length,
      byStatus: {},
      byCategory: {},
      byType: {},
      avgProgress: 0,
      effortStarted: goals.filter((g) => g.effortStarted).length,
      completed: goals.filter((g) => g.status === "completed").length,
    };

    goals.forEach((g) => {
      stats.byStatus[g.status] = (stats.byStatus[g.status] || 0) + 1;
      stats.byCategory[g.category] = (stats.byCategory[g.category] || 0) + 1;
      stats.byType[g.type] = (stats.byType[g.type] || 0) + 1;
    });

    stats.avgProgress =
      goals.length > 0
        ? Math.round(
            goals.reduce((sum, g) => sum + g.progress, 0) / goals.length,
          )
        : 0;

    res.status(200).json(stats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stats", error: error.message });
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addStep,
  updateStep,
  toggleStep,
  deleteStep,
  addMilestone,
  toggleMilestone,
  deleteMilestone,
  addReflection,
  deleteReflection,
  getStats,
};
