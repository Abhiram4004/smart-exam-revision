const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const auth = require('../middleware/auth');

router.get('/', auth, bookmarkController.getAll);
router.post('/toggle', auth, bookmarkController.toggle);
router.delete('/:id', auth, bookmarkController.remove);

module.exports = router;

