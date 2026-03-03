const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  findUserByChatId,
  getOrCreateConversation,
  getConversations,
  getMessages,
  getMyChatId,
} = require("../controllers/chatController");

router.get("/my-chat-id", protect, getMyChatId);
router.get("/user/:chatId", protect, findUserByChatId);
router.post("/conversation", protect, getOrCreateConversation);
router.get("/conversations", protect, getConversations);
router.get("/messages/:conversationId", protect, getMessages);

module.exports = router;
