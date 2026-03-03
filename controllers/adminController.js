const User = require("../models/User");
const Todo = require("../models/Todo");
const Diary = require("../models/Diary");
const Habit = require("../models/Habit");
const Study = require("../models/Study");
const WeeklyGoal = require("../models/WeeklyGoal");
const ImprovementEntry = require("../models/ImprovementEntry");
const Research = require("../models/Research");
const LifeGoal = require("../models/LifeGoal");
const Rating = require("../models/Rating");
const Profile = require("../models/Profile");
const Notification = require("../models/Notification");

/**
 * Get per-user activity counts.
 * Most models key by user.email (string), Todo keys by user._id (ObjectId).
 */
const getUserCounts = async (user) => {
  const email = user.email;
  const oid = user._id;

  const [
    todos,
    diary,
    habits,
    weeklyGoals,
    improvement,
    research,
    lifeGoals,
    ratings,
  ] = await Promise.all([
    Todo.countDocuments({ user: oid }),
    Diary.countDocuments({ userId: email }),
    Habit.countDocuments({ userId: email }),
    WeeklyGoal.countDocuments({ userId: email }),
    ImprovementEntry.countDocuments({ userId: email }),
    Research.countDocuments({ userId: email }),
    LifeGoal.countDocuments({ userId: email }),
    Rating.countDocuments({ userId: email }),
  ]);

  return {
    todos,
    diary,
    habits,
    weeklyGoals,
    improvement,
    research,
    lifeGoals,
    ratings,
  };
};

const calcScore = (c) =>
  c.todos * 2 +
  c.diary * 2 +
  c.habits +
  c.weeklyGoals +
  c.improvement * 3 +
  c.research * 2 +
  c.lifeGoals * 3 +
  c.ratings;

