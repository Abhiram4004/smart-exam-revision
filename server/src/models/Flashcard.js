const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  front: {
    type: String,
    required: [true, 'Front content is required']
  },
  back: {
    type: String,
    required: [true, 'Back content is required']
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  topic: {
    type: String,
    default: ''
  },
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  interval: {
    type: Number,
    default: 0
  },
  easiness: {
    type: Number,
    default: 2.5
  },
  repetitions: {
    type: Number,
    default: 0
  },
  nextReview: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

flashcardSchema.index({ owner: 1, nextReview: 1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);
