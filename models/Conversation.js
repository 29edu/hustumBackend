const mongoose = require("mongoose");

// A conversation between exactly two participants
const conversationSchema = new mongoose.Schema(
  {
    // Sorted array of two user _id strings for consistent lookup
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Compound index so we can quickly find the conversation between two users
conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
