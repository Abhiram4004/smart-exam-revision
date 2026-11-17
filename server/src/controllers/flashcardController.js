const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');
const Subject = require('../models/Subject');
const ActivityLog = require('../models/ActivityLog');
const sm2Algorithm = require('../utils/sm2Algorithm');

// GET /api/cards/deck/:deckId
exports.getByDeck = async (req, res, next) => {
  try {
    const cards = await Flashcard.find({ deck: req.params.deckId })
      .populate('subject', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ cards });
  } catch (error) {
    next(error);
  }
};

// GET /api/cards/due
exports.getDueCards = async (req, res, next) => {
  try {
    const now = new Date();
    const filter = {
      owner: req.user._id,
      nextReview: { $lte: now }
    };
    if (req.query.subject) {
      filter.subject = req.query.subject;
    }

    const cards = await Flashcard.find(filter)
      .populate('subject', 'name icon')
      .populate('deck', 'name')
      .sort({ nextReview: 1 });

    res.status(200).json({ cards, count: cards.length });
  } catch (error) {
    next(error);
  }
};

// POST /api/cards
exports.create = async (req, res, next) => {
  try {
    const { front, back, subject, topic, deck } = req.body;
    const card = new Flashcard({
      front,
      back,
      subject,
      topic,
      deck,
      owner: req.user._id
    });
    await card.save();

    // Increment counts
    if (deck) {
      await Deck.findByIdAndUpdate(deck, { $inc: { cardCount: 1 } });
    }
    await Subject.findByIdAndUpdate(subject, { $inc: { cardCount: 1 } });

    res.status(201).json({ card });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cards/:id
exports.update = async (req, res, next) => {
  try {
    const card = await Flashcard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Flashcard not found.' });
    }
    if (card.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this card.' });
    }

    const { front, back, topic } = req.body;
    if (front !== undefined) card.front = front;
    if (back !== undefined) card.back = back;
    if (topic !== undefined) card.topic = topic;

    await card.save();
    res.status(200).json({ card });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cards/:id
exports.delete = async (req, res, next) => {
  try {
    const card = await Flashcard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Flashcard not found.' });
    }
    if (card.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this card.' });
    }

    // Decrement counts
    if (card.deck) {
      await Deck.findByIdAndUpdate(card.deck, { $inc: { cardCount: -1 } });
    }
    await Subject.findByIdAndUpdate(card.subject, { $inc: { cardCount: -1 } });

    await Flashcard.findByIdAndDelete(card._id);

    res.status(200).json({ message: 'Flashcard deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/cards/:id/review
exports.reviewCard = async (req, res, next) => {
  try {
    const { quality } = req.body;
    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({ error: 'Quality must be between 0 and 5.' });
    }

    const card = await Flashcard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Flashcard not found.' });
    }

    // Apply SM-2 algorithm
    const result = sm2Algorithm(quality, card.repetitions, card.easiness, card.interval);
    card.repetitions = result.repetitions;
    card.easiness = result.easiness;
    card.interval = result.interval;
    card.nextReview = result.nextReview;
    await card.save();

    // Log activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await ActivityLog.findOneAndUpdate(
      { user: req.user._id, date: today },
      { $inc: { cardsReviewed: 1 } },
      { upsert: true, new: true }
    );

    // Update streak
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const lastStudy = user.streak.lastStudyDate;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    if (!lastStudy || lastStudy.getTime() < todayDate.getTime()) {
      const yesterday = new Date(todayDate);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastStudy && lastStudy.getTime() === yesterday.getTime()) {
        user.streak.current += 1;
      } else if (!lastStudy || lastStudy.getTime() < yesterday.getTime()) {
        user.streak.current = 1;
      }
      user.streak.lastStudyDate = todayDate;
      await user.save();
    }

    res.status(200).json({ card });
  } catch (error) {
    next(error);
  }
};
