const Subject = require('../models/Subject');
const Flashcard = require('../models/Flashcard');
const Question = require('../models/Question');
const Deck = require('../models/Deck');

// GET /api/subjects
exports.getAll = async (req, res, next) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    res.status(200).json({ subjects });
  } catch (error) {
    next(error);
  }
};

// GET /api/subjects/:id
exports.getById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found.' });
    }
    res.status(200).json({ subject });
  } catch (error) {
    next(error);
  }
};

// POST /api/subjects (admin)
exports.create = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    const subject = new Subject({
      name,
      description,
      icon,
      createdBy: req.user._id
    });
    await subject.save();
    res.status(201).json({ subject });
  } catch (error) {
    next(error);
  }
};

// PUT /api/subjects/:id (admin)
exports.update = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { name, description, icon },
      { new: true, runValidators: true }
    );
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found.' });
    }
    res.status(200).json({ subject });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/subjects/:id (admin)
exports.delete = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    await Promise.all([
      Flashcard.deleteMany({ subject: subject._id }),
      Question.deleteMany({ subject: subject._id }),
      Deck.deleteMany({ subject: subject._id }),
      Subject.findByIdAndDelete(subject._id)
    ]);

    res.status(200).json({ message: 'Subject and related data deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
