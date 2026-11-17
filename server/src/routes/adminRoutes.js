const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');

const questionValidation = [
  body('subject').notEmpty().withMessage('Subject ID is required'),
  body('questionText').trim().notEmpty().withMessage('Question text is required'),
  body('options').isArray({ min: 2 }).withMessage('At least 2 options are required'),
  body('correctIndex').isInt({ min: 0 }).withMessage('Valid correctIndex is required'),
  validate
];

// All admin routes strictly require authentication AND role: 'admin'
router.use(auth, roleCheck(['admin']));

// Analytics & Overview
router.get('/stats', adminController.getStats);

// Student Progress & Data (Excludes admin profiles to preserve admin privacy)
router.get('/students', adminController.getStudents);
router.get('/students/:id', adminController.getStudentById);

// Question Bank Management
router.get('/questions', adminController.getQuestions);
router.post('/questions', questionValidation, adminController.createQuestion);
router.put('/questions/:id', adminController.updateQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);

// Legacy users route (sanitized to exclude admin profiles)
router.get('/users', adminController.getUsers);

module.exports = router;
