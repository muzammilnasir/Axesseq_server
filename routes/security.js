const express = require('express')
const router = express.Router()
const { securityForm, getSecurityQuestions } = require('../controllers/securityController')

router.post("/security-questions/submit", securityForm)
router.get("/security-question", getSecurityQuestions)

module.exports = router;