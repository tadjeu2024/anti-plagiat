const express = require('express');
const router = express.Router();
const plagiatController = require('../controllers/plagiatController');

// Route POST pour analyser un lien
router.post('/check-link', plagiatController.checkLink);

module.exports = router;