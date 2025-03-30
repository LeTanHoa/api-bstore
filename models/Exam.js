const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
});

module.exports = mongoose.model('Exam', examSchema);
