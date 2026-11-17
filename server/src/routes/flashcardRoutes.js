const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const flashcardController = require('../controllers/flashcardController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const flashcardValidation = [
  body('front').trim().notEmpty().withMessage('Front content is required'),
  body('back').trim().notEmpty().withMessage('Back content is required'),
  body('subject').notEmpty().withMessage('Subject ID is required'),
  validate
];

router.get('/deck/:deckId', auth, flashcardController.getByDeck);
router.get('/due', auth, flashcardController.getDueCards);
router.post('/', auth, flashcardValidation, flashcardController.create);
router.put('/:id', auth, flashcardController.update);
router.delete('/:id', auth, flashcardController.delete);
router.post('/:id/review', auth, flashcardController.reviewCard);

module.exports = router;

