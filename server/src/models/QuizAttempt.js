const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  durationSec: {
    type: Number
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    selectedIndex: {
      type: Number
    },
    isCorrect: {
      type: Boolean
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

quizAttemptSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
