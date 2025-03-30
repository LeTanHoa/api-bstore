const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");



// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Store userId temporarily (trong thực tế nên lưu vào database)
const otpStore = new Map();

// Store registration data and OTP temporarily
const registrationStore = new Map();

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register
exports.register = async (req, res) => {
  const { username, email, phone, address, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Chỉ cho phép gán role hợp lệ (ví dụ: "user" hoặc "admin")
    const validRoles = ["user", "admin"];
    const userRole = validRoles.includes(role) ? role : "user"; // Mặc định là "user" nếu role không hợp lệ

    user = new User({
      username,
      email,
      phone,
      address,
      password,
      role: userRole,
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role }, // Thêm role vào token
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Đăng ký thành công",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, // Thêm role vào token
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        phone: user.phone,
        address: user.address,
        username: user.username,
        email: user.email,
        role: user.role, // Thêm role vào response
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.status(200).json({
      id: user._id,
      username: user.username,
      phone: user.phone,
      address: user.address,
      email: user.email,
      role: user.role, // Thêm role
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Get all users (có thể thêm kiểm tra quyền admin)
exports.getAllUser = async (req, res) => {
  try {
    // Chỉ admin mới được xem danh sách user
    // if (req.user.role !== "admin") {
    //   return res
    //     .status(403)
    //     .json({ message: "Chỉ admin mới có quyền truy cập" });
    // }

    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, phone, address } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    user.username = username || user.username;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    await user.save();
    res.json({ message: "Cập nhật người dùng thành công" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi khi cập nhật người dùng" });
  }
};

// Delete user (có thể thêm kiểm tra quyền admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi khi xóa người dùng" });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  console.log("Request body:", req.body);
  console.log("User ID from token:", req.user.id);

  try {
    // Tìm user theo id (từ token)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Thay đổi mật khẩu thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi thay đổi mật khẩu" });
  }
};

exports.sendRegistrationOTP = async (req, res) => {
  const { username, email, phone, address, password, role } = req.body;

  try {
    //Kiểm tra email đã tồn tại
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    //Phát OTP
    const otp = generateOTP();

    //Lưu trữ dữ liệu đăng ký và OTP
    registrationStore.set(email, {
      userData: {
        username,
        email,
        phone,
        address,
        password,
        role,
      },
      otp,
      expiry: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
    });

    //Gửi OTP đến mail
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Xác nhận đăng ký tài khoản",
      html: `
        <h2>Xác nhận đăng ký tài khoản</h2>
        <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
        <p>Mã này sẽ hết hạn sau 5 phút.</p>
        <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Mã OTP đã được gửi đến email của bạn",
      email,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      message: "Không thể gửi mã OTP",
      error: error.message,
    });
  }
};

// Kiểm tra OTP và hoàn tất đăng ký
exports.verifyRegistrationOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Lấy dữ liệu đăng ký
    const registrationData = registrationStore.get(email);

    if (!registrationData) {
      return res.status(400).json({
        message: "Không tìm thấy thông tin đăng ký hoặc đã hết hạn",
      });
    }

    // Kiểm tra hạn sử dụng OTP
    if (Date.now() > registrationData.expiry) {
      registrationStore.delete(email);
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });
    }

    // Kiểm tra OTP
    if (otp !== registrationData.otp) {
      return res.status(400).json({ message: "Mã OTP không chính xác" });
    }

    // Tạo user mới
    const { userData } = registrationData;
    const validRoles = ["user", "admin"];
    const userRole = validRoles.includes(userData.role)
      ? userData.role
      : "user";

    const user = new User({
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      password: userData.password,
      role: userRole,
    });

    await user.save();

    // Xóa dữ liệu đăng ký
    registrationStore.delete(email);

    // Tạo token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Đăng ký thành công",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Lỗi khi hoàn tất đăng ký",
      error: error.message,
    });
  }
};

exports.forgotPasswordEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email không tồn tại trong hệ thống" });
    }

    // Phát OTP
    const otp = generateOTP();

    //Lưu trữ dữ liệu người dùng và OTP
    otpStore.set(email, {
      userId: user._id,
      otp,
      expiry: Date.now() + 5 * 60 * 1000, // tồn tại 5p
    });
    //Gửi OTP đến mail
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Đặt lại mật khẩu",
      html: `
        <h2>Yêu cầu đặt lại mật khẩu</h2>
        <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
        <p>Mã này sẽ hết hạn sau 5 phút.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Mã OTP đã được gửi đến email của bạn",
      email,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Không thể gửi mã OTP",
      error: error.message,
    });
  }
};

// Đặt lại mk với OTP
exports.resetPasswordEmail = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    //Lấy dữ liệu OTP
    const otpData = otpStore.get(email);

    if (!otpData) {
      return res.status(400).json({
        message: "Yêu cầu đặt lại mật khẩu không tồn tại hoặc đã hết hạn",
      });
    }

    //Kiểm tra hạn sử dụng OTP
    if (Date.now() > otpData.expiry) {
      otpStore.delete(email);
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });
    }

    //Kiểm tra OTP
    if (otp !== otpData.otp) {
      return res.status(400).json({ message: "Mã OTP không chính xác" });
    }

    //Cập nhật mk
    const user = await User.findById(otpData.userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    user.password = newPassword;
    await user.save();

    //Xóa dữ liệu OTP
    otpStore.delete(email);

    res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      message: "Lỗi khi đặt lại mật khẩu",
      error: error.message,
    });
  }
};
