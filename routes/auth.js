const express = require('express');
const { signup, signin, signout, resetPassword } = require('../controllers/auth');
const { validateSignupRequest, isRequestValidated, validateSigninRequest } = require('../validator/auth');
const router = express.Router();


// router.post('/signup',validateSignupRequest, isRequestValidated, signup);
router.post('/signup', signup);
router.post('/signin',validateSigninRequest, isRequestValidated, signin);
router.post('/reset', resetPassword);
router.post('/signout', signout)

// router.post('/profile', requireSignin, (req, res) => {
//     res.status(200).json({ user: 'profile' })
// });

module.exports = router;