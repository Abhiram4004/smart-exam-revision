const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Deck name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  cardCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Deck', deckSchema);
