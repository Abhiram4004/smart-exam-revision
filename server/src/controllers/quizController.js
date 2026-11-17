const mongoose = require('mongoose');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const ActivityLog = require('../models/ActivityLog');

// GET /api/quiz
exports.getQuiz = async (req, res, next) => {
  try {
    const { subject, count = 10, topic } = req.query;

    if (!subject) {
      return res.status(400).json({ error: 'Subject query parameter is required.' });
    }

    const filter = {};
    if (mongoose.Types.ObjectId.isValid(subject)) {
      filter.subject = new mongoose.Types.ObjectId(subject);
    } else {
      filter.subject = subject;
    }

    if (topic) {
      filter.topic = topic;
    }

    const sampleSize = parseInt(count, 10) || 10;
    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: sampleSize } },
      {
        $project: {
          subject: 1,
          topic: 1,
          questionText: 1,
          options: 1,
          difficulty: 1,
          _id: 1
        }
      }
    ]);

    res.status(200).json({ questions, count: questions.length });
  } catch (error) {
    next(error);
  }
};

// POST /api/quiz/submit
exports.submitQuiz = async (req, res, next) => {
  try {
    const { subject, answers, durationSec } = req.body;

    if (!subject || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Subject and answers array are required.' });
    }

    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q._id.toString()] = q;
    });

    let score = 0;
    const processedAnswers = answers.map((answer) => {
      const question = questionMap[answer.questionId];
      if (!question) {
        return { question: answer.questionId, selectedIndex: answer.selectedIndex, isCorrect: false };
      }
      const isCorrect = question.correctIndex === answer.selectedIndex;
      if (isCorrect) score++;
      return {
        question: question._id,
        selectedIndex: answer.selectedIndex,
        isCorrect
      };
    });

    const attempt = new QuizAttempt({
      user: req.user._id,
      subject,
      score,
      total: answers.length,
      durationSec,
      answers: processedAnswers
    });
    await attempt.save();

    // Update activity log
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await ActivityLog.findOneAndUpdate(
      { user: req.user._id, date: today },
      { $inc: { quizzesTaken: 1 } },
      { upsert: true, new: true }
    );

    // Build result with correct answers and explanations
    const results = answers.map((answer) => {
      const question = questionMap[answer.questionId];
      if (!question) {
        return { questionId: answer.questionId, selectedIndex: answer.selectedIndex, isCorrect: false };
      }
      return {
        questionId: question._id,
        questionText: question.questionText,
        selectedIndex: answer.selectedIndex,
        correctIndex: question.correctIndex,
        isCorrect: question.correctIndex === answer.selectedIndex,
        explanation: question.explanation
      };
    });

    res.status(201).json({
      attempt: {
        _id: attempt._id,
        score,
        total: answers.length,
        percentage: Math.round((score / answers.length) * 100)
      },
      results
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/quiz/attempts
exports.getAttempts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (req.query.subject) {
      filter.subject = req.query.subject;
    }

    const [attempts, total] = await Promise.all([
      QuizAttempt.find(filter)
        .populate('subject', 'name icon')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      QuizAttempt.countDocuments(filter)
    ]);

    res.status(200).json({
      attempts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/quiz/attempts/:id
exports.getAttemptById = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('subject', 'name icon')
      .populate('answers.question');

    if (!attempt) {
      return res.status(404).json({ error: 'Quiz attempt not found.' });
    }

    res.status(200).json({ attempt });
  } catch (error) {
    next(error);
  }
};
