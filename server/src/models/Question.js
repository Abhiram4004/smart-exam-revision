const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  topic: {
    type: String,
    default: ''
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required']
  },
  options: {
    type: [String],
    required: [true, 'Options are required'],
    validate: {
      validator: function (v) {
        return v && v.length >= 2;
      },
      message: 'At least 2 options are required'
    }
  },
  correctIndex: {
    type: Number,
    required: [true, 'Correct index is required']
  },
  explanation: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', questionSchema);
