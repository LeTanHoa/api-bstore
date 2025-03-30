const express = require("express");
const {
  register,
  login,
  getMe,
  getAllUser,
  deleteUser,
  changePassword,
  updateUser,
  sendRegistrationOTP,
  verifyRegistrationOTP,
  forgotPasswordEmail,
  resetPasswordEmail,
} = require("../controllers/authController");
const authenticateToken = require("../middleware/middleware");
const router = express.Router();

router.get("/", getAllUser);
router.post("/register/send-otp", sendRegistrationOTP);
router.post("/register/verify-otp", verifyRegistrationOTP);
router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getMe);
router.put("/change-password", authenticateToken, changePassword);

router.post("/forgot-password-email", forgotPasswordEmail);
router.post("/reset-password-email", resetPasswordEmail);

router.delete("/:id", deleteUser);
router.put("/:id", updateUser);

module.exports = router;
