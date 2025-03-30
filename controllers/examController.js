const Exam = require("../models/Exam");

// Lấy danh sách kỳ thi
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find();
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo kỳ thi mới
const createExam = async (req, res) => {
  const { name, date } = req.body;
  try {
    const newExam = new Exam({ name, date });
    await newExam.save();
    res.status(201).json(newExam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật kỳ thi
const updateExam = async (req, res) => {
  const { id } = req.params;
  const { name, date } = req.body;

  try {
    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      { name, date },
      { new: true }
    );
    if (!updatedExam)
      return res.status(404).json({ message: "Không tìm thấy kỳ thi" });
    res.status(200).json(updatedExam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa kỳ thi
const deleteExam = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedExam = await Exam.findByIdAndDelete(id);
    if (!deletedExam)
      return res.status(404).json({ message: "Không tìm thấy kỳ thi" });
    res.status(200).json({ message: "Xóa kỳ thi thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getExams, createExam, updateExam, deleteExam };
