const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    image: String,
    category: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("blog", blogSchema);
