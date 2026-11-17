const User = require('../models/User');
const Flashcard = require('../models/Flashcard');
const QuizAttempt = require('../models/QuizAttempt');
const ActivityLog = require('../models/ActivityLog');
const Subject = require('../models/Subject');

// GET /api/progress/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Overall stats
    const [totalCardsReviewed, totalQuizzes, quizAttempts] = await Promise.all([
      ActivityLog.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$cardsReviewed' } } }
      ]),
      QuizAttempt.countDocuments({ user: userId }),
      QuizAttempt.find({ user: userId })
    ]);

    const totalReviewed = totalCardsReviewed.length > 0 ? totalCardsReviewed[0].total : 0;
    const avgScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((acc, a) => acc + (a.score / a.total) * 100, 0) / quizAttempts.length)
      : 0;

    // Per-subject stats
    const subjects = await Subject.find();
    const perSubject = await Promise.all(
      subjects.map(async (subj) => {
        const subjectAttempts = quizAttempts.filter(
          (a) => a.subject.toString() === subj._id.toString()
        );
        const accuracy = subjectAttempts.length > 0
          ? Math.round(
              subjectAttempts.reduce((acc, a) => acc + (a.score / a.total) * 100, 0) /
              subjectAttempts.length
            )
          : 0;

        const cardsMastered = await Flashcard.countDocuments({
          owner: userId,
          subject: subj._id,
          interval: { $gte: 21 }
        });

        return {
          subject: { _id: subj._id, name: subj.name, icon: subj.icon },
          accuracy,
          cardsMastered,
          quizCount: subjectAttempts.length
        };
      })
    );

    // Streak
    const user = await User.findById(userId);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    // Check if studied today
    const todayActivity = await ActivityLog.findOne({ user: userId, date: todayDate });
    const studiedToday = !!todayActivity && (todayActivity.cardsReviewed > 0 || todayActivity.quizzesTaken > 0);

    // Last 7 days activity
    const sevenDaysAgo = new Date(todayDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const recentActivity = await ActivityLog.find({
      user: userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });

    // Fill in missing days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayDate);
      date.setDate(date.getDate() - i);
      const activity = recentActivity.find(
        (a) => a.date.getTime() === date.getTime()
      );
      last7Days.push({
        date: date.toISOString().split('T')[0],
        cardsReviewed: activity ? activity.cardsReviewed : 0,
        quizzesTaken: activity ? activity.quizzesTaken : 0,
        studyTimeMin: activity ? activity.studyTimeMin : 0
      });
    }

    // Weak topics: subjects/topics with accuracy < 60% from last 10 quiz attempts
    const recentAttempts = await QuizAttempt.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('answers.question');

    const topicStats = {};
    recentAttempts.forEach((attempt) => {
      attempt.answers.forEach((ans) => {
        if (ans.question) {
          const key = `${ans.question.subject}_${ans.question.topic || 'General'}`;
          if (!topicStats[key]) {
            topicStats[key] = { subject: ans.question.subject, topic: ans.question.topic || 'General', correct: 0, total: 0 };
          }
          topicStats[key].total++;
          if (ans.isCorrect) topicStats[key].correct++;
        }
      });
    });

    const weakTopics = Object.values(topicStats)
      .map((t) => ({
        subject: t.subject,
        topic: t.topic,
        accuracy: Math.round((t.correct / t.total) * 100),
        total: t.total
      }))
      .filter((t) => t.accuracy < 60);

    // Daily goal progress
    const dailyGoal = user.settings.dailyGoal || 20;
    const todayCards = todayActivity ? todayActivity.cardsReviewed : 0;

    res.status(200).json({
      overallStats: {
        totalCardsReviewed: totalReviewed,
        totalQuizzes,
        averageScore: avgScore
      },
      perSubject,
      streak: {
        current: user.streak.current,
        studiedToday
      },
      last7Days,
      weakTopics,
      dailyGoal: {
        target: dailyGoal,
        completed: todayCards,
        percentage: Math.min(100, Math.round((todayCards / dailyGoal) * 100))
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/progress/weak-topics
exports.getWeakTopics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const recentAttempts = await QuizAttempt.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('answers.question')
      .populate('subject', 'name icon');

    const topicStats = {};
    recentAttempts.forEach((attempt) => {
      attempt.answers.forEach((ans) => {
        if (ans.question) {
          const topicName = ans.question.topic || 'General';
          const key = `${attempt.subject._id}_${topicName}`;
          if (!topicStats[key]) {
            topicStats[key] = {
              subject: { _id: attempt.subject._id, name: attempt.subject.name, icon: attempt.subject.icon },
              topic: topicName,
              correct: 0,
              total: 0
            };
          }
          topicStats[key].total++;
          if (ans.isCorrect) topicStats[key].correct++;
        }
      });
    });

    const weakTopics = Object.values(topicStats)
      .map((t) => ({
        ...t,
        accuracy: Math.round((t.correct / t.total) * 100)
      }))
      .filter((t) => t.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy);

    res.status(200).json({ weakTopics });
  } catch (error) {
    next(error);
  }
};

// POST /api/progress/reset
exports.resetProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      Flashcard.updateMany(
        { owner: userId },
        {
          $set: {
            interval: 0,
            easiness: 2.5,
            repetitions: 0,
            nextReview: new Date()
          }
        }
      ),
      QuizAttempt.deleteMany({ user: userId }),
      ActivityLog.deleteMany({ user: userId })
    ]);

    // Reset streak
    await User.findByIdAndUpdate(userId, {
      'streak.current': 0,
      'streak.lastStudyDate': null
    });

    res.status(200).json({ message: 'Progress reset successfully.' });
  } catch (error) {
    next(error);
  }
};
