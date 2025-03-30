const mongoose = require("mongoose");

const flashSaleSchema = new mongoose.Schema(
  {
    discount: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "active", "ended"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FlashSale", flashSaleSchema);
