// utils/uploadImage.js
const cloudinary = require("../config/cloudinary");

async function uploadImage(file) {
  try {
    const base64Data = file.buffer.toString("base64");
    const dataUri = `data:${file.mimetype};base64,${base64Data}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "my-uploads",
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

module.exports = { uploadImage };
