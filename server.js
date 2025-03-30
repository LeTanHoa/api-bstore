require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const Product = require("./models/Product");
const sampleProducts = require("./data/sampleProducts");
const app = express();
const http = require("http");
const socketIO = require("socket.io");
const Message = require("./models/Message");
const User = require("./models/User");

// Middleware
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const allowedOrigins = ["http://localhost:3000"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        console.log("CORS blocked request from origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use("/uploads", express.static("uploads"));

// Tạo server và cấu hình Socket.IO
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
console.log("Socket.IO initialized with CORS config:", {
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
});

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Kết nối MongoDB thành công!");
    // await Product.insertMany(sampleProducts);
    // console.log("Dữ liệu mẫu đã được thêm vào!");
  })
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err));

// Routes
const examRoutes = require("./routes/examRoutes");
const studentRoutes = require("./routes/studentRoutes");
const tournamentRoutes = require("./routes/tournamentRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const blogRoutes = require("./routes/blogRoutes");
const paymentMomoRoutes = require("./routes/paymentMomoRoutes");
const flashSaleRoutes = require("./routes/flashSaleRoutes");
const messageRoutes = require("./routes/messageRoutes");
const emailRoutes = require("./routes/emailRoutes");

app.use("/api/exams", examRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/payments", paymentMomoRoutes);
app.use("/api/sales", flashSaleRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/emails", emailRoutes);

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinChat", async ({ userId }) => {
    console.log("joinChat event received with userId:", userId);
    try {
      if (!userId) return socket.emit("error", "User ID is required");
      const user = await User.findById(userId);
      if (!user) return socket.emit("error", "User not found");

      const room = user.role === "admin" ? "adminRoom" : userId;
      socket.join(room);
      console.log(`${user.username} (role: ${user.role}) joined room: ${room}`);
    } catch (error) {
      console.error("Error in joinChat:", error.message);
      socket.emit("error", "Server error in joinChat");
    }
  });

  socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
    try {
      const sender = await User.findById(senderId);
      if (!sender) return socket.emit("error", "Sender not found");

      if (sender.role === "user") {
        const admin = await User.findOne({ role: "admin" });
        if (!admin) return socket.emit("error", "No admin available");
        receiverId = admin._id;
      } else if (sender.role === "admin") {
        if (!receiverId) return socket.emit("error", "Receiver ID is required");
        const receiver = await User.findById(receiverId);
        if (!receiver) return socket.emit("error", "Receiver not found");
      }

      // Đánh dấu tất cả tin nhắn từ receiverId đến senderId là đã đọc
      await Message.updateMany(
        { sender: receiverId, receiver: senderId, isRead: false },
        { isRead: true }
      );
      console.log(`Marked messages from ${receiverId} to ${senderId} as read`);

      // Tạo và lưu tin nhắn mới
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
      });
      await message.save();

      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "username")
        .populate("receiver", "username");
      console.log("Message saved and populated:", populatedMessage);

      // Gửi tin nhắn mới tới receiver
      io.to(receiverId).emit("receiveMessage", populatedMessage);
      if (sender.role === "user") {
        io.to("adminRoom").emit("receiveMessage", populatedMessage);
      }

      // Gửi cập nhật danh sách tin nhắn đã đọc tới sender và receiver
      const updatedMessages = await Message.find({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      }).populate("sender receiver", "username");
      io.to(senderId).emit("updateMessages", updatedMessages);
      io.to(receiverId).emit("updateMessages", updatedMessages);
    } catch (error) {
      console.error("Error in sendMessage:", error.message);
      socket.emit("error", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("username _id");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API để lấy lịch sử tin nhắn
app.get("/api/messages/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).populate("sender receiver", "username");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/messages/:id/read", async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    )
      .populate("sender", "username")
      .populate("receiver", "username");
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Khởi chạy server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
