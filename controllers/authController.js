const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendOtpEmail } = require("../utils/sendEmail");

const JWT_SECRET = process.env.JWT_SECRET || "edison_secret_key_2026";
const JWT_EXPIRES = "30d";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const isAdminEmail = (email) =>
  ADMIN_EMAILS.length > 0 && ADMIN_EMAILS.includes(email?.toLowerCase());

const generateToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin || isAdminEmail(user.email),
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin || isAdminEmail(user.email),
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

/**
 * @desc    Get current user (verify token)
 * @route   GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * @desc    Send OTP to email for password reset
 * @route   POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error(
        "Forgot password: EMAIL_USER or EMAIL_PASS not set in .env",
      );
      return res
        .status(503)
        .json({
          message:
            "Email service is not configured on the server. Please contact the admin.",
        });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always respond success to prevent email enumeration
    if (!user) {
      return res
        .status(200)
        .json({ message: "If that email exists, an OTP has been sent." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendOtpEmail(user.email, otp, user.name);

    res
      .status(200)
      .json({ message: "OTP sent to your email. It expires in 10 minutes." });
  } catch (error) {
    console.error("Forgot password error:", error);
    const msg =
      error.code === "EAUTH"
        ? "Email authentication failed. Please check server email credentials."
        : "Failed to send OTP. Please try again.";
    res.status(500).json({ message: msg });
  }
};

/**
 * @desc    Verify OTP and reset password
 * @route   POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP. Please request a new one." });
    }

    if (new Date() > user.resetOtpExpiry) {
      user.resetOtp = null;
      user.resetOtpExpiry = null;
      await user.save();
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    const isMatch = await bcrypt.compare(otp, user.resetOtp);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Incorrect OTP. Please try again." });
    }

    // Reset password — pre-save hook will hash it
    user.password = newPassword;
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res
      .status(200)
      .json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error during password reset" });
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
