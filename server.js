require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const Message = require("./models/Message");
const User = require("./models/User");

// Middleware
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const allowedOrigins = [
  "https://shop-bstore.vercel.app",
  "http://localhost:3000",
].filter(Boolean);

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
const path = require("path");

app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL); // Cho phép frontend truy cập
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    ); // Các phương thức cho phép
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    ); // Các header cho phép
    if (req.method === "OPTIONS") {
      return res.status(200).end(); // Xử lý preflight request
    }
    next();
  },
  express.static(path.join(__dirname, "uploads")) // Phục vụ file tĩnh từ uploads
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Kết nối MongoDB thành công!");
  })
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err));

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

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("username _id");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

app.get("/", (req, res) => {
  res.send("<h1>Backend API is running 🚀</h1>");
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
