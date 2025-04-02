// middleware/upload.js
const multer = require("multer");
const fs = require("fs");

const storage = multer.memoryStorage(); // Lưu file vào memory thay vì disk để chuyển thành base64

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("File không phải là ảnh!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
