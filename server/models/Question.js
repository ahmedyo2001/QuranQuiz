// models/Question.js

const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question_id: Number,
  surah: Number,
  ayah: Number,
  aya: String,
  word: String,
  options: [String],
  correct_option: String,
  question_aya: String,
});

module.exports = mongoose.model('quizzes', QuestionSchema);