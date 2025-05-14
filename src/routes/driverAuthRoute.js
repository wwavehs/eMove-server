const express = require('express');
const router = express.Router();

const { registerDriver, loginDriver, verifyEmail, resendOTP } = require('../controller/driverAuthController');

router.post('/register', registerDriver);
router.post('/login', loginDriver);
router.get('/verify/:token', verifyEmail);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);


module.exports = router;