// ───────────────────────────────────────────────────────────
// GET /api/admin/overview
// ───────────────────────────────────────────────────────────
const getOverview = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      adminCount,
      totalTodos,
      completedTodos,
      totalDiary,
      totalHabits,
      totalStudy,
      totalWeeklyGoals,
      totalImprovement,
      totalResearch,
      totalLifeGoals,
      totalRatings,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      User.countDocuments({ createdAt: { $gte: startOfWeek } }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ isAdmin: true }),
      Todo.countDocuments(),
      Todo.countDocuments({ completed: true }),
      Diary.countDocuments(),
      Habit.countDocuments(),
      Study.countDocuments(),
      WeeklyGoal.countDocuments(),
      ImprovementEntry.countDocuments(),
      Research.countDocuments(),
      LifeGoal.countDocuments(),
      Rating.countDocuments(),
    ]);

    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      users: {
        total: totalUsers,
        admins: adminCount,
        regular: totalUsers - adminCount,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
      },
      content: {
        todos: {
          total: totalTodos,
          completed: completedTodos,
          pending: totalTodos - completedTodos,
        },
        diary: totalDiary,
        habits: totalHabits,
        study: totalStudy,
        weeklyGoals: totalWeeklyGoals,
        improvement: totalImprovement,
        research: totalResearch,
        lifeGoals: totalLifeGoals,
        ratings: totalRatings,
        totalContent:
          totalTodos +
          totalDiary +
          totalHabits +
          totalStudy +
          totalWeeklyGoals +
          totalImprovement +
          totalResearch +
          totalLifeGoals +
          totalRatings,
      },
      userGrowth: userGrowth.map((g) => ({
        label: `${g._id.year}-${String(g._id.month).padStart(2, "0")}`,
        count: g.count,
      })),
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ───────────────────────────────────────────────────────────
// GET /api/admin/users?page=1&limit=20&search=&sortBy=createdAt
// ───────────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ [sortBy]: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    const enriched = await Promise.all(
      users.map(async (u) => {
        const counts = await getUserCounts(u);
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          isAdmin: u.isAdmin,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          activityScore: calcScore(counts),
          counts,
        };
      }),
    );

    res.json({ users: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Admin getUsers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ───────────────────────────────────────────────────────────
// GET /api/admin/users/:id — full user detail + recent data
// ───────────────────────────────────────────────────────────
const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const email = user.email;
    const oid = user._id;

    const [
      todos,
      diary,
      habits,
      weeklyGoals,
      improvement,
      research,
      lifeGoals,
      ratings,
      profile,
    ] = await Promise.all([
      Todo.find({ user: oid }).sort({ createdAt: -1 }).limit(15),
      Diary.find({ userId: email }).sort({ createdAt: -1 }).limit(15),
      Habit.find({ userId: email }).sort({ createdAt: -1 }).limit(15),
      WeeklyGoal.find({ userId: email }).sort({ createdAt: -1 }).limit(15),
      ImprovementEntry.find({ userId: email })
        .sort({ createdAt: -1 })
        .limit(15),
      Research.find({ userId: email }).sort({ createdAt: -1 }).limit(15),
      LifeGoal.find({ userId: email }).sort({ createdAt: -1 }).limit(15),
      Rating.find({ userId: email }).sort({ createdAt: -1 }).limit(15),
      Profile.findOne({ userId: email }),
    ]);

    const counts = await getUserCounts(user);

    res.json({
      user,
      profile,
      counts,
      todos,
      diary,
      habits,
      weeklyGoals,
      improvement,
      research,
      lifeGoals,
      ratings,
    });
  } catch (error) {
    console.error("Admin getUserDetail error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ───────────────────────────────────────────────────────────
// PATCH /api/admin/users/:id/toggle-admin
// ───────────────────────────────────────────────────────────
const toggleAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot change your own admin status" });
    }
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error("Admin toggleAdmin error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ───────────────────────────────────────────────────────────
// DELETE /api/admin/users/:id — delete user + all their data
// ───────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    const email = user.email;
    const oid = user._id;

    await Promise.all([
      Todo.deleteMany({ user: oid }),
      Diary.deleteMany({ userId: email }),
      Habit.deleteMany({ userId: email }),
      WeeklyGoal.deleteMany({ userId: email }),
      ImprovementEntry.deleteMany({ userId: email }),
      Research.deleteMany({ userId: email }),
      LifeGoal.deleteMany({ userId: email }),
      Rating.deleteMany({ userId: email }),
      Profile.deleteMany({ userId: email }),
      // Remove user from notification readBy arrays (but keep global notifications)
      Notification.updateMany(
        { "readBy.userId": oid },
        { $pull: { readBy: { userId: oid } } },
      ),
      User.findByIdAndDelete(oid),
    ]);

    res.json({
      message: `User "${user.name}" and all associated data deleted successfully`,
    });
  } catch (error) {
    console.error("Admin deleteUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ───────────────────────────────────────────────────────────
// GET /api/admin/activity — recent activity feed
// ───────────────────────────────────────────────────────────
const getRecentActivity = async (req, res) => {
  try {
    const limit = 25;

    const [
      todos,
      diary,
      habits,
      weeklyGoals,
      improvement,
      research,
      lifeGoals,
      ratings,
    ] = await Promise.all([
      Todo.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("user", "name email"),
      Diary.find().sort({ createdAt: -1 }).limit(limit),
      Habit.find().sort({ createdAt: -1 }).limit(limit),
      WeeklyGoal.find().sort({ createdAt: -1 }).limit(limit),
      ImprovementEntry.find().sort({ createdAt: -1 }).limit(limit),
      Research.find().sort({ createdAt: -1 }).limit(limit),
      LifeGoal.find().sort({ createdAt: -1 }).limit(limit),
      Rating.find().sort({ createdAt: -1 }).limit(limit),
    ]);

    const activities = [
      ...todos.map((t) => ({
        type: "todo",
        color: "#6366f1",
        label: t.title || "Todo",
        userId: t.user?.email || "?",
        userName: t.user?.name || t.user?.email || "?",
        createdAt: t.createdAt,
        extra: t.completed ? "completed" : "pending",
      })),
      ...diary.map((d) => ({
        type: "diary",
        color: "#f59e0b",
        label: d.title || "Diary Entry",
        userId: d.userId,
        userName: d.userId,
        createdAt: d.createdAt,
      })),
      ...habits.map((h) => ({
        type: "habit",
        color: "#10b981",
        label: h.name,
        userId: h.userId,
        userName: h.userId,
        createdAt: h.createdAt,
        extra: h.month,
      })),
      ...weeklyGoals.map((w) => ({
        type: "weeklyGoal",
        color: "#3b82f6",
        label: w.title || "Weekly Goal",
        userId: w.userId,
        userName: w.userId,
        createdAt: w.createdAt,
      })),
      ...improvement.map((i) => ({
        type: "improvement",
        color: "#8b5cf6",
        label: `Improvement — ${i.date || ""}`,
        userId: i.userId,
        userName: i.userId,
        createdAt: i.createdAt,
      })),
      ...research.map((r) => ({
        type: "research",
        color: "#06b6d4",
        label: r.title,
        userId: r.userId,
        userName: r.userId,
        createdAt: r.createdAt,
        extra: r.category,
      })),
      ...lifeGoals.map((l) => ({
        type: "lifeGoal",
        color: "#ec4899",
        label: l.title,
        userId: l.userId,
        userName: l.userId,
        createdAt: l.createdAt,
        extra: l.status,
      })),
      ...ratings.map((r) => ({
        type: "rating",
        color: "#f97316",
        label: `${r.category} — ${r.score}/10`,
        userId: r.userId,
        userName: r.userId,
        createdAt: r.createdAt,
      })),
    ]
      .filter((a) => a.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 60);

    res.json({ activities });
  } catch (error) {
    console.error("Admin getRecentActivity error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ───────────────────────────────────────────────────────────
// GET /api/admin/top-users — top 10 most active users
// ───────────────────────────────────────────────────────────
const getTopUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const scored = await Promise.all(
      users.map(async (u) => {
        const counts = await getUserCounts(u);
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          isAdmin: u.isAdmin,
          createdAt: u.createdAt,
          score: calcScore(counts),
          counts,
        };
      }),
    );
    scored.sort((a, b) => b.score - a.score);
    res.json({ users: scored.slice(0, 10) });
  } catch (error) {
    console.error("Admin getTopUsers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getOverview,
  getUsers,
  getUserDetail,
  toggleAdmin,
  deleteUser,
  getRecentActivity,
  getTopUsers,
};
