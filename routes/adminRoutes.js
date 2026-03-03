const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminProtect } = require("../middleware/adminMiddleware");
const {
  getOverview,
  getUsers,
  getUserDetail,
  toggleAdmin,
  deleteUser,
  getRecentActivity,
  getTopUsers,
} = require("../controllers/adminController");

// All admin routes require auth + admin role
router.use(protect, adminProtect);

router.get("/overview", getOverview);
router.get("/users", getUsers);
router.get("/users/:id", getUserDetail);
router.patch("/users/:id/toggle-admin", toggleAdmin);
router.delete("/users/:id", deleteUser);
router.get("/activity", getRecentActivity);
router.get("/top-users", getTopUsers);

module.exports = router;
