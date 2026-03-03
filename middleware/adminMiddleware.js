/**
 * Admin middleware — checks if the logged-in user is an admin.
 * Users are flagged as admin via the `isAdmin` field on the User model,
 * OR by matching a hardcoded admin email stored in ADMIN_EMAILS env var.
 *
 * Usage: chain after `protect` middleware.
 */

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const adminProtect = (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const emailIsAdmin =
    ADMIN_EMAILS.length > 0 && ADMIN_EMAILS.includes(user.email?.toLowerCase());

  if (user.isAdmin || emailIsAdmin) {
    return next();
  }

  return res.status(403).json({ message: "Admin access required" });
};

module.exports = { adminProtect };
