const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema({
  colorName: { type: String, required: true },
  colorCode: { type: String, required: true },
  images: { type: [String], default: [] },
}, { _id: true });

const productSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: String,
    price: { type: Number },
    releaseDate: Date,
    stock: { type: String, default: "0" },
    chip: String,
    ram: String,
    storage: String,
    display: String,
    battery: String,
    camera: String,
    os: String,
    productType: { type: String },
    type:String,
    capacities: [String],
    colors: [colorSchema],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
