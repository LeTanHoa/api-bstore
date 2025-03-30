const Review = require("../models/Review");

// ✅ Lấy tất cả đánh giá
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Lỗi khi lấy đánh giá" });
  }
};

// ✅ Lấy đánh giá theo ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
};

// ✅ Thêm đánh giá mới
exports.createReview = async (req, res) => {
  try {
    const { productId, user, rating, comment } = req.body;
    const newReview = new Review({ productId, user, rating, comment });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Lỗi khi tạo đánh giá" });
  }
};

// ✅ Cập nhật đánh giá
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, comment },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật đánh giá" });
  }
};

// ✅ Xóa đánh giá
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }
    res.json({ message: "Xóa đánh giá thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa đánh giá" });
  }
};
