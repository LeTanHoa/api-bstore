const Order = require("../models/Order");
const Product = require("../models/Product");

exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

// Lấy danh sách đơn hàng (Read)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy đơn hàng theo ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật đơn hàng (Update)
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Xóa đơn hàng (Delete)
exports.deleteOrder = async (req, res) => {
  try {
    const result = await Order.findByIdAndDelete(req.params.id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Đơn hàng không tồn tại" });
    }
    res.json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

exports.getOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy đơn hàng với orderId: ${orderId}`,
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy đơn hàng",
      error: error.message,
    });
  }
};
exports.orderUpdateStatusPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod } = req.body;

    console.log("orderId", orderId);

    // Tìm đơn hàng theo orderId
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy đơn hàng với orderId: ${orderId}`,
      });
    }

    // Kiểm tra nếu đã thanh toán rồi thì không xử lý lại
    if (order.statusPayment === "Đã thanh toán") {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng đã được thanh toán trước đó",
      });
    }

    // Lấy danh sách sản phẩm từ cartItems
    const cartItems = order.cartItems;
    // Cập nhật stock cho từng sản phẩm
    for (const item of cartItems) {
      const product = await Product.findById(item.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sản phẩm với _id: ${item.id}`,
        });
      }

      // Trừ stock
      const newStock = parseInt(product.stock) - parseInt(item.quantity);
      if (newStock < 0) {
        return res.status(400).json({
          success: false,
          message: `Số lượng tồn kho không đủ cho sản phẩm: ${product.name}`,
        });
      }

      product.stock = newStock;
      await product.save();
    }

    order.formOfPayment = paymentMethod;
    order.orderSuccess = true;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thanh toán và stock thành công",
      order,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái thanh toán:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật trạng thái thanh toán",
      error: error.message,
    });
  }
};
exports.changeStatusDelivery = async (req, res) => {
  const { newStatus } = req.body;
  const { id } = req.params;

  // Trạng thái hệ thống (dành cho admin)
  const systemStatuses = [
    "Chờ xác nhận",
    "Đã xác nhận",
    "Đang giao",
    "Hoàn thành",
    "Hủy bỏ",
    "Trả hàng",
  ];

  // Trạng thái người dùng gửi lên và ánh xạ sang trạng thái hệ thống
  const userStatusMapping = {
    "Chưa nhận được hàng": "Đang giao",
    "Đã nhận được hàng": "Hoàn thành",
    "Yêu cầu trả hàng": "Trả hàng",
  };

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra xem trạng thái mới có hợp lệ không
    let finalStatus = newStatus;
    if (userStatusMapping[newStatus]) {
      finalStatus = userStatusMapping[newStatus]; // Ánh xạ trạng thái user sang hệ thống
    }

    if (!systemStatuses.includes(finalStatus)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    // Logic kiểm tra trạng thái hiện tại
    if (
      order.deliveryStatus === "Hủy bỏ" ||
      order.deliveryStatus === "Hoàn thành"
    ) {
      return res.status(400).json({
        message:
          "Không thể thay đổi trạng thái của đơn hàng đã hoàn thành hoặc hủy",
      });
    }

    // Chỉ cho phép user thay đổi khi đơn hàng đang ở trạng thái "Đang giao"
    // if (!req.user.role === "admin" && order.deliveryStatus !== "Đang giao") {
    //   return res
    //     .status(403)
    //     .json({ message: "Bạn không có quyền thay đổi trạng thái này" });
    // }

    order.deliveryStatus = finalStatus;

    // Cập nhật trạng thái thanh toán nếu cần
    if (finalStatus === "Hoàn thành") {
      order.statusPayment = "Đã thanh toán";
    } else if (finalStatus === "Hủy bỏ") {
      order.statusPayment = "Đã hủy";
    }

    await order.save();
    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
