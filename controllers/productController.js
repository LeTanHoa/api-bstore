const Product = require("../models/Product");
const fs = require("fs").promises;
const path = require("path");
const createProduct = async (req, res) => {
  try {
    const { body, files } = req;
    const capacities = body.capacities
      ? Array.isArray(body.capacities)
        ? body.capacities
        : [body.capacities]
      : [];

    const colors = [];
    const colorIndexes = new Set();

    Object.keys(files).forEach((key) => {
      const match = key.match(/^colors\[(\d+)\]/);
      if (match) {
        colorIndexes.add(Number(match[1]));
      }
    });

    colorIndexes.forEach((index) => {
      const colorName = body.colors[index].colorName;
      const colorCode = body.colors[index].colorCode;

      const images = files[`colors[${index}][images]`]
        ? files[`colors[${index}][images]`].map((file) => file.filename)
        : [];

      console.log("images", images);
      if (colorName && colorCode) {
        colors.push({ colorName, colorCode, images });
      }
    });
    const product = new Product({
      name: body.name,
      description: body.description,
      price: body.price,
      releaseDate: body.releaseDate ? new Date(body.releaseDate) : null,
      stock: body.stock,
      type: body.tpye,
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
    console.log(error);
    res.status(400).json({ error: error.message });
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
  const { body, files } = req;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const capacities = body.capacities
      ? Array.isArray(body.capacities)
        ? body.capacities
        : [body.capacities]
      : product.capacities;

    const colors = [];
    const colorIndexes = new Set();

    if (body.colors) {
      Object.keys(body.colors).forEach((index) => {
        colorIndexes.add(Number(index));
      });
    }
    if (files) {
      Object.keys(files).forEach((key) => {
        const match = key.match(/^colors\[(\d+)\]/);
        if (match) {
          colorIndexes.add(Number(match[1]));
        }
      });
    }

    colorIndexes.forEach((index) => {
      const existingColor = product.colors[index] || {};

      const colorName =
        body.colors?.[index]?.colorName || existingColor.colorName || "";
      const colorCode =
        body.colors?.[index]?.colorCode || existingColor.colorCode || "";

      let images = existingColor.images || [];

      const existingImages = body.colors?.[index]?.existingImages;
      if (existingImages) {
        images = Array.isArray(existingImages)
          ? existingImages
          : [existingImages];
      }

      if (files && files[`colors[${index}][images]`]) {
        const newImages = Array.isArray(files[`colors[${index}][images]`])
          ? files[`colors[${index}][images]`]
          : [files[`colors[${index}][images]`]];
        const newImageNames = newImages.map((file) => file.filename);
        images = [...images, ...newImageNames];
      }

      colors[index] = { colorName, colorCode, images };
    });

    const finalColors = colors.filter(Boolean);
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: body.name || product.name,
        description: body.description || product.description,
        price: body.price || product.price,
        releaseDate: body.releaseDate ? body.releaseDate : product.releaseDate,
        stock: body.stock || product.stock,
        chip: body.chip || product.chip,
        ram: body.ram || product.ram,
        storage: body.storage || product.storage,
        display: body.display || product.display,
        display: body.type || product.type,

        battery: body.battery || product.battery,
        camera: body.camera || product.camera,
        os: body.os || product.os,
        productType: body.productType || product.productType,
        capacities,
        colors: finalColors,
      },
      { new: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Update error:", error);
    res.status(400).json({ error: error.message });
  }
};

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
