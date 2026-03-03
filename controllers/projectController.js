const Project = require("../models/Project");

// ─── Helpers ─────────────────────────────────────────────────────────────────

const recalcProgress = (project) => {
  if (project.autoProgress && project.features.length > 0) {
    const done = project.features.filter(
      (f) => f.status === "completed",
    ).length;
    project.progress = Math.round((done / project.features.length) * 100);
  }
};

// ─── Projects CRUD ───────────────────────────────────────────────────────────

/** GET /api/projects/:userId */
const getProjects = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, category, priority } = req.query;

    const query = { userId };
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const projects = await Project.find(query).sort({
      isPinned: -1,
      updatedAt: -1,
    });

    res.status(200).json(projects);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching projects", error: error.message });
  }
};

/** GET /api/projects/:userId/stats */
const getStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const all = await Project.find({ userId });

    const stats = {
      total: all.length,
      active: all.filter((p) => p.status === "active").length,
      completed: all.filter((p) => p.status === "completed").length,
      upcoming: all.filter((p) => p.status === "upcoming").length,
      planning: all.filter((p) => p.status === "planning").length,
      paused: all.filter((p) => p.status === "paused").length,
      totalFeatures: all.reduce((s, p) => s + p.features.length, 0),
      completedFeatures: all.reduce(
        (s, p) => s + p.features.filter((f) => f.status === "completed").length,
        0,
      ),
      overallProgress: all.length
        ? Math.round(
            all.reduce((s, p) => s + (p.progress || 0), 0) / all.length,
          )
        : 0,
    };

    res.status(200).json(stats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stats", error: error.message });
  }
};

/** POST /api/projects */
const createProject = async (req, res) => {
  try {
    const { userId, title } = req.body;
    if (!userId || !title)
      return res.status(400).json({ message: "userId and title are required" });

    const project = new Project(req.body);
    recalcProgress(project);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating project", error: error.message });
  }
};

/** PUT /api/projects/:id */
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    Object.assign(project, req.body);
    recalcProgress(project);

    if (req.body.status === "completed" && !project.completedAt) {
      project.completedAt = new Date();
    }

    await project.save();
    res.status(200).json(project);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating project", error: error.message });
  }
};

/** DELETE /api/projects/:id */
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting project", error: error.message });
  }
};

// ─── Features ─────────────────────────────────────────────────────────────────

/** POST /api/projects/:id/features */
const addFeature = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.features.push(req.body);
    recalcProgress(project);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error adding feature", error: error.message });
  }
};

/** PUT /api/projects/:id/features/:featureId */
const updateFeature = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const feature = project.features.id(req.params.featureId);
    if (!feature) return res.status(404).json({ message: "Feature not found" });

    // Track completion date
    if (req.body.status === "completed" && feature.status !== "completed") {
      req.body.completedAt = new Date();
    } else if (req.body.status && req.body.status !== "completed") {
      req.body.completedAt = null;
    }

    Object.assign(feature, req.body);
    recalcProgress(project);
    await project.save();
    res.status(200).json(project);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating feature", error: error.message });
  }
};

/** DELETE /api/projects/:id/features/:featureId */
const deleteFeature = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.features.pull({ _id: req.params.featureId });
    recalcProgress(project);
    await project.save();
    res.status(200).json(project);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting feature", error: error.message });
  }
};

// ─── Future Goals ─────────────────────────────────────────────────────────────

/** POST /api/projects/:id/future-goals */
const addFutureGoal = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.futureGoals.push(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error adding future goal", error: error.message });
  }
};

/** DELETE /api/projects/:id/future-goals/:goalId */
const deleteFutureGoal = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.futureGoals.pull({ _id: req.params.goalId });
    await project.save();
    res.status(200).json(project);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting future goal", error: error.message });
  }
};

// ─── Update Logs ──────────────────────────────────────────────────────────────

/** POST /api/projects/:id/logs */
const addLog = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.updateLogs.unshift(req.body); // newest first
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: "Error adding log", error: error.message });
  }
};

/** DELETE /api/projects/:id/logs/:logId */
const deleteLog = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.updateLogs.pull({ _id: req.params.logId });
    await project.save();
    res.status(200).json(project);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting log", error: error.message });
  }
};

// ─── Tech Stack ───────────────────────────────────────────────────────────────

/** POST /api/projects/:id/tech-stack */
const addTech = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.techStack.push(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error adding tech", error: error.message });
  }
};

/** DELETE /api/projects/:id/tech-stack/:techId */
const deleteTech = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.techStack.pull({ _id: req.params.techId });
    await project.save();
    res.status(200).json(project);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting tech", error: error.message });
  }
};

module.exports = {
  getProjects,
  getStats,
  createProject,
  updateProject,
  deleteProject,
  addFeature,
  updateFeature,
  deleteFeature,
  addFutureGoal,
  deleteFutureGoal,
  addLog,
  deleteLog,
  addTech,
  deleteTech,
};
