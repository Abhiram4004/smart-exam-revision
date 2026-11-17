const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['flashcard', 'question'],
    required: true
  },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

bookmarkSchema.index({ user: 1, type: 1, refId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
