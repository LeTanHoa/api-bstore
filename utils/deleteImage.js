const cloudinary = require("../config/cloudinary");

const deleteImage = async (imageUrl) => {
  try {
    // Lấy public_id từ URL của Cloudinary
    const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0];
    const folderName = imageUrl.split("/").slice(-2)[0];
    const fullPublicId = `${folderName}/${publicId}`;

    // Xóa ảnh từ Cloudinary
    const result = await cloudinary.uploader.destroy(fullPublicId);
    console.log("Image deleted from Cloudinary:", result);
    return result;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};

module.exports = { deleteImage };
