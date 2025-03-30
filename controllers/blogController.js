const Blog = require("../models/Blog");

const blog = async (req, res) => {
  const { title, content, category } = req.body;
  try {
    const imagePath = req.file ? req.file.filename : null;
    console.log("Image Path:", imagePath);
    const newBlog = new Blog({
      title,
      content,
      category: category,
      image: imagePath,
    });
    await newBlog.save();
    res.json(newBlog);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create blog" });
  }
};
const getAllBlog = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};
const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, content, category } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.category = category || blog.category;

    if (image) blog.image = image;

    await blog.save();
    res.json({ message: "Blog updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update blog" });
  }
};
const deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete blog" });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "blog not found" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  blog,
  getAllBlog,
  updateBlog,
  deleteBlog,
  getBlogById,
};
