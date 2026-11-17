const Deck = require('../models/Deck');
const Flashcard = require('../models/Flashcard');

// GET /api/decks
exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.subject) {
      filter.subject = req.query.subject;
    }
    // Show public decks and user's own decks
    filter.$or = [{ isPublic: true }, { owner: req.user._id }];

    const decks = await Deck.find(filter)
      .populate('subject', 'name icon')
      .populate('owner', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ decks });
  } catch (error) {
    next(error);
  }
};

// GET /api/decks/:id
exports.getById = async (req, res, next) => {
  try {
    const deck = await Deck.findById(req.params.id)
      .populate('subject', 'name icon')
      .populate('owner', 'name');

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found.' });
    }

    const cards = await Flashcard.find({ deck: deck._id }).sort({ createdAt: -1 });

    res.status(200).json({ deck, cards });
  } catch (error) {
    next(error);
  }
};

// POST /api/decks
exports.create = async (req, res, next) => {
  try {
    const { name, description, subject, isPublic } = req.body;
    const deck = new Deck({
      name,
      description,
      subject,
      owner: req.user._id,
      isPublic: isPublic !== undefined ? isPublic : true
    });
    await deck.save();

    res.status(201).json({ deck });
  } catch (error) {
    next(error);
  }
};

// PUT /api/decks/:id
exports.update = async (req, res, next) => {
  try {
    const deck = await Deck.findById(req.params.id);
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found.' });
    }
    if (deck.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this deck.' });
    }

    const { name, description, isPublic } = req.body;
    if (name !== undefined) deck.name = name;
    if (description !== undefined) deck.description = description;
    if (isPublic !== undefined) deck.isPublic = isPublic;

    await deck.save();
    res.status(200).json({ deck });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/decks/:id
exports.delete = async (req, res, next) => {
  try {
    const deck = await Deck.findById(req.params.id);
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found.' });
    }
    if (deck.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this deck.' });
    }

    // Decrement subject cardCount
    const Subject = require('../models/Subject');
    await Subject.findByIdAndUpdate(deck.subject, {
      $inc: { cardCount: -deck.cardCount }
    });

    await Flashcard.deleteMany({ deck: deck._id });
    await Deck.findByIdAndDelete(deck._id);

    res.status(200).json({ message: 'Deck and its cards deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
