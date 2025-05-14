const crypto = require('crypto');
const otpGenerator = require('otp-generator');
const OTP = require('../model/otpModel');
const emailService = require('./emailService');
require('dotenv').config();

const OTP_SECRET = process.env.OTP_SECRET || crypto.randomBytes(32).toString('hex');
const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY || '600000'); // 10 minutes in milliseconds

exports.generateOTP = async (data) => {
    try {
        const { email } = data;

        if (!email) {
            throw { status: 400, message: 'Email is required' };
        }

        // Generate a 6 digit numeric OTP
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
            digits: true
        });

        // Hash the OTP
        const hashedOTP = crypto.createHmac('sha256', OTP_SECRET)
            .update(otp)
            .digest('hex');

        // Delete any existing OTP for this email
        await OTP.deleteMany({ email });

        // Create new OTP document
        const otpDoc = new OTP({
            email,
            otp: hashedOTP,
            expiresAt: new Date(Date.now() + OTP_EXPIRY)
        });

        await otpDoc.save();

        // Send email
        await emailService.sendVerificationEmail({ email, otp });

        return {
            success: true,
            message: "OTP sent successfully"
        };
    } catch (error) {
        console.error("Error in generating OTP:", error);
        throw error;
    }
};

exports.verifyOTP = async (data) => {
    try {
        const { email, otp } = data;

        if (!email || !otp) {
            throw { status: 400, message: 'Email and OTP are required' };
        }

        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) {
            throw { status: 400, message: 'No OTP found for this email' };
        }

        // Check if OTP is expired
        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ email });
            throw { status: 400, message: 'OTP has expired' };
        }

        // Verify OTP
        const hashedOTP = crypto.createHmac('sha256', OTP_SECRET)
            .update(otp)
            .digest('hex');

        if (hashedOTP !== otpRecord.otp) {
            throw { status: 400, message: 'Invalid OTP' };
        }

        // Delete the used OTP
        await OTP.deleteOne({ email });

        return {
            success: true,
            message: "OTP verified successfully"
        };
    } catch (error) {
        console.error("Error in verifying OTP:", error);
        throw error;
    }
};

exports.resendOTP = async (data) => {
    try {
        const { email } = data;

        if (!email) {
            throw { status: 400, message: 'Email is required' };
        }

        // Delete existing OTP if any
        await OTP.deleteOne({ email });

        // Generate new OTP
        return await this.generateOTP({ email });
    } catch (error) {
        console.error("Error in resending OTP:", error);
        throw error;
    }
};
