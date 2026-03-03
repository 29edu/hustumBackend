const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminProtect } = require("../middleware/adminMiddleware");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  updateNotification,
  deleteNotification,
  getAllNotificationsAdmin,
} = require("../controllers/notificationController");

// User routes (protected)
router.get("/", protect, getNotifications);
router.patch("/read-all", protect, markAllAsRead);
router.patch("/:id/read", protect, markAsRead);

// Admin routes
router.get("/admin", protect, adminProtect, getAllNotificationsAdmin);
router.post("/", protect, adminProtect, createNotification);
router.put("/:id", protect, adminProtect, updateNotification);
router.delete("/:id", protect, adminProtect, deleteNotification);

module.exports = router;
