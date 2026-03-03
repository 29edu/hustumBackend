const Notification = require("../models/Notification");

/**
 * @desc    Get all active notifications (for users)
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
  try {
    const now = new Date();
    const notifications = await Notification.find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    }).sort({ createdAt: -1 });

    // Attach isRead per requesting user
    const result = notifications.map((n) => {
      const isRead = n.readBy.some(
        (r) => r.userId.toString() === req.user._id.toString(),
      );
      return {
        _id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        priority: n.priority,
        emoji: n.emoji,
        isRead,
        isPinned: n.pinnedUntil && n.pinnedUntil > now,
        pinnedUntil: n.pinnedUntil,
        expiresAt: n.expiresAt,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      };
    });

    // Sort: pinned first, then by date
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const unreadCount = result.filter((n) => !n.isRead).length;

    res.status(200).json({ notifications: result, unreadCount });
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const alreadyRead = notification.readBy.some(
      (r) => r.userId.toString() === req.user._id.toString(),
    );

    if (!alreadyRead) {
      notification.readBy.push({ userId: req.user._id });
      await notification.save();
    }

    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    console.error("markAsRead error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Mark ALL notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res) => {
  try {
    const now = new Date();
    const notifications = await Notification.find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      "readBy.userId": { $ne: req.user._id },
    });

    await Promise.all(
      notifications.map((n) => {
        n.readBy.push({ userId: req.user._id });
        return n.save();
      }),
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("markAllAsRead error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ─── Admin-only routes ────────────────────────────── */

/**
 * @desc    Create a notification (admin only)
 * @route   POST /api/notifications
 * @access  Admin
 */
const createNotification = async (req, res) => {
  try {
    const { title, message, type, priority, emoji, expiresAt, pinnedUntil } =
      req.body;

    if (!title || !message) {
      return res
        .status(400)
        .json({ message: "Title and message are required" });
    }

    const notification = await Notification.create({
      title,
      message,
      type: type || "info",
      priority: priority || "normal",
      emoji: emoji || "",
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      pinnedUntil: pinnedUntil ? new Date(pinnedUntil) : null,
    });

    res.status(201).json({ notification, message: "Notification created" });
  } catch (error) {
    console.error("createNotification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update a notification (admin only)
 * @route   PUT /api/notifications/:id
 * @access  Admin
 */
const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ notification });
  } catch (error) {
    console.error("updateNotification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Delete (deactivate) a notification (admin only)
 * @route   DELETE /api/notifications/:id
 * @access  Admin
 */
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ message: "Notification removed" });
  } catch (error) {
    console.error("deleteNotification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get all notifications including inactive (admin only)
 * @route   GET /api/notifications/admin
 * @access  Admin
 */
const getAllNotificationsAdmin = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json({ notifications });
  } catch (error) {
    console.error("getAllNotificationsAdmin error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  updateNotification,
  deleteNotification,
  getAllNotificationsAdmin,
};
