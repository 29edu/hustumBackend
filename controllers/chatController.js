const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

/**
 * @desc  Find a user by their chatId
 * @route GET /api/chat/user/:chatId
 */
const findUserByChatId = async (req, res) => {
  try {
    const { chatId } = req.params;
    const user = await User.findOne({ chatId: chatId.toUpperCase() }).select(
      "name chatId _id",
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found with that Chat ID" });
    }
    // Prevent connecting to yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot chat with yourself" });
    }
    res.json(user);
  } catch (error) {
    console.error("findUserByChatId error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc  Get or create a conversation between two users
 * @route POST /api/chat/conversation
 */
const getOrCreateConversation = async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const myId = req.user._id;

    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId is required" });
    }

    if (myId.toString() === otherUserId.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot create conversation with yourself" });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [myId, otherUserId] },
    }).populate("participants", "name chatId");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [myId, otherUserId],
      });
      conversation = await conversation.populate("participants", "name chatId");
    }

    res.json(conversation);
  } catch (error) {
    console.error("getOrCreateConversation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc  Get all conversations for the current user
 * @route GET /api/chat/conversations
 */
const getConversations = async (req, res) => {
  try {
    const myId = req.user._id;
    const conversations = await Conversation.find({ participants: myId })
      .populate("participants", "name chatId")
      .sort({ lastMessageAt: -1 });
    res.json(conversations);
  } catch (error) {
    console.error("getConversations error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc  Get messages for a conversation
 * @route GET /api/chat/messages/:conversationId
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const myId = req.user._id;

    // Verify the user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: myId,
    });
    if (!conversation) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const messages = await Message.find({ conversationId })
      .populate("sender", "name chatId")
      .sort({ createdAt: 1 })
      .limit(200);

    // Mark messages as read
    await Message.updateMany(
      { conversationId, sender: { $ne: myId }, read: false },
      { read: true },
    );

    res.json(messages);
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc  Get current user's chatId (auto-assigns one to legacy accounts that lack it)
 * @route GET /api/chat/my-chat-id
 */
const getMyChatId = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select("chatId");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Legacy accounts created before the chatId field was added
    if (!user.chatId) {
      const crypto = require("crypto");
      // Retry until we find a unique value (extremely rare to collide)
      let assigned = false;
      let attempts = 0;
      while (!assigned && attempts < 10) {
        const candidate = crypto.randomBytes(4).toString("hex").toUpperCase();
        const result = await User.updateOne(
          {
            _id: user._id,
            $or: [{ chatId: { $exists: false } }, { chatId: null }],
          },
          { $set: { chatId: candidate } },
        );
        if (result.modifiedCount > 0) {
          user.chatId = candidate;
          assigned = true;
        } else {
          // Another request already set it — re-fetch
          user = await User.findById(req.user._id).select("chatId");
          if (user.chatId) assigned = true;
        }
        attempts++;
      }
    }

    res.json({ chatId: user.chatId });
  } catch (error) {
    console.error("getMyChatId error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  findUserByChatId,
  getOrCreateConversation,
  getConversations,
  getMessages,
  getMyChatId,
};
