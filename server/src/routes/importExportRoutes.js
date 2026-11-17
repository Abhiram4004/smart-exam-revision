const express = require('express');
const router = express.Router();
const importExportController = require('../controllers/importExportController');
const auth = require('../middleware/auth');

router.get('/export/deck/:id', auth, importExportController.exportDeck);
router.post('/import/deck', auth, importExportController.importDeck);
router.get('/export/subject/:id', auth, importExportController.exportSubjectData);

module.exports = router;

