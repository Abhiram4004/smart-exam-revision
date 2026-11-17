const User = require('../models/User');
const Subject = require('../models/Subject');
const Flashcard = require('../models/Flashcard');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const ActivityLog = require('../models/ActivityLog');

// GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalSubjects,
      totalCards,
      totalQuestions,
      totalQuizzes
    ] = await Promise.all([
      User.countDocuments(),
      Subject.countDocuments(),
      Flashcard.countDocuments(),
      Question.countDocuments(),
      QuizAttempt.countDocuments()
    ]);

    // Registrations in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Quizzes per day for last 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const quizAggregation = await QuizAttempt.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const quizzesLast7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = quizAggregation.find((item) => item._id === dateStr);
      quizzesLast7Days.push({
        date: dateStr,
        quizzes: match ? match.count : 0
      });
    }

    res.status(200).json({
      totalUsers,
      totalSubjects,
      totalCards,
      totalQuestions,
      totalQuizzes,
      recentUsers,
      quizzesLast7Days
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/questions
exports.getQuestions = async (req, res, next) => {
  try {
    const { subject, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate('subject', 'name icon')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Question.countDocuments(filter)
    ]);

    res.status(200).json({
      questions,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/questions
exports.createQuestion = async (req, res, next) => {
  try {
    const { subject, topic, questionText, options, correctIndex, explanation, difficulty } = req.body;

    const question = new Question({
      subject,
      topic,
      questionText,
      options,
      correctIndex,
      explanation,
      difficulty,
      createdBy: req.user._id
    });

    await question.save();
    await Subject.findByIdAndUpdate(subject, { $inc: { questionCount: 1 } });

    res.status(201).json({ question });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/questions/:id
exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.status(200).json({ question });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/questions/:id
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    await Subject.findByIdAndUpdate(question.subject, { $inc: { questionCount: -1 } });

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

