const Deck = require('../models/Deck');
const Flashcard = require('../models/Flashcard');
const Subject = require('../models/Subject');

// GET /api/import-export/export/deck/:id
exports.exportDeck = async (req, res, next) => {
  try {
    const deck = await Deck.findById(req.params.id).populate('subject', 'name icon');
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    const cards = await Flashcard.find({ deck: deck._id }).select('front back topic');

    res.status(200).json({
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      deck: {
        name: deck.name,
        description: deck.description,
        subjectName: deck.subject ? deck.subject.name : null
      },
      cards: cards.map((c) => ({
        front: c.front,
        back: c.back,
        topic: c.topic
      }))
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/import-export/import/deck
exports.importDeck = async (req, res, next) => {
  try {
    const { deck, cards, subjectId } = req.body;

    if (!deck || !deck.name) {
      return res.status(400).json({ error: 'Deck information with name is required' });
    }

    let targetSubjectId = subjectId;
    if (!targetSubjectId && deck.subjectName) {
      const foundSubject = await Subject.findOne({ name: new RegExp(`^${deck.subjectName}$`, 'i') });
      if (foundSubject) targetSubjectId = foundSubject._id;
    }

    if (!targetSubjectId) {
      const defaultSubj = await Subject.findOne();
      if (!defaultSubj) {
        return res.status(400).json({ error: 'No subjects available to associate with the imported deck' });
      }
      targetSubjectId = defaultSubj._id;
    }

    // Create deck
    const newDeck = new Deck({
      name: deck.name,
      description: deck.description || '',
      subject: targetSubjectId,
      owner: req.user._id,
      cardCount: Array.isArray(cards) ? cards.length : 0
    });
    await newDeck.save();

    // Create flashcards
    if (Array.isArray(cards) && cards.length > 0) {
      const cardDocs = cards.map((card) => ({
        front: card.front,
        back: card.back,
        topic: card.topic || '',
        deck: newDeck._id,
        subject: targetSubjectId,
        owner: req.user._id,
        interval: 0,
        easiness: 2.5,
        repetitions: 0,
        nextReview: new Date()
      }));

      await Flashcard.insertMany(cardDocs);
      await Subject.findByIdAndUpdate(targetSubjectId, { $inc: { cardCount: cardDocs.length } });
    }

    res.status(201).json({
      message: 'Deck imported successfully',
      deck: newDeck,
      importedCardCount: Array.isArray(cards) ? cards.length : 0
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/import-export/export/subject/:id
exports.exportSubjectData = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const [decks, cards] = await Promise.all([
      Deck.find({ subject: subject._id }),
      Flashcard.find({ subject: subject._id }).select('front back topic')
    ]);

    res.status(200).json({
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      subject: {
        name: subject.name,
        description: subject.description,
        icon: subject.icon
      },
      decks: decks.map((d) => ({ name: d.name, description: d.description })),
      cards: cards.map((c) => ({ front: c.front, back: c.back, topic: c.topic }))
    });
  } catch (error) {
    next(error);
  }
};

