const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  cardsReviewed: {
    type: Number,
    default: 0
  },
  quizzesTaken: {
    type: Number,
    default: 0
  },
  studyTimeMin: {
    type: Number,
    default: 0
  }
});

activityLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
