const express = require('express');
// const { requireSignin, adminMiddleware } = require('../../common-middleware');
const { initialData, codeFrequency, frequency, languages } = require('../controllers/initialData');
const router = express.Router();


router.post('/initialdata', initialData);
router.post('/code_frequency', codeFrequency);
router.get('/frequency', frequency);
router.get('/calculateAllLanguagesPercentages', languages )

module.exports = router;