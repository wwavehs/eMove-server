const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const Passenger = require('../model/passengerModel')
const otpService = require('../services/otpService')

exports.registerPassenger = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const normalizedEmail = email.toLowerCase();
        const existingPassenger = await Passenger.findOne({ email: normalizedEmail });

        if (existingPassenger) {
            if (existingPassenger.isEmailVerified) {
                return res.status(400).json({ message: "Passenger with this email already exists and is verified." });
            } else {
                // Check if the password matches the original
                const isPasswordValid = await bcrypt.compare(password, existingPassenger.password);
                if (!isPasswordValid) {
                    return res.status(409).json({
                        code: "USER_UNVERIFIED_PASSWORD_MISMATCH",
                        message: "An account with this email is pending verification. Please use the same password as your original registration."
                    });
                }
                // Allow resending OTP if user is not verified and password matches
                console.log('Unverified passenger exists, resending OTP to:', normalizedEmail);
                try {
                    await otpService.generateOTP({ email: normalizedEmail });
                    return res.status(409).json({
                        code: "USER_UNVERIFIED",
                        message: "Account exists but is not verified. Verification email re-sent."
                    });
                } catch (otpError) {
                    console.error('Error resending OTP:', otpError);
                    return res.status(500).json({ message: "Error resending OTP" });
                }
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newPassenger = new Passenger({
            firstName,
            lastName,
            email: normalizedEmail,
            password: hashedPassword,
        });

        await newPassenger.save();
        console.log('New passenger saved, sending OTP to:', normalizedEmail);

        try {
            await otpService.generateOTP({ email: normalizedEmail });
        } catch (otpError) {
            console.error('OTP generation failed:', otpError);
            // You may choose to delete the newly created passenger here if OTP fails
        }

        res.status(201).json({
            message: 'Passenger registered successfully. Please verify your email with the OTP sent.',
            email: normalizedEmail
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: "Error registering passenger" });
    }
}

exports.loginPassenger = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();
        console.log('Attempting login for email:', normalizedEmail);

        const existingPassenger = await Passenger.findOne({ email: normalizedEmail });

        if (!existingPassenger) {
            console.log('No passenger found for email:', normalizedEmail);
            return res.status(400).json({ message: "Passenger with this email does not exist" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingPassenger.password);
        if (!isPasswordValid) {
            console.log('Invalid password for email:', normalizedEmail);
            return res.status(400).json({ message: "Invalid password" });
        }

        if (!existingPassenger.isEmailVerified) {
            console.log('Email not verified for:', normalizedEmail);
            return res.status(400).json({ message: "Email not verified" });
        }

        console.log('Passenger found and verified:', existingPassenger._id);
        const token = jwt.sign({ passengerId: existingPassenger._id }, "passwordKey");

        res.status(200).json({
            token,
            user: {
                _id: existingPassenger._id,
                firstName: existingPassenger.firstName,
                lastName: existingPassenger.lastName,
                email: existingPassenger.email,
                passengerStatus: existingPassenger.passengerStatus,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Error logging in" });
    }
}

exports.verifyPassengerEmail = async (req, res) => {
    console.log('verifyEmail called with:', req.body);
    try {
        const { email, otp } = req.body;
        const verificationResponse = await otpService.verifyOTP({ email, otp });
        console.log('OTP verification response:', verificationResponse);

        if (verificationResponse.success) {
            const normalizedEmail = email.toLowerCase();
            console.log('Attempting to update passenger with email:', normalizedEmail);
            const passenger = await Passenger.findOneAndUpdate(
                { email: normalizedEmail },
                { isEmailVerified: true, updatedAt: new Date() },
                { new: true }
            );
            if (!passenger) {
                console.warn('Passenger not found for email:', normalizedEmail);
                return res.status(404).json({ message: 'Passenger not found' });
            }
            console.log('Updated passenger:', passenger);
            res.status(200).json({ message: 'Email verified successfully', passenger });
        } else {
            res.status(400).json({ message: verificationResponse.message });
        }
    } catch (error) {
        console.error("Error during email verification:", error);
        res.status(500).json({ message: "Error verifying email" });
    }
};

exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        await otpService.generateOTP({ email });
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: "Error resending OTP" });
    }
}

exports.updateFCMToken = async (req, res) => {
    try {
        const { passengerId, fcmToken } = req.body;
        const passenger = await Passenger.findByIdAndUpdate(passengerId, { fcmToken }, { new: true });
        res.status(200).json({ message: 'FCM token updated successfully', passenger });
    } catch (error) {
        res.status(500).json({ message: "Error updating FCM token" });
    }
}
