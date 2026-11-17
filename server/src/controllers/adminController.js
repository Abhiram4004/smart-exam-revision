const mongoose = require('mongoose');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Flashcard = require('../models/Flashcard');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const ActivityLog = require('../models/ActivityLog');

// GET /api/admin/stats
// Comprehensive platform analytics with student progress metrics
exports.getStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalSubjects,
      totalCards,
      totalQuestions,
      totalQuizzes,
      allAttempts,
      allActivityLogs
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Subject.countDocuments(),
      Flashcard.countDocuments(),
      Question.countDocuments(),
      QuizAttempt.countDocuments(),
      QuizAttempt.find().select('score total createdAt user'),
      ActivityLog.find().select('cardsReviewed quizzesTaken timeSpentMinutes date')
    ]);

    // Registrations in last 30 days (students only)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentStudents = await User.countDocuments({
      role: { $ne: 'admin' },
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Total cards reviewed across all students
    const totalCardsReviewed = allActivityLogs.reduce((acc, log) => acc + (log.cardsReviewed || 0), 0);

    // Platform-wide average quiz score percentage
    const platformAverageScore = allAttempts.length > 0
      ? Math.round(
          allAttempts.reduce((acc, a) => acc + ((a.score / (a.total || 1)) * 100), 0) / allAttempts.length
        )
      : 0;

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

    // Top students by activity
    const studentsList = await User.find({ role: { $ne: 'admin' } })
      .select('name email streak createdAt')
      .limit(5);

    res.status(200).json({
      totalUsers: totalStudents,
      totalStudents,
      totalSubjects,
      totalCards,
      totalQuestions,
      totalQuizzes,
      totalCardsReviewed,
      platformAverageScore,
      recentUsers: recentStudents,
      quizzesLast7Days,
      topStudents: studentsList
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/students
// Returns live progress & performance records of all enrolled students
// Admin accounts are strictly excluded to preserve privacy
exports.getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: { $ne: 'admin' } })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    const studentData = await Promise.all(
      students.map(async (student) => {
        const [attempts, logs] = await Promise.all([
          QuizAttempt.find({ user: student._id })
            .populate('subject', 'name icon')
            .sort({ createdAt: -1 }),
          ActivityLog.find({ user: student._id }).sort({ date: -1 })
        ]);

        const quizzesTaken = attempts.length;
        const totalCardsReviewed = logs.reduce((acc, l) => acc + (l.cardsReviewed || 0), 0);
        const totalTimeSpentMinutes = logs.reduce((acc, l) => acc + (l.timeSpentMinutes || 0), 0);

        const averageScore = quizzesTaken > 0
          ? Math.round(
              attempts.reduce((acc, a) => acc + ((a.score / (a.total || 1)) * 100), 0) / quizzesTaken
            )
          : 0;

        // Determine last activity timestamp
        let lastActive = student.streak?.lastStudyDate || student.updatedAt || student.createdAt;
        if (attempts.length > 0 && attempts[0].createdAt > lastActive) {
          lastActive = attempts[0].createdAt;
        }

        const daysSinceActive = Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24));
        const status = daysSinceActive <= 3 ? 'Active' : daysSinceActive <= 7 ? 'Recent' : 'Inactive';

        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          createdAt: student.createdAt,
          lastActive,
          status,
          streak: student.streak?.current || 0,
          cardsReviewed: totalCardsReviewed,
          quizzesTaken,
          averageScore,
          timeSpentMinutes: totalTimeSpentMinutes,
          recentAttempts: attempts.slice(0, 3).map((a) => ({
            id: a._id,
            subject: a.subject?.name || 'General',
            icon: a.subject?.icon || '📝',
            score: a.score,
            total: a.total,
            percentage: Math.round((a.score / (a.total || 1)) * 100),
            createdAt: a.createdAt
          }))
        };
      })
    );

    res.status(200).json({
      students: studentData,
      count: studentData.length
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/students/:id
// Drill-down individual student study performance
exports.getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID format.' });
    }

    const student = await User.findOne({ _id: id, role: { $ne: 'admin' } }).select('-passwordHash');
    if (!student) {
      return res.status(404).json({ error: 'Student record not found or access restricted.' });
    }

    const [attempts, logs, subjects] = await Promise.all([
      QuizAttempt.find({ user: student._id })
        .populate('subject', 'name icon')
        .sort({ createdAt: -1 }),
      ActivityLog.find({ user: student._id }).sort({ date: -1 }).limit(30),
      Subject.find()
    ]);

    const quizzesTaken = attempts.length;
    const cardsReviewed = logs.reduce((acc, l) => acc + (l.cardsReviewed || 0), 0);
    const avgScore = quizzesTaken > 0
      ? Math.round(
          attempts.reduce((acc, a) => acc + ((a.score / (a.total || 1)) * 100), 0) / quizzesTaken
        )
      : 0;

    // Subject breakdown for this student
    const subjectBreakdown = subjects.map((subj) => {
      const subjAttempts = attempts.filter((a) => a.subject?._id?.toString() === subj._id.toString());
      const totalScore = subjAttempts.reduce((acc, a) => acc + a.score, 0);
      const totalPossible = subjAttempts.reduce((acc, a) => acc + (a.total || 1), 0);
      const accuracy = subjAttempts.length > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
      return {
        subjectId: subj._id,
        name: subj.name,
        icon: subj.icon,
        attemptsCount: subjAttempts.length,
        accuracy
      };
    });

    res.status(200).json({
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        createdAt: student.createdAt,
        streak: student.streak?.current || 0,
        examDate: student.examDate
      },
      metrics: {
        quizzesTaken,
        cardsReviewed,
        avgScore,
        activityDaysCount: logs.length
      },
      subjectBreakdown,
      attempts,
      recentActivity: logs
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
// Returns student users only; admin credentials and admin users are protected and excluded
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};
