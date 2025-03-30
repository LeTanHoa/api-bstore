const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    user: Object,
    orderId: String,
    gender: String,
    name: String,
    phone: String,
    deliveryMethod: String,
    province: String,
    district: String,
    ward: String,
    note: String,
    notes: [String],

    cartItems: Object,
    totalPrice: String,
    store: String,
    statusPayment: {
      type: String,
      default: "Chưa thanh toán",
    },
    formOfPayment: {
      type: String,
      default: "",
    },
    pay: {
      type: Array,
      default: [],
    },
    deliveryStatus: {
      type: String,
      default: "Chờ xác nhận",
    },
    orderSuccess: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
