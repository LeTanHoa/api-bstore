const Student = require("../models/Student");

const getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("examHistory");
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createStudent = async (req, res) => {
  const { name, age, clb, belt, examHistory } = req.body;

  try {
    const newStudent = new Student({ name, clb, age, belt, examHistory });
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, age, clb, belt, examHistory } = req.body;

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { name, age, clb, belt, examHistory },
      { new: true }
    ).populate("examHistory");

    if (!updatedStudent)
      return res.status(404).json({ message: "Không tìm thấy học sinh" });

    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent)
      return res.status(404).json({ message: "Không tìm thấy học sinh" });

    res.status(200).json({ message: "Xóa học sinh thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudents, createStudent, updateStudent, deleteStudent };
