const Product = require("../models/Product");
const fs = require("fs").promises;
const path = require("path");
const { uploadImage } = require("../utils/uploadImage");
const mongoose = require("mongoose");
const { deleteImage } = require("../utils/deleteImage");
const createProduct = async (req, res) => {
  try {
    console.log("Received POST /api/products");
    const { body, files } = req;

    const capacities = body.capacities
      ? Array.isArray(body.capacities)
        ? body.capacities
        : [body.capacities]
      : [];

    const colors = [];
    const colorIndexes = new Set();

    Object.keys(files || {}).forEach((key) => {
      const match = key.match(/^colors\[(\d+)\]/);
      if (match) colorIndexes.add(Number(match[1]));
    });

    for (const index of colorIndexes) {
      const colorData =
        body.colors && body.colors[index] ? body.colors[index] : {};
      const colorName = colorData.colorName;
      const colorCode = colorData.colorCode;

      if (!colorName || !colorCode) continue;

      const imageFiles = files[`colors[${index}][images]`] || [];
      const uploadPromises = imageFiles.map(async (file) => {
        const uploadedImage = await uploadImage(file);
        return uploadedImage.url;
      });
      const uploadedImages = await Promise.all(uploadPromises);

      colors.push({
        colorName,
        colorCode,
        images: uploadedImages, // Only new images for creation
      });
    }

    const product = new Product({
      name: body.name,
      description: body.description,
      price: Number(body.price) || 0,
      releaseDate: body.releaseDate ? new Date(body.releaseDate) : null,
      stock: Number(body.stock) || 0,
      type: body.type,
      chip: body.chip,
      ram: body.ram,
      storage: body.storage,
      display: body.display,
      battery: body.battery,
      camera: body.camera,
      os: body.os,
      productType: body.productType,
      capacities,
      colors,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ error: error.message || "Lỗi khi tạo sản phẩm" });
  }
};

// READ - Lấy tất cả sản phẩm
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ - Lấy 1 sản phẩm theo ID
const getOneProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE - Cập nhật sản phẩm
const updateProduct = async (req, res) => {
  try {
    const { body, files } = req;
    console.log("Received update request:", { body, files });
    const action = req.params.action;
    const productId = req.params.id;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    if (action === "deleteColor") {
      const { colorIdToDelete } = body;

      if (!colorIdToDelete) {
        return res.status(400).json({ message: "Thiếu colorId để xóa" });
      }

      // Tìm color cần xóa
      const colorToDelete = product.colors.find(
        (c) => c._id.toString() === colorIdToDelete
      );

      if (!colorToDelete) {
        return res.status(404).json({ message: "Không tìm thấy màu cần xóa" });
      }

      // Xóa các ảnh của color này từ Cloudinary
      const deletePromises = colorToDelete.images.map((imageUrl) =>
        deleteImage(imageUrl)
      );

      try {
        await Promise.all(deletePromises);
        console.log("All images deleted successfully");
      } catch (error) {
        console.error("Error deleting some images:", error);
        // Tiếp tục xử lý ngay cả khi có lỗi xóa ảnh
      }

      // Cập nhật sản phẩm, loại bỏ color
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          $pull: { colors: { _id: colorIdToDelete } },
        },
        { new: true }
      );

      return res.status(200).json(updatedProduct);
    }

    const capacities = body.capacities
      ? Array.isArray(body.capacities)
        ? body.capacities
        : [body.capacities]
      : [];

    let updatedColors = [];

    // Process colors from body
    if (body.colors && Array.isArray(body.colors)) {
      for (const [index, colorData] of body.colors.entries()) {
        const colorName = colorData.colorName;
        const colorCode = colorData.colorCode;
        const colorId = colorData._id;

        if (!colorName || !colorCode) continue;

        // Upload new images if any
        const imageFiles = files[`colors[${index}][images]`] || [];
        const uploadPromises = imageFiles.map(async (file) => {
          const uploadedImage = await uploadImage(file);
          return uploadedImage.url;
        });
        const newImages = await Promise.all(uploadPromises);

        // Find existing color by _id
        const existingColor = product.colors.find(
          (c) => c._id.toString() === colorId
        );

        console.log("existingColor", existingColor);

        let finalImages = [];
        if (existingColor) {
          // For existing color, combine kept images with new ones
          const imagesToKeep = colorData.imagesToKeep || [];
          finalImages = [...imagesToKeep, ...newImages];
        } else {
          // For new color, just use new images
          finalImages = newImages;
        }

        updatedColors.push({
          _id: colorId || new mongoose.Types.ObjectId(),
          colorName,
          colorCode,
          images: finalImages,
        });
      }
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: body.name,
          description: body.description,
          price: Number(body.price),
          releaseDate: body.releaseDate ? new Date(body.releaseDate) : null,
          stock: Number(body.stock),
          type: body.type,
          chip: body.chip,
          ram: body.ram,
          storage: body.storage,
          display: body.display,
          battery: body.battery,
          camera: body.camera,
          os: body.os,
          productType: body.productType,
          capacities: capacities,
          colors: updatedColors,
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Update error:", error);
    res
      .status(400)
      .json({ error: error.message || "Lỗi khi cập nhật sản phẩm" });
  }
};

module.exports = updateProduct;

// Route vẫn giữ nguyên

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Xóa tất cả images của sản phẩm
    for (const color of product.colors) {
      for (const image of color.images) {
        try {
          const imagePath = path.join(__dirname, "../uploads", image);
          await fs.unlink(imagePath);
        } catch (err) {
          console.error(`Không thể xóa file ${image}:`, err);
        }
      }
    }

    // Xóa sản phẩm từ database
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Sản phẩm và hình ảnh đã được xóa" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  getOneProduct,
  deleteProduct,
};
