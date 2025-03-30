const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  clb: { type: String, required: true },
  belt: { type: String, required: true }, // Đai karate
  examHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
});

module.exports = mongoose.model("Student", studentSchema);
