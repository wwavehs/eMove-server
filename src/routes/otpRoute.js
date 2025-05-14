const otpController = require('../controller/otpController');
const express = require('express');
const router = express.Router();

router.post('/generate', otpController.otpLogin);
router.post('/verify', otpController.verifyOTP);
router.post('/resend', otpController.resendOTP);

module.exports = router;
