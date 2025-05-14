const otpService = require('../services/otpService');

exports.otpLogin = async (req, res) => {
    try {
        const result = await otpService.generateOTP(req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error('OTP Generation Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to generate OTP"
        });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const result = await otpService.verifyOTP(req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to verify OTP"
        });
    }
};

exports.resendOTP = async (req, res) => {
    try {
        const result = await otpService.resendOTP(req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error('OTP Resend Error:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to resend OTP"
        });
    }
};
