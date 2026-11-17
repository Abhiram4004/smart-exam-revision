const User = require('../models/User');
const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');
const QuizAttempt = require('../models/QuizAttempt');
const Bookmark = require('../models/Bookmark');
const ActivityLog = require('../models/ActivityLog');
const generateToken = require('../utils/generateToken');

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const user = new User({
      name,
      email,
      passwordHash: password
    });
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.status(200).json({
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    user.passwordHash = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/auth/account
exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      Flashcard.deleteMany({ owner: userId }),
      Deck.deleteMany({ owner: userId }),
      QuizAttempt.deleteMany({ user: userId }),
      Bookmark.deleteMany({ user: userId }),
      ActivityLog.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId)
    ]);

    res.status(200).json({ message: 'Account deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
