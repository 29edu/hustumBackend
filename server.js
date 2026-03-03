const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");
const diaryRoutes = require("./routes/diaryRoutes");
const profileRoutes = require("./routes/profileRoutes");
const habitRoutes = require("./routes/habitRoutes");
const studyRoutes = require("./routes/studyRoutes");
const weeklyGoalRoutes = require("./routes/weeklyGoalRoutes");
const subjectTopicsRoutes = require("./routes/subjectTopicsRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const improvementRoutes = require("./routes/improvementRoutes");
const researchRoutes = require("./routes/researchRoutes");
const lifeGoalRoutes = require("./routes/lifeGoalRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const projectRoutes = require("./routes/projectRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const chatRoutes = require("./routes/chatRoutes");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const JWT_SECRET = process.env.JWT_SECRET || "edison_secret_key_2026";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(requestLogger);

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/studies", studyRoutes);
app.use("/api/weekly-goals", weeklyGoalRoutes);
app.use("/api/subject-topics", subjectTopicsRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/improvement", improvementRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/life-goals", lifeGoalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/chat", chatRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Edison Todo API is running!" });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// ── Socket.io real-time chat ───────────────────────────────────
// Map userId -> socketId for online presence
const onlineUsers = new Map();

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return next(new Error("User not found"));
    socket.user = user;
    next();
  } catch {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.user._id.toString();
  onlineUsers.set(userId, socket.id);

  // Join a personal room so we can send directed messages
  socket.join(userId);

  // Join a conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
  });

  // Send a message
  socket.on("send_message", async (data) => {
    try {
      const { conversationId, content } = data;
      if (!conversationId || !content?.trim()) return;

      // Verify sender is a participant
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.user._id,
      });
      if (!conversation) return;

      // Persist the message
      const message = await Message.create({
        conversationId,
        sender: socket.user._id,
        content: content.trim(),
      });

      const populated = await message.populate("sender", "name chatId");

      // Update conversation's last message
      conversation.lastMessage = content.trim();
      conversation.lastMessageAt = new Date();
      await conversation.save();

      // Broadcast to everyone in the conversation room (includes sender)
      io.to(conversationId).emit("new_message", populated);

      // Also notify the other participant even if they haven't joined the room
      conversation.participants.forEach((participantId) => {
        const pid = participantId.toString();
        if (pid !== userId) {
          io.to(pid).emit("conversation_updated", {
            conversationId,
            lastMessage: content.trim(),
            lastMessageAt: conversation.lastMessageAt,
          });
        }
      });
    } catch (err) {
      console.error("send_message error:", err);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
