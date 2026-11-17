const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const deckController = require('../controllers/deckController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const deckValidation = [
  body('name').trim().notEmpty().withMessage('Deck name is required'),
  body('subject').notEmpty().withMessage('Subject ID is required'),
  validate
];

router.get('/', auth, deckController.getAll);
router.get('/:id', auth, deckController.getById);
router.post('/', auth, deckValidation, deckController.create);
router.put('/:id', auth, deckController.update);
router.delete('/:id', auth, deckController.delete);

module.exports = router;

