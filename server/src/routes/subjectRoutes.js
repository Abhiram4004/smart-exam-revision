const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');

const subjectValidation = [
  body('name').trim().notEmpty().withMessage('Subject name is required'),
  validate
];

// Public routes
router.get('/', subjectController.getAll);
router.get('/:id', subjectController.getById);

// Admin-only routes
router.post('/', auth, roleCheck(['admin']), subjectValidation, subjectController.create);
router.put('/:id', auth, roleCheck(['admin']), subjectController.update);
router.delete('/:id', auth, roleCheck(['admin']), subjectController.delete);

module.exports = router;

