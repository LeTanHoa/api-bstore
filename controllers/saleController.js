const FlashSale = require("../models/flashSale");
const Product = require("../models/Product");
// Get active flash sales
exports.getActiveFlashSales = async (req, res) => {
  try {
    const flashSales = await FlashSale.find({
      startTime: { $lte: new Date() },
      endTime: { $gte: new Date() },
      status: "active",
    }).populate("products");

    res.status(200).json({
      success: true,
      data: flashSales,
    });
  } catch (error) {
    console.error("Error getting active flash sales:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách flash sale",
      error: error.message,
    });
  }
};

// Get all flash sales
exports.getAllFlashSales = async (req, res) => {
  try {
    const flashSales = await FlashSale.find().populate("products");

    res.status(200).json({
      success: true,
      data: flashSales,
    });
  } catch (error) {
    console.error("Error getting all flash sales:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách flash sale",
      error: error.message,
    });
  }
};

// Get flash sale by ID
exports.getFlashSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "ID flash sale không hợp lệ",
      });
    }

    const flashSale = await FlashSale.findById(id).populate("products");

    if (!flashSale) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy flash sale",
      });
    }

    res.status(200).json({
      success: true,
      data: flashSale,
    });
  } catch (error) {
    console.error("Error getting flash sale:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin flash sale",
      error: error.message,
    });
  }
};

// Create new flash sale
exports.createFlashSale = async (req, res) => {
  try {
    const { startTime, endTime, products, discount, status } = req.body;

    // Validate required fields
    if (!startTime || !endTime || !products || !discount) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin flash sale",
      });
    }

    // Create flash sale
    const flashSale = await FlashSale.create({
      startTime,
      endTime,
      products,
      discount,
      status: status || "active",
    });

    // Populate products before sending response
    await flashSale.populate("products");

    res.status(201).json({
      success: true,
      message: "Tạo flash sale thành công",
      data: flashSale,
    });
  } catch (error) {
    console.error("Error creating flash sale:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo flash sale",
      error: error.message,
    });
  }
};

// Update flash sale
exports.updateFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "ID flash sale không hợp lệ",
      });
    }

    const flashSale = await FlashSale.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("products");

    if (!flashSale) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy flash sale",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật flash sale thành công",
      data: flashSale,
    });
  } catch (error) {
    console.error("Error updating flash sale:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật flash sale",
      error: error.message,
    });
  }
};

// Delete flash sale
exports.deleteFlashSale = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "ID flash sale không hợp lệ",
      });
    }

    const flashSale = await FlashSale.findByIdAndDelete(id);

    if (!flashSale) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy flash sale",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa flash sale thành công",
    });
  } catch (error) {
    console.error("Error deleting flash sale:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa flash sale",
      error: error.message,
    });
  }
};
