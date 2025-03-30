const express = require("express");
const route = express.Router();

const {
  blog,
  getAllBlog,
  updateBlog,
  deleteBlog,
  getBlogById,
} = require("../controllers/blogController.js");
const upload = require("../config/multerConfig.js");

route.post("/", upload.single("image"), blog);
route.get("/", getAllBlog);
route.get("/:id", getBlogById);

route.put("/:id", upload.single("image"), updateBlog);
route.delete("/:id", deleteBlog);
module.exports = route;
