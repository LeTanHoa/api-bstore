const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    user: Object,
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
