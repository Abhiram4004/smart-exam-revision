const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '📚'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cardCount: {
    type: Number,
    default: 0
  },
  questionCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subject', subjectSchema);
