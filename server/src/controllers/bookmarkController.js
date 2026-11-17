const Bookmark = require('../models/Bookmark');
const Flashcard = require('../models/Flashcard');
const Question = require('../models/Question');

// GET /api/bookmarks
exports.getAll = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.type) {
      filter.type = req.query.type;
    }

    const bookmarks = await Bookmark.find(filter).sort({ createdAt: -1 });

    // Populate references
    const populated = await Promise.all(
      bookmarks.map(async (bm) => {
        const bmObj = bm.toObject();
        if (bm.type === 'flashcard') {
          bmObj.item = await Flashcard.findById(bm.refId).populate('subject', 'name');
        } else if (bm.type === 'question') {
          bmObj.item = await Question.findById(bm.refId).populate('subject', 'name');
        }
        return bmObj;
      })
    );

    res.status(200).json({ bookmarks: populated });
  } catch (error) {
    next(error);
  }
};

// POST /api/bookmarks/toggle
exports.toggle = async (req, res, next) => {
  try {
    const { type, refId } = req.body;

    if (!type || !refId) {
      return res.status(400).json({ error: 'Type and refId are required.' });
    }

    const existing = await Bookmark.findOne({
      user: req.user._id,
      type,
      refId
    });

    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      return res.status(200).json({ bookmarked: false, message: 'Bookmark removed.' });
    }

    const bookmark = new Bookmark({
      user: req.user._id,
      type,
      refId
    });
    await bookmark.save();

    res.status(200).json({ bookmarked: true, bookmark });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/bookmarks/:id
exports.remove = async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found.' });
    }

    await Bookmark.findByIdAndDelete(bookmark._id);
    res.status(200).json({ message: 'Bookmark removed successfully.' });
  } catch (error) {
    next(error);
  }
};
