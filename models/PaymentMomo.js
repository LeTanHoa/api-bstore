const mongoose = require("mongoose");

const PaymentMomoSchema = new mongoose.Schema(
  {
    user: {
      type: Object,
    },
    orderId: {
      type: String,
    },
    order: {
      type: Array,
    },
    pay: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PaymentMomo", PaymentMomoSchema);
