const express = require('express');
const router = express.Router();

const { registerPassenger, loginPassenger, verifyPassengerEmail, resendOTP } = require('../controller/passengerAuthController');

router.post('/register', registerPassenger);
router.post('/login', loginPassenger);
router.get('/verify/:token', verifyPassengerEmail);
router.post('/verify-email', verifyPassengerEmail);
router.post('/resend-otp', resendOTP);

module.exports = router;
