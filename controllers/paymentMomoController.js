// Create a new class

const PaymentMomo = require("../models/PaymentMomo");
const crypto = require("crypto");
const axios = require("axios");
const express = require("express");
const app = express();
const Order = require("../models/Order");
const Product = require("../models/Product");

// Get all classes
exports.getAllPayment = async (req, res) => {
  try {
    const payments = await PaymentMomo.find();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getPaymentById = async (req, res) => {
  console.log(req.params.studentId);
  try {
    const course = await PaymentMomo.find({
      "student.student_id": req.params.studentId,
    });
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const config = {
  accessKey: "F8BBA842ECF85",
  secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  orderInfo: "Thanh toán hóa đơn với MoMo",
  partnerCode: "MOMO",
  redirectUrl: "http://localhost:3000/home",
  ipnUrl:
    "https://1d4a-2402-800-620e-d955-54e8-31f3-7cac-cb50.ngrok-free.app/api/payments/callback",
  requestType: "captureWallet",
  extraData: "",
  orderGroupId: "",
  autoCapture: true,
  lang: "vi",
};

exports.paymentMomo = async (req, res) => {
  const { order, amount, user, orderId } = req.body;

  let {
    accessKey,
    secretKey,
    orderInfo,
    partnerCode,
    redirectUrl,
    ipnUrl,
    requestType,
    extraData,
    orderGroupId,
    autoCapture,
    lang,
  } = config;

  var requestId = orderId;

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = JSON.stringify({
    partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang,
    requestType,
    autoCapture,
    extraData,
    orderGroupId,
    signature,
  });

  const options = {
    method: "POST",
    url: "https://test-payment.momo.vn/v2/gateway/api/create",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
    data: requestBody,
  };

  try {
    const result = await axios(options);
    const data = result.data;
    if (data.payUrl) {
      const newPaymentMomo = new PaymentMomo({
        orderId: data.orderId,
        order: order,
        user: user,
      });
      await newPaymentMomo.save();
    } else {
      console.error("Failed to generate MoMo payment URL:", data);
      return res
        .status(500)
        .json({ message: "Failed to generate MoMo payment URL", data });
    }
    return res.status(200).json(result.data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ statusCode: 500, message: error.message });
  }
};

exports.callBack = async (req, res) => {
  //console.log("Callback received:", req.body); // Log the entire request body
  const { resultCode, orderId } = req.body;
  console.log("resultCode:", resultCode, "orderId:", orderId);
  console.log("asd", req.body.orderId);
  try {
    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const paymentMomo = await PaymentMomo.findOne({
      orderId: orderId,
    });

    const updateStatusBill = await Order.findOne({
      orderId: orderId,
    });

    const cartItems = updateStatusBill.cartItems;

    if (!updateStatusBill) {
      return res.status(404).json({ message: "Bill not found" });
    } else if (resultCode === 0) {
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
      updateStatusBill.statusPayment = "Đã thanh toán";
      updateStatusBill.formOfPayment = "Thanh toán qua ví Momo";
      updateStatusBill.orderSuccess = true;
      updateStatusBill.pay = req.body;

      await axios.post(`http://localhost:8080/api/emails/emailOrder`, {
        email: updateStatusBill.user.email,
        username: updateStatusBill.name || updateStatusBill.user.username,
        price: updateStatusBill.totalPrice,
        products: updateStatusBill.cartItems,
        orderId: orderId,
        selected: updateStatusBill.formOfPayment,
        delivery: updateStatusBill.deliveryMethod,
        phone: updateStatusBill.phone,
        ward: updateStatusBill.ward,
        district: updateStatusBill.district,
        province: updateStatusBill.province,
        note: updateStatusBill.note,
        store: updateStatusBill.store,
        statusPayment: "Đã thanh toán",
      });
      await updateStatusBill.save();
    } else {
      updateStatusBill.pay = [];
      return res
        .status(400)
        .json({ message: "Thanh toán thất bại hoặc bị hủy" });
    }

    if (!paymentMomo) {
      return res.status(404).json({ message: "Payment not found" });
    }
    if (resultCode === 0) {
      paymentMomo.pay = req.body;

      // Cập nhật paymentStatus trong bảng registerCourse

      await paymentMomo.save();
    } else {
      paymentMomo.pay = [];
      return res
        .status(400)
        .json({ message: "Thanh toán thất bại hoặc bị hủy" });
    }
  } catch (error) {
    console.error("Error processing callback:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
  /**
    resultCode = 0: giao dịch thành công.
    resultCode = 9000: giao dịch được cấp quyền (authorization) thành công .
    resultCode <> 0: giao dịch thất bại.
   */
  /**
   * Dựa vào kết quả này để update trạng thái đơn hàng
   * Kết quả log:
   * {
        partnerCode: 'MOMO',
        orderId: 'MOMO1712108682648',
        requestId: 'MOMO1712108682648',
        amount: 10000,
        orderInfo: 'pay with MoMo',
        orderType: 'momo_wallet',
        transId: 4014083433,
        resultCode: 0,
        message: 'Thành công.',
        payType: 'qr',
        responseTime: 1712108811069,
        extraData: '',
        signature: '10398fbe70cd3052f443da99f7c4befbf49ab0d0c6cd7dc14efffd6e09a526c0'
      }
   */

  return res.status(204).json(req.body);
};

exports.checkStatusPayment = async (req, res) => {
  const { orderId } = req.body;

  // const signature = accessKey=$accessKey&orderId=$orderId&partnerCode=$partnerCode
  // &requestId=$requestId
  var secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  var accessKey = "F8BBA842ECF85";
  const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = JSON.stringify({
    partnerCode: "MOMO",
    requestId: orderId,
    orderId: orderId,
    signature: signature,
    lang: "vi",
  });

  // options for axios
  const options = {
    method: "POST",
    url: "https://test-payment.momo.vn/v2/gateway/api/query",
    headers: {
      "Content-Type": "application/json",
    },
    data: requestBody,
  };

  const result = await axios(options);

  return res.status(200).json(result.data);
};
