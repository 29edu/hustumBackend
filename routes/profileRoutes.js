const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  getProfile,
  updateProfile,
  sendOTP,
  verifyOTP,
} = require("../controllers/profileController");

// Ensure upload directory exists
const uploadDir = path.join(
  __dirname,
  "../../frontend/public/uploads/profiles/"
);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Multer destination:", uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename =
      "profile-" + uniqueSuffix + path.extname(file.originalname);
    console.log("Multer filename:", filename);
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("File filter check:", {
    mimetype: file.mimetype,
    originalname: file.originalname,
  });

  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (
    allowedMimes.includes(file.mimetype) ||
    file.mimetype.startsWith("image/")
  ) {
    console.log("File accepted");
    cb(null, true);
  } else {
    console.log("File rejected - invalid type");
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Routes
router.get("/:userId", getProfile);
router.put(
  "/:userId",
  upload.single("profilePic"),
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res
        .status(400)
        .json({ message: "File upload error", error: err.message });
    } else if (err) {
      console.error("Unknown upload error:", err);
      return res
        .status(500)
        .json({ message: "Unknown error", error: err.message });
    }
    next();
  },
  updateProfile
);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

module.exports = router;
