// utils/uploadImage.js
const cloudinary = require("../config/cloudinary");

console.log("Cloudinary in uploadImage:", cloudinary); // Debug

async function uploadImage(file) {
  try {
    console.log("File to upload:", file.originalname); // Debug
    const base64Data = file.buffer.toString("base64");
    const dataUri = `data:${file.mimetype};base64,${base64Data}`;
    console.log("Data URI:", dataUri.substring(0, 50) + "..."); // Debug
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "my-uploads",
    });
    console.log("Upload result:", result); // Debug
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
