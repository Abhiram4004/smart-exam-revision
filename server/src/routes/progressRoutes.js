const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../middleware/auth');

router.get('/dashboard', auth, progressController.getDashboard);
router.get('/weak-topics', auth, progressController.getWeakTopics);
router.post('/reset', auth, progressController.resetProgress);

module.exports = router;

