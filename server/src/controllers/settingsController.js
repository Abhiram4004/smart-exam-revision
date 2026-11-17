const User = require('../models/User');

// GET /api/settings
exports.getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('settings examDate');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      settings: user.settings,
      examDate: user.examDate
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/settings
exports.updateSettings = async (req, res, next) => {
  try {
    const { theme, dailyGoal, timerEnabled, examDate } = req.body;
    const update = {};

    if (theme !== undefined) update['settings.theme'] = theme;
    if (dailyGoal !== undefined) update['settings.dailyGoal'] = Number(dailyGoal);
    if (timerEnabled !== undefined) update['settings.timerEnabled'] = Boolean(timerEnabled);
    if (examDate !== undefined) update.examDate = examDate ? new Date(examDate) : null;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true, runValidators: true }
    ).select('settings examDate');

    res.status(200).json({
      message: 'Settings updated successfully',
      settings: user.settings,
      examDate: user.examDate
    });
  } catch (error) {
    next(error);
  }
};

