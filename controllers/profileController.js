const Profile = require("../models/Profile");

/**
 * @desc    Get or create user profile
 * @route   GET /api/profile/:userId
 * @access  Public
 */
const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.params.userId });

    if (!profile) {
      // Create default profile if doesn't exist
      profile = new Profile({
        userId: req.params.userId,
        email: (req.body && req.body.email) || "user@example.com",
      });
      await profile.save();
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/profile/:userId
 * @access  Public
 */
const updateProfile = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    const userId = decodeURIComponent(req.params.userId);

    console.log("Update profile request:", {
      userId,
      email,
      phoneNumber,
      hasFile: !!req.file,
    });

    let profile = await Profile.findOne({ userId });

    if (!profile) {
      profile = new Profile({ userId });
    }

    if (email !== undefined) profile.email = email;
    if (phoneNumber !== undefined) profile.phoneNumber = phoneNumber;

    // Handle file upload from multer
    if (req.file) {
      profile.profilePic = `/uploads/profiles/${req.file.filename}`;
      console.log("File uploaded:", req.file.filename);
    }

    await profile.save();
    console.log("Profile saved successfully");
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
};

/**
 * @desc    Send OTP to email for password reset
 * @route   POST /api/profile/send-otp
 * @access  Public
 */
const sendOTP = async (req, res) => {
  try {
    const { userId, email } = req.body;

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiry to 10 minutes from now
    profile.otpCode = otp;
    profile.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await profile.save();

    // In production, send email here
    console.log(`OTP for ${email}: ${otp}`);

    res.status(200).json({
      message: "OTP sent to email (check console in development)",
      otp: otp, // Remove this in production
    });
  } catch (error) {
    res.status(500).json({
      message: "Error sending OTP",
      error: error.message,
    });
  }
};

/**
 * @desc    Verify OTP and change password
 * @route   POST /api/profile/verify-otp
 * @access  Public
 */
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Check if OTP matches and hasn't expired
    if (profile.otpCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > profile.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Clear OTP after successful verification
    profile.otpCode = "";
    profile.otpExpiry = null;
    await profile.save();

    // In production, hash and update password in auth system
    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying OTP",
      error: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  sendOTP,
  verifyOTP,
};
