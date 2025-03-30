
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expect "Bearer <token>"

  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có token, truy cập bị từ chối" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
   // console.log("Decoded token:", decoded); // Debug: Log decoded payload
    next();
  } catch (error) {
    console.error("Token verification error:", error.message); // Debug: Log error details
    res
      .status(403)
      .json({ message: "Token không hợp lệ", error: error.message });
  }
};

module.exports = authenticateToken; // Export as module
