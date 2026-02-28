const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    otpCode: {
      type: String,
      default: "",
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

profileSchema.index({ userId: 1 });

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
