const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');

router.get('/', auth, quizController.getQuiz);
router.post('/submit', auth, quizController.submitQuiz);
router.get('/attempts', auth, quizController.getAttempts);
router.get('/attempts/:id', auth, quizController.getAttemptById);

module.exports = router;

