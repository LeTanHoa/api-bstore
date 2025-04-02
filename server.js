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
const allowedOrigins = [
  process.env.FRONTEND_URL,
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

// const server = http.createServer(app);
// const io = socketIO(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL,
//     methods: ["GET", "POST"],
//   },
// });
// console.log("Socket.IO initialized with CORS config:", {
//   origin: process.env.FRONTEND_URL,
//   methods: ["GET", "POST"],
// });

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
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   socket.on("joinChat", async ({ userId }) => {
//     console.log("joinChat event received with userId:", userId);
//     try {
//       if (!userId) return socket.emit("error", "User ID is required");
//       const user = await User.findById(userId);
//       if (!user) return socket.emit("error", "User not found");

//       const room = user.role === "admin" ? "adminRoom" : userId;
//       socket.join(room);
//       console.log(`${user.username} (role: ${user.role}) joined room: ${room}`);
//     } catch (error) {
//       console.error("Error in joinChat:", error.message);
//       socket.emit("error", "Server error in joinChat");
//     }
//   });

//   socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
//     try {
//       const sender = await User.findById(senderId);
//       if (!sender) return socket.emit("error", "Sender not found");

//       if (sender.role === "user") {
//         const admin = await User.findOne({ role: "admin" });
//         if (!admin) return socket.emit("error", "No admin available");
//         receiverId = admin._id;
//       } else if (sender.role === "admin") {
//         if (!receiverId) return socket.emit("error", "Receiver ID is required");
//         const receiver = await User.findById(receiverId);
//         if (!receiver) return socket.emit("error", "Receiver not found");
//       }

//       // Đánh dấu tất cả tin nhắn từ receiverId đến senderId là đã đọc
//       await Message.updateMany(
//         { sender: receiverId, receiver: senderId, isRead: false },
//         { isRead: true }
//       );
//       console.log(`Marked messages from ${receiverId} to ${senderId} as read`);

//       // Tạo và lưu tin nhắn mới
//       const message = new Message({
//         sender: senderId,
//         receiver: receiverId,
//         content,
//       });
//       await message.save();

//       const populatedMessage = await Message.findById(message._id)
//         .populate("sender", "username")
//         .populate("receiver", "username");
//       console.log("Message saved and populated:", populatedMessage);

//       // Gửi tin nhắn mới tới receiver
//       io.to(receiverId).emit("receiveMessage", populatedMessage);
//       if (sender.role === "user") {
//         io.to("adminRoom").emit("receiveMessage", populatedMessage);
//       }

//       // Gửi cập nhật danh sách tin nhắn đã đọc tới sender và receiver
//       const updatedMessages = await Message.find({
//         $or: [
//           { sender: senderId, receiver: receiverId },
//           { sender: receiverId, receiver: senderId },
//         ],
//       }).populate("sender receiver", "username");
//       io.to(senderId).emit("updateMessages", updatedMessages);
//       io.to(receiverId).emit("updateMessages", updatedMessages);
//     } catch (error) {
//       console.error("Error in sendMessage:", error.message);
//       socket.emit("error", error.message);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

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

app.get("/", (req, res) => {
  res.send("<h1>Backend API is running 🚀</h1>");
});
// Khởi chạy server
const PORT = process.env.PORT || 5000;
// server.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server chạy tại http://localhost:${PORT}`);
// });

const products = [
  // 1. iPhone X - Biến thể 1
  {
    name: "iPhone X 64GB Silver",
    description:
      "iPhone X with edge-to-edge OLED display, Face ID, and A11 Bionic chip.",
    price: 999,
    releaseDate: "2017-11-03T00:00:00Z",
    stock: "10",
    chip: "A11 Bionic",
    ram: "3GB",
    storage: "64GB",
    display: "5.8-inch Super Retina HD OLED",
    battery: "2716 mAh",
    camera: "12MP dual rear, 7MP front",
    os: "iOS 11 (upgradable to iOS 17)",
    productType: "Smartphone",
    type: "iPhone",
    capacities: ["64GB"],
    colors: [{ colorName: "Silver", colorCode: "#FFFFFF", images: [] }],
  },
  // 2. iPhone X - Biến thể 2
  {
    name: "iPhone X 256GB Space Gray",
    description: "iPhone X with larger storage and Space Gray color.",
    price: 1149,
    releaseDate: "2017-11-03T00:00:00Z",
    stock: "15",
    chip: "A11 Bionic",
    ram: "3GB",
    storage: "256GB",
    display: "5.8-inch Super Retina HD OLED",
    battery: "2716 mAh",
    camera: "12MP dual rear, 7MP front",
    os: "iOS 11 (upgradable to iOS 17)",
    productType: "Smartphone",
    type: "iPhone",
    capacities: ["256GB"],
    colors: [{ colorName: "Space Gray", colorCode: "#333333", images: [] }],
  },
  // 3. MacBook Air M2 - Biến thể 1
  {
    name: "MacBook Air M2 256GB Midnight",
    description: "Lightweight MacBook with M2 chip.",
    price: 1199,
    releaseDate: "2022-07-15T00:00:00Z",
    stock: "20",
    chip: "M2",
    ram: "8GB",
    storage: "256GB",
    display: "13.6-inch Retina",
    battery: "Up to 18 hours",
    camera: "1080p FaceTime HD",
    os: "macOS Ventura",
    productType: "Laptop",
    type: "Mac",
    capacities: ["256GB"],
    colors: [{ colorName: "Midnight", colorCode: "#000000", images: [] }],
  },
  // 4. MacBook Air M2 - Biến thể 2
  {
    name: "MacBook Air M2 512GB Starlight",
    description: "MacBook Air with more storage and Starlight color.",
    price: 1399,
    releaseDate: "2022-07-15T00:00:00Z",
    stock: "25",
    chip: "M2",
    ram: "8GB",
    storage: "512GB",
    display: "13.6-inch Retina",
    battery: "Up to 18 hours",
    camera: "1080p FaceTime HD",
    os: "macOS Ventura",
    productType: "Laptop",
    type: "Mac",
    capacities: ["512GB"],
    colors: [{ colorName: "Starlight", colorCode: "#E5E4E2", images: [] }],
  },
  // 5. iPod Touch 7th Gen - Biến thể 1
  {
    name: "iPod Touch 32GB Gold",
    description: "Portable music player with A10 Fusion chip.",
    price: 199,
    releaseDate: "2019-05-28T00:00:00Z",
    stock: "30",
    chip: "A10 Fusion",
    ram: "2GB",
    storage: "32GB",
    display: "4-inch Retina",
    battery: "Up to 40 hours audio",
    camera: "8MP rear, 1.2MP front",
    os: "iOS 12 (upgradable to iOS 15)",
    productType: "Music Player",
    type: "iPod",
    capacities: ["32GB"],
    colors: [{ colorName: "Gold", colorCode: "#FFD700", images: [] }],
  },
  // 6. iPod Touch 7th Gen - Biến thể 2
  {
    name: "iPod Touch 128GB Space Gray",
    description: "iPod Touch with larger storage.",
    price: 249,
    releaseDate: "2019-05-28T00:00:00Z",
    stock: "35",
    chip: "A10 Fusion",
    ram: "2GB",
    storage: "128GB",
    display: "4-inch Retina",
    battery: "Up to 40 hours audio",
    camera: "8MP rear, 1.2MP front",
    os: "iOS 12 (upgradable to iOS 15)",
    productType: "Music Player",
    type: "iPod",
    capacities: ["128GB"],
    colors: [{ colorName: "Space Gray", colorCode: "#333333", images: [] }],
  },
  // 7. Apple Watch Series 10 - Biến thể 1
  {
    name: "Apple Watch Series 10 32GB Jet Black",
    description: "Latest Apple Watch with S10 chip.",
    price: 399,
    releaseDate: "2024-09-09T00:00:00Z",
    stock: "40",
    chip: "S10",
    ram: "1GB",
    storage: "32GB",
    display: "1.7-inch Retina LTPO OLED",
    battery: "Up to 18 hours",
    camera: "No camera (only sensors)",
    os: "watchOS 11",
    productType: "Wearable",
    type: "Apple Watch",
    capacities: ["32GB"],
    colors: [{ colorName: "Jet Black", colorCode: "#000000", images: [] }],
  },
  // 8. Apple Watch Series 10 - Biến thể 2
  {
    name: "Apple Watch Series 10 32GB Rose Gold",
    description: "Apple Watch with elegant Rose Gold finish.",
    price: 429,
    releaseDate: "2024-09-09T00:00:00Z",
    stock: "45",
    chip: "S10",
    ram: "1GB",
    storage: "32GB",
    display: "2-inch Retina LTPO OLED",
    battery: "Up to 18 hours",
    camera: "No camera (only sensors)",
    os: "watchOS 11",
    productType: "Wearable",
    type: "Apple Watch",
    capacities: ["32GB"],
    colors: [{ colorName: "Rose Gold", colorCode: "#FFD1DC", images: [] }],
  },
  // 9. Phụ kiện - AirPods 4
  {
    name: "AirPods 4",
    description: "Wireless earbuds with improved sound and noise cancellation.",
    price: 129,
    releaseDate: "2024-09-09T00:00:00Z",
    stock: "50",
    chip: "H2",
    ram: "N/A",
    storage: "N/A",
    display: "N/A",
    battery: "Up to 30 hours with case",
    camera: "N/A",
    os: "N/A",
    productType: "Accessory",
    type: "Accessory",
    capacities: [],
    colors: [{ colorName: "White", colorCode: "#FFFFFF", images: [] }],
  },
  // 10. iPad 10th Gen
  {
    name: "iPad 10th Gen 64GB Silver",
    description: "Entry-level iPad with A14 Bionic chip.",
    price: 449,
    releaseDate: "2022-10-26T00:00:00Z",
    stock: "60",
    chip: "A14 Bionic",
    ram: "4GB",
    storage: "64GB",
    display: "10.9-inch Liquid Retina",
    battery: "Up to 10 hours",
    camera: "12MP rear, 12MP front",
    os: "iPadOS 16 (upgradable to iPadOS 18)",
    productType: "Tablet",
    type: "iPad",
    capacities: ["64GB"],
    colors: [{ colorName: "Silver", colorCode: "#C0C0C0", images: [] }],
  },
  // iPhone (10 biến thể) - Dựa trên iPhone 16, iPhone 17 (dự đoán 2025)
  {
    name: "iPhone 16 128GB Black Titanium",
    description:
      "iPhone 16 with A18 chip, improved camera, and Apple Intelligence.",
    price: 799,
    releaseDate: "2024-09-09T00:00:00Z",
    stock: "50",
    chip: "A18",
    ram: "6GB",
    storage: "128GB",
    display: "6.1-inch Super Retina XDR",
    battery: "Up to 20 hours",
    camera: "48MP main, 12MP ultra-wide, 12MP front",
    os: "iOS 18 (upgradable to iOS 19)",
    productType: "Smartphone",
    type: "iPhone",
    capacities: ["128GB"],
    colors: [
      { colorName: "Black Titanium", colorCode: "#000000", images: [] },
      { colorName: "White Titanium", colorCode: "#FFFFFF", images: [] },
      { colorName: "Natural Titanium", colorCode: "#D3D3D3", images: [] },
      { colorName: "Midnight", colorCode: "#1A1A1A", images: [] },
      { colorName: "Starlight", colorCode: "#E5E4E2", images: [] },
    ],
  },
  // Thêm 9 biến thể iPhone nữa (tương tự, thay đổi dung lượng và màu sắc)
  {
    name: "iPhone 16 256GB Silver",
    description: "iPhone 16 with larger storage and Silver finish.",
    price: 899,
    releaseDate: "2024-09-09T00:00:00Z",
    stock: "45",
    chip: "A18",
    ram: "6GB",
    storage: "256GB",
    display: "6.1-inch Super Retina XDR",
    battery: "Up to 20 hours",
    camera: "48MP main, 12MP ultra-wide, 12MP front",
    os: "iOS 18 (upgradable to iOS 19)",
    productType: "Smartphone",
    type: "iPhone",
    capacities: ["256GB"],
    colors: [
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
      { colorName: "Gold", colorCode: "#FFD700", images: [] },
      { colorName: "Rose Gold", colorCode: "#FFD1DC", images: [] },
      { colorName: "Midnight Green", colorCode: "#004D40", images: [] },
      { colorName: "Product(RED)", colorCode: "#FF0000", images: [] },
    ],
  },
  // Tiếp tục 8 biến thể iPhone khác với các màu như Space Black, Graphite, Blue, v.v.

  // Mac (10 biến thể) - Dựa trên MacBook Air M4, MacBook Pro M5
  {
    name: "MacBook Air M4 256GB Space Gray",
    description: "Lightweight MacBook with M4 chip and 16GB base RAM.",
    price: 1099,
    releaseDate: "2025-03-04T00:00:00Z",
    stock: "60",
    chip: "M4",
    ram: "16GB",
    storage: "256GB",
    display: "13.6-inch Retina",
    battery: "Up to 18 hours",
    camera: "12MP Center Stage",
    os: "macOS 15",
    productType: "Laptop",
    type: "Mac",
    capacities: ["256GB"],
    colors: [
      { colorName: "Space Gray", colorCode: "#333333", images: [] },
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
      { colorName: "Midnight", colorCode: "#1A1A1A", images: [] },
      { colorName: "Sky Blue", colorCode: "#87CEEB", images: [] },
      { colorName: "Starlight", colorCode: "#E5E4E2", images: [] },
    ],
  },
  // Thêm 9 biến thể Mac nữa với các màu như Graphite, Space Black, Gold, v.v.

  // iPod (10 biến thể) - Dựa trên iPod Touch 7th Gen và giả định
  {
    name: "iPod Touch 7th Gen 32GB Red",
    description: "Portable music player with A10 Fusion.",
    price: 199,
    releaseDate: "2019-05-28T00:00:00Z",
    stock: "25",
    chip: "A10 Fusion",
    ram: "2GB",
    storage: "32GB",
    display: "4-inch Retina",
    battery: "Up to 40 hours audio",
    camera: "8MP rear, 1.2MP front",
    os: "iOS 12 (upgradable to iOS 15)",
    productType: "Music Player",
    type: "iPod",
    capacities: ["32GB"],
    colors: [
      { colorName: "Red", colorCode: "#FF0000", images: [] },
      { colorName: "Gold", colorCode: "#FFD700", images: [] },
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
      { colorName: "Space Gray", colorCode: "#333333", images: [] },
      { colorName: "Blue", colorCode: "#0000FF", images: [] },
    ],
  },
  // Thêm 9 biến thể iPod nữa với các màu như Pink, Green, Yellow, v.v.

  // Apple Watch (10 biến thể) - Dựa trên Series 10, Ultra 3
  {
    name: "Apple Watch Series 10 32GB Midnight",
    description: "Latest watch with S10 chip and larger display.",
    price: 399,
    releaseDate: "2024-09-09T00:00:00Z",
    stock: "70",
    chip: "S10",
    ram: "1GB",
    storage: "32GB",
    display: "1.7-inch Retina LTPO OLED",
    battery: "Up to 18 hours",
    camera: "No camera",
    os: "watchOS 11",
    productType: "Wearable",
    type: "Apple Watch",
    capacities: ["32GB"],
    colors: [
      { colorName: "Midnight", colorCode: "#1A1A1A", images: [] },
      { colorName: "Natural Titanium", colorCode: "#D3D3D3", images: [] },
      { colorName: "Jet Black", colorCode: "#000000", images: [] },
      { colorName: "Rose Gold", colorCode: "#FFD1DC", images: [] },
      { colorName: "Silver Aluminum", colorCode: "#C0C0C0", images: [] },
    ],
  },
  // Thêm 9 biến thể Apple Watch nữa với các màu như Graphite, Clover, Starlight, v.v.

  // Phụ kiện (10 biến thể) - Dựa trên AirPods, AirTag 2, v.v.
  {
    name: "AirPods 4 White",
    description: "Wireless earbuds with H3 chip and noise cancellation.",
    price: 129,
    releaseDate: "2025-09-12T00:00:00Z",
    stock: "100",
    chip: "H3",
    ram: "N/A",
    storage: "N/A",
    display: "N/A",
    battery: "Up to 30 hours with case",
    camera: "N/A",
    os: "N/A",
    productType: "Accessory",
    type: "Accessory",
    capacities: [],
    colors: [
      { colorName: "White", colorCode: "#FFFFFF", images: [] },
      { colorName: "Midnight", colorCode: "#1A1A1A", images: [] },
      { colorName: "Starlight", colorCode: "#E5E4E2", images: [] },
      { colorName: "Product(RED)", colorCode: "#FF0000", images: [] },
    ],
  },
  // Thêm 9 biến thể Phụ kiện nữa với các màu như Black, Silver, Gold, v.v.

  // iPad (10 biến thể) - Dựa trên iPad Air M3, iPad Pro M5
  {
    name: "iPad Air M3 128GB Space Gray",
    description: "iPad Air with M3 chip and Apple Intelligence.",
    price: 599,
    releaseDate: "2025-03-04T00:00:00Z",
    stock: "80",
    chip: "M3",
    ram: "8GB",
    storage: "128GB",
    display: "11-inch Liquid Retina",
    battery: "Up to 10 hours",
    camera: "12MP rear, 12MP front",
    os: "iPadOS 18 (upgradable to iPadOS 19)",
    productType: "Tablet",
    type: "iPad",
    capacities: ["128GB"],
    colors: [
      { colorName: "Space Gray", colorCode: "#333333", images: [] },
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
      { colorName: "Midnight", colorCode: "#1A1A1A", images: [] },
      { colorName: "Starlight", colorCode: "#E5E4E2", images: [] },
      { colorName: "Rose Gold", colorCode: "#FFD1DC", images: [] },
    ],
  },

  // iPhone (Thêm 10 biến thể) - Dựa trên iPhone 17, iPhone 17 Air (dự đoán 2025)
  {
    name: "iPhone 17 128GB Midnight",
    description:
      "iPhone 17 with A19 chip, ProMotion display, and Apple Intelligence.",
    price: 849,
    releaseDate: "2025-09-12T00:00:00Z",
    stock: "75",
    chip: "A19",
    ram: "6GB",
    storage: "128GB",
    display: "6.1-inch Super Retina XDR with ProMotion",
    battery: "Up to 22 hours",
    camera: "48MP main, 12MP ultra-wide, 24MP front",
    os: "iOS 19",
    productType: "Smartphone",
    type: "iPhone",
    capacities: ["128GB"],
    colors: [
      { colorName: "Midnight", colorCode: "#1A1A1A", images: [] },
      { colorName: "Starlight", colorCode: "#E5E4E2", images: [] },
      { colorName: "Black Titanium", colorCode: "#000000", images: [] },
      { colorName: "White Titanium", colorCode: "#FFFFFF", images: [] },
      { colorName: "Alpine Green", colorCode: "#4A704A", images: [] },
      { colorName: "Sky Blue", colorCode: "#87CEEB", images: [] },
    ],
  },
  {
    name: "iPhone 17 Air 256GB Rose Gold",
    description: "Thinnest iPhone ever with single rear camera and A19 chip.",
    price: 1099,
    releaseDate: "2025-09-12T00:00:00Z",
    stock: "60",
    chip: "A19",
    ram: "8GB",
    storage: "256GB",
    display: "6.6-inch Super Retina XDR",
    battery: "Up to 20 hours",
    camera: "48MP main, 24MP front",
    os: "iOS 19",
    productType: "Smartphone",
    type: "iPhone",
    capacities: ["256GB"],
    colors: [
      { colorName: "Rose Gold", colorCode: "#FFD1DC", images: [] },
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
      { colorName: "Graphite", colorCode: "#383838", images: [] },
      { colorName: "Clover", colorCode: "#3CB371", images: [] },
      { colorName: "Jet Black", colorCode: "#000000", images: [] },
    ],
  },
  // Thêm 8 biến thể iPhone 17 khác với các màu và dung lượng khác

  // Mac (Thêm 10 biến thể) - Dựa trên MacBook Pro M5, Mac Studio M4 Ultra
  {
    name: "MacBook Pro 14-inch M5 512GB Space Black",
    description: "High-performance laptop with M5 chip and mini-LED display.",
    price: 1599,
    releaseDate: "2025-10-23T00:00:00Z",
    stock: "40",
    chip: "M5",
    ram: "16GB",
    storage: "512GB",
    display: "14.2-inch Liquid Retina XDR",
    battery: "Up to 18 hours",
    camera: "12MP Center Stage",
    os: "macOS 16",
    productType: "Laptop",
    type: "Mac",
    capacities: ["512GB"],
    colors: [
      { colorName: "Space Black", colorCode: "#1A1A1A", images: [] },
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
      { colorName: "Graphite", colorCode: "#383838", images: [] },
      { colorName: "Sky Blue", colorCode: "#87CEEB", images: [] },
      { colorName: "Midnight", colorCode: "#000000", images: [] },
    ],
  },
  {
    name: "Mac Studio M4 Ultra 1TB Silver",
    description: "Powerful desktop with M4 Ultra chip for professionals.",
    price: 1999,
    releaseDate: "2025-06-10T00:00:00Z",
    stock: "30",
    chip: "M4 Ultra",
    ram: "32GB",
    storage: "1TB",
    display: "Supports up to 8K",
    battery: "N/A",
    camera: "No built-in camera",
    os: "macOS 15",
    productType: "Desktop",
    type: "Mac",
    capacities: ["1TB"],
    colors: [
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
      { colorName: "Space Gray", colorCode: "#333333", images: [] },
      { colorName: "Graphite", colorCode: "#383838", images: [] },
      { colorName: "Starlight", colorCode: "#E5E4E2", images: [] },
      { colorName: "Black", colorCode: "#000000", images: [] },
    ],
  },
  // Thêm 8 biến thể Mac khác

  // iPod (Thêm 10 biến thể) - Dựa trên iPod Touch 8th Gen (giả định)
  {
    name: "iPod Touch 8th Gen 64GB Yellow",
    description:
      "New generation music player with A16 chip and Apple Intelligence.",
    price: 249,
    releaseDate: "2025-06-01T00:00:00Z",
    stock: "50",
    chip: "A16",
    ram: "4GB",
    storage: "64GB",
    display: "4.3-inch Retina",
    battery: "Up to 40 hours audio",
    camera: "12MP rear, 12MP front",
    os: "iOS 18",
    productType: "Music Player",
    type: "iPod",
    capacities: ["64GB"],
    colors: [
      { colorName: "Yellow", colorCode: "#FFFF00", images: [] },
      { colorName: "Pink", colorCode: "#FFC0CB", images: [] },
      { colorName: "Blue", colorCode: "#0000FF", images: [] },
      { colorName: "Red", colorCode: "#FF0000", images: [] },
      { colorName: "Green", colorCode: "#00FF00", images: [] },
    ],
  },
  // Thêm 9 biến thể iPod khác

  // Apple Watch (Thêm 10 biến thể) - Dựa trên Series 11, Ultra 3
  {
    name: "Apple Watch Series 11 32GB Midnight",
    description:
      "Series 11 with blood pressure monitoring and microLED display.",
    price: 449,
    releaseDate: "2025-09-12T00:00:00Z",
    stock: "80",
    chip: "S12",
    ram: "1GB",
    storage: "32GB",
    display: "1.8-inch microLED",
    battery: "Up to 18 hours",
    camera: "No camera",
    os: "watchOS 12",
    productType: "Wearable",
    type: "Apple Watch",
    capacities: ["32GB"],
    colors: [
      { colorName: "Midnight", colorCode: "#1A1A1A", images: [] },
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
      { colorName: "Gold", colorCode: "#FFD700", images: [] },
      { colorName: "Rose Gold", colorCode: "#FFD1DC", images: [] },
      { colorName: "Graphite", colorCode: "#383838", images: [] },
    ],
  },
  {
    name: "Apple Watch Ultra 3 64GB Titanium",
    description:
      "Ultra 3 with satellite connectivity and advanced health sensors.",
    price: 799,
    releaseDate: "2025-09-12T00:00:00Z",
    stock: "50",
    chip: "S12",
    ram: "2GB",
    storage: "64GB",
    display: "2.1-inch Retina LTPO",
    battery: "Up to 36 hours",
    camera: "No camera",
    os: "watchOS 12",
    productType: "Wearable",
    type: "Apple Watch",
    capacities: ["64GB"],
    colors: [
      { colorName: "Titanium", colorCode: "#D3D3D3", images: [] },
      { colorName: "Black Titanium", colorCode: "#000000", images: [] },
      { colorName: "Natural Titanium", colorCode: "#C0C0C0", images: [] },
      { colorName: "Gold Titanium", colorCode: "#FFD700", images: [] },
      { colorName: "Blue Titanium", colorCode: "#0000FF", images: [] },
    ],
  },
  // Thêm 8 biến thể Apple Watch khác

  // Phụ kiện (Thêm 10 biến thể) - Dựa trên AirPods Pro 3, AirTag 2, v.v.
  {
    name: "AirPods Pro 3 White",
    description: "Next-gen earbuds with H3 chip and health monitoring.",
    price: 249,
    releaseDate: "2025-09-12T00:00:00Z",
    stock: "100",
    chip: "H3",
    ram: "N/A",
    storage: "N/A",
    display: "N/A",
    battery: "Up to 30 hours with case",
    camera: "N/A",
    os: "N/A",
    productType: "Accessory",
    type: "Accessory",
    capacities: [],
    colors: [
      { colorName: "White", colorCode: "#FFFFFF", images: [] },
      { colorName: "Midnight", colorCode: "#1A1A1A", images: [] },
      { colorName: "Starlight", colorCode: "#E5E4E2", images: [] },
      { colorName: "Graphite", colorCode: "#383838", images: [] },
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
    ],
  },
  // Thêm 9 biến thể Phụ kiện khác

  // iPad (Thêm 10 biến thể) - Dựa trên iPad Pro M5, iPad Air M4
  {
    name: "iPad Pro 12.9-inch M5 1TB Space Gray",
    description: "Top-tier tablet with M5 chip and OLED display.",
    price: 1299,
    releaseDate: "2025-10-23T00:00:00Z",
    stock: "45",
    chip: "M5",
    ram: "16GB",
    storage: "1TB",
    display: "12.9-inch Tandem OLED",
    battery: "Up to 10 hours",
    camera: "12MP rear, 12MP front",
    os: "iPadOS 19",
    productType: "Tablet",
    type: "iPad",
    capacities: ["1TB"],
    colors: [
      { colorName: "Space Gray", colorCode: "#333333", images: [] },
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
      { colorName: "Midnight", colorCode: "#1A1A1A", images: [] },
      { colorName: "Starlight", colorCode: "#E5E4E2", images: [] },
      { colorName: "Gold", colorCode: "#FFD700", images: [] },
    ],
  },
  {
    name: "iPad Air 13-inch M4 256GB Blue",
    description: "Mid-range tablet with M4 chip and larger display.",
    price: 799,
    releaseDate: "2025-03-04T00:00:00Z",
    stock: "70",
    chip: "M4",
    ram: "8GB",
    storage: "256GB",
    display: "13-inch Liquid Retina",
    battery: "Up to 10 hours",
    camera: "12MP rear, 12MP front",
    os: "iPadOS 18",
    productType: "Tablet",
    type: "iPad",
    capacities: ["256GB"],
    colors: [
      { colorName: "Blue", colorCode: "#0000FF", images: [] },
      { colorName: "Purple", colorCode: "#800080", images: [] },
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
      { colorName: "Space Gray", colorCode: "#333333", images: [] },
      { colorName: "Starlight", colorCode: "#E5E4E2", images: [] },
    ],
  },

  // iPhone (Thêm 10 biến thể) - Dựa trên iPhone 17, iPhone 17 Air (dự đoán 2025)
  {
    name: "iPhone 17 128GB Midnight",
    description:
      "iPhone 17 with A19 chip, ProMotion display, and Apple Intelligence.",
    price: 849,
    releaseDate: "2025-09-12T00:00:00Z",
    stock: "75",
    chip: "A19",
    ram: "6GB",
    storage: "128GB",
    display: "6.1-inch Super Retina XDR with ProMotion",
    battery: "Up to 22 hours",
    camera: "48MP main, 12MP ultra-wide, 24MP front",
    os: "iOS 19",
    productType: "Smartphone",
    type: "iPhone",
    capacities: ["128GB"],
    colors: [
      { colorName: "Midnight", colorCode: "#1A1A1A", images: [] },
      { colorName: "Starlight", colorCode: "#E5E4E2", images: [] },
      { colorName: "Black Titanium", colorCode: "#000000", images: [] },
      { colorName: "White Titanium", colorCode: "#FFFFFF", images: [] },
      { colorName: "Alpine Green", colorCode: "#4A704A", images: [] },
      { colorName: "Sky Blue", colorCode: "#87CEEB", images: [] },
    ],
  },
  {
    name: "iPhone 17 Air 256GB Rose Gold",
    description: "Thinnest iPhone ever with single rear camera and A19 chip.",
    price: 1099,
    releaseDate: "2025-09-12T00:00:00Z",
    stock: "60",
    chip: "A19",
    ram: "8GB",
    storage: "256GB",
    display: "6.6-inch Super Retina XDR",
    battery: "Up to 20 hours",
    camera: "48MP main, 24MP front",
    os: "iOS 19",
    productType: "Smartphone",
    type: "iPhone",
    capacities: ["256GB"],
    colors: [
      { colorName: "Rose Gold", colorCode: "#FFD1DC", images: [] },
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
      { colorName: "Graphite", colorCode: "#383838", images: [] },
      { colorName: "Clover", colorCode: "#3CB371", images: [] },
      { colorName: "Jet Black", colorCode: "#000000", images: [] },
    ],
  },
  // Thêm 8 biến thể iPhone 17 khác với các màu và dung lượng khác

  // Mac (Thêm 10 biến thể) - Dựa trên MacBook Pro M5, Mac Studio M4 Ultra
  {
    name: "MacBook Pro 14-inch M5 512GB Space Black",
    description: "High-performance laptop with M5 chip and mini-LED display.",
    price: 1599,
    releaseDate: "2025-10-23T00:00:00Z",
    stock: "40",
    chip: "M5",
    ram: "16GB",
    storage: "512GB",
    display: "14.2-inch Liquid Retina XDR",
    battery: "Up to 18 hours",
    camera: "12MP Center Stage",
    os: "macOS 16",
    productType: "Laptop",
    type: "Mac",
    capacities: ["512GB"],
    colors: [
      { colorName: "Space Black", colorCode: "#1A1A1A", images: [] },
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
      { colorName: "Graphite", colorCode: "#383838", images: [] },
      { colorName: "Sky Blue", colorCode: "#87CEEB", images: [] },
      { colorName: "Midnight", colorCode: "#000000", images: [] },
    ],
  },
  {
    name: "Mac Studio M4 Ultra 1TB Silver",
    description: "Powerful desktop with M4 Ultra chip for professionals.",
    price: 1999,
    releaseDate: "2025-06-10T00:00:00Z",
    stock: "30",
    chip: "M4 Ultra",
    ram: "32GB",
    storage: "1TB",
    display: "Supports up to 8K",
    battery: "N/A",
    camera: "No built-in camera",
    os: "macOS 15",
    productType: "Desktop",
    type: "Mac",
    capacities: ["1TB"],
    colors: [
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
      { colorName: "Space Gray", colorCode: "#333333", images: [] },
      { colorName: "Graphite", colorCode: "#383838", images: [] },
      { colorName: "Starlight", colorCode: "#E5E4E2", images: [] },
      { colorName: "Black", colorCode: "#000000", images: [] },
    ],
  },
  // Thêm 8 biến thể Mac khác

  // iPod (Thêm 10 biến thể) - Dựa trên iPod Touch 8th Gen (giả định)
  {
    name: "iPod Touch 8th Gen 64GB Yellow",
    description:
      "New generation music player with A16 chip and Apple Intelligence.",
    price: 249,
    releaseDate: "2025-06-01T00:00:00Z",
    stock: "50",
    chip: "A16",
    ram: "4GB",
    storage: "64GB",
    display: "4.3-inch Retina",
    battery: "Up to 40 hours audio",
    camera: "12MP rear, 12MP front",
    os: "iOS 18",
    productType: "Music Player",
    type: "iPod",
    capacities: ["64GB"],
    colors: [
      { colorName: "Yellow", colorCode: "#FFFF00", images: [] },
      { colorName: "Pink", colorCode: "#FFC0CB", images: [] },
      { colorName: "Blue", colorCode: "#0000FF", images: [] },
      { colorName: "Red", colorCode: "#FF0000", images: [] },
      { colorName: "Green", colorCode: "#00FF00", images: [] },
    ],
  },
  // Thêm 9 biến thể iPod khác

  // Apple Watch (Thêm 10 biến thể) - Dựa trên Series 11, Ultra 3
  {
    name: "Apple Watch Series 11 32GB Midnight",
    description:
      "Series 11 with blood pressure monitoring and microLED display.",
    price: 449,
    releaseDate: "2025-09-12T00:00:00Z",
    stock: "80",
    chip: "S12",
    ram: "1GB",
    storage: "32GB",
    display: "1.8-inch microLED",
    battery: "Up to 18 hours",
    camera: "No camera",
    os: "watchOS 12",
    productType: "Wearable",
    type: "Apple Watch",
    capacities: ["32GB"],
    colors: [
      { colorName: "Midnight", colorCode: "#1A1A1A", images: [] },
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
      { colorName: "Gold", colorCode: "#FFD700", images: [] },
      { colorName: "Rose Gold", colorCode: "#FFD1DC", images: [] },
      { colorName: "Graphite", colorCode: "#383838", images: [] },
    ],
  },
  {
    name: "Apple Watch Ultra 3 64GB Titanium",
    description:
      "Ultra 3 with satellite connectivity and advanced health sensors.",
    price: 799,
    releaseDate: "2025-09-12T00:00:00Z",
    stock: "50",
    chip: "S12",
    ram: "2GB",
    storage: "64GB",
    display: "2.1-inch Retina LTPO",
    battery: "Up to 36 hours",
    camera: "No camera",
    os: "watchOS 12",
    productType: "Wearable",
    type: "Apple Watch",
    capacities: ["64GB"],
    colors: [
      { colorName: "Titanium", colorCode: "#D3D3D3", images: [] },
      { colorName: "Black Titanium", colorCode: "#000000", images: [] },
      { colorName: "Natural Titanium", colorCode: "#C0C0C0", images: [] },
      { colorName: "Gold Titanium", colorCode: "#FFD700", images: [] },
      { colorName: "Blue Titanium", colorCode: "#0000FF", images: [] },
    ],
  },
  // Thêm 8 biến thể Apple Watch khác

  // Phụ kiện (Thêm 10 biến thể) - Dựa trên AirPods Pro 3, AirTag 2, v.v.
  {
    name: "AirPods Pro 3 White",
    description: "Next-gen earbuds with H3 chip and health monitoring.",
    price: 249,
    releaseDate: "2025-09-12T00:00:00Z",
    stock: "100",
    chip: "H3",
    ram: "N/A",
    storage: "N/A",
    display: "N/A",
    battery: "Up to 30 hours with case",
    camera: "N/A",
    os: "N/A",
    productType: "Accessory",
    type: "Accessory",
    capacities: [],
    colors: [
      { colorName: "White", colorCode: "#FFFFFF", images: [] },
      { colorName: "Midnight", colorCode: "#1A1A1A", images: [] },
      { colorName: "Starlight", colorCode: "#E5E4E2", images: [] },
      { colorName: "Graphite", colorCode: "#383838", images: [] },
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
    ],
  },
  // Thêm 9 biến thể Phụ kiện khác

  // iPad (Thêm 10 biến thể) - Dựa trên iPad Pro M5, iPad Air M4
  {
    name: "iPad Pro 12.9-inch M5 1TB Space Gray",
    description: "Top-tier tablet with M5 chip and OLED display.",
    price: 1299,
    releaseDate: "2025-10-23T00:00:00Z",
    stock: "45",
    chip: "M5",
    ram: "16GB",
    storage: "1TB",
    display: "12.9-inch Tandem OLED",
    battery: "Up to 10 hours",
    camera: "12MP rear, 12MP front",
    os: "iPadOS 19",
    productType: "Tablet",
    type: "iPad",
    capacities: ["1TB"],
    colors: [
      { colorName: "Space Gray", colorCode: "#333333", images: [] },
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
      { colorName: "Midnight", colorCode: "#1A1A1A", images: [] },
      { colorName: "Starlight", colorCode: "#E5E4E2", images: [] },
      { colorName: "Gold", colorCode: "#FFD700", images: [] },
    ],
  },
  {
    name: "iPad Air 13-inch M4 256GB Blue",
    description: "Mid-range tablet with M4 chip and larger display.",
    price: 799,
    releaseDate: "2025-03-04T00:00:00Z",
    stock: "70",
    chip: "M4",
    ram: "8GB",
    storage: "256GB",
    display: "13-inch Liquid Retina",
    battery: "Up to 10 hours",
    camera: "12MP rear, 12MP front",
    os: "iPadOS 18",
    productType: "Tablet",
    type: "iPad",
    capacities: ["256GB"],
    colors: [
      { colorName: "Blue", colorCode: "#0000FF", images: [] },
      { colorName: "Purple", colorCode: "#800080", images: [] },
      { colorName: "Silver", colorCode: "#C0C0C0", images: [] },
      { colorName: "Space Gray", colorCode: "#333333", images: [] },
      { colorName: "Starlight", colorCode: "#E5E4E2", images: [] },
    ],
  },
  // Thêm 8 biến thể iPad khác

  // Thêm 8 biến thể iPad khác

  // Thêm 9 biến thể iPad nữa với các màu như Gold, Blue, Green, v.v.
];

// const seedData = async () => {
//   try {
//     // Xóa tất cả dữ liệu cũ (nếu muốn)
//     await Product.deleteMany({});
//     console.log("Existing data removed!");

//     // Thêm dữ liệu mới
//     await Product.insertMany(products);
//     console.log("New data inserted successfully!");

//     process.exit(); // Thoát sau khi hoàn tất
//   } catch (error) {
//     console.error("Seeding error:", error);
//     process.exit(1);
//   }
// };

// seedData();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
