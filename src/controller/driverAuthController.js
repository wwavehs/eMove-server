const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const Driver = require('../model/driverModel')
const otpService = require('../services/otpService')

exports.registerDriver = async (req, res) => {
    try {
        console.log('Files received:', req.files); // Debug log
        const { firstName, lastName, email, password, driversLicenseIdNumber } = req.body;
        const normalizedEmail = email.toLowerCase();
        const existingDriver = await Driver.findOne({ email: normalizedEmail });

        if (existingDriver) {
            if (existingDriver.isEmailVerified) {
                return res.status(400).json({ message: "Driver with this email already exists and is verified." });
            }
            // Check if the password matches the original
            const isPasswordValid = await bcrypt.compare(password, existingDriver.password);
            if (!isPasswordValid) {
                return res.status(409).json({
                    code: "USER_UNVERIFIED_PASSWORD_MISMATCH",
                    message: "An account with this email is pending verification. Please use the same password as your original registration."
                });
            }
            // Allow resending OTP if user is not verified and password matches
            console.log('Unverified driver exists, resending OTP to:', normalizedEmail);
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

        // Handle the uploaded files
        let licensePhotoUrl = null;
        let employeePhotoUrl = null;
        const filesToDelete = [];

        if (!req.files || !req.files.driversLicenseIdPhoto || !req.files.employeeIdPhoto) {
            return res.status(400).json({ message: "Both license and employee photos are required" });
        }

        try {
            console.log('Processing files:', Object.keys(req.files)); // Debug log

            // Handle license photo
            const licenseFile = req.files.driversLicenseIdPhoto[0];
            filesToDelete.push(licenseFile.path);
            const licenseResult = await cloudinary.uploader.upload(licenseFile.path, {
                folder: 'driver-licenses',
                resource_type: 'auto'
            });
            licensePhotoUrl = licenseResult.secure_url;
            console.log('License photo upload successful:', licenseResult);

            // Handle employee photo
            const employeeFile = req.files.employeeIdPhoto[0];
            filesToDelete.push(employeeFile.path);
            const employeeResult = await cloudinary.uploader.upload(employeeFile.path, {
                folder: 'employee-photos',
                resource_type: 'auto'
            });
            employeePhotoUrl = employeeResult.secure_url;
            console.log('Employee photo upload successful:', employeeResult);

            // Create and save the driver
            const hashedPassword = await bcrypt.hash(password, 10);
            const newDriver = new Driver({
                firstName,
                lastName,
                email: normalizedEmail,
                password: hashedPassword,
                driversLicenseIdNumber,
                driversLicenseIdPhoto: licensePhotoUrl,
                employeeIdPhoto: employeePhotoUrl
            });

            await newDriver.save();
            console.log('Driver saved with photos:', { licensePhotoUrl, employeePhotoUrl });

            // Generate and send OTP
            try {
                await otpService.generateOTP({ email: normalizedEmail });
                console.log('OTP sent to:', normalizedEmail);
            } catch (otpError) {
                console.error('OTP generation failed:', otpError);
                // Continue with registration even if OTP fails
            }

            // Clean up uploaded files
            await Promise.all(filesToDelete.map(file =>
                unlinkAsync(file).catch(err =>
                    console.error(`Error deleting file ${file}:`, err)
                )
            ));

            return res.status(201).json({
                message: 'Driver registered successfully. Please verify your email with the OTP sent.',
                email: normalizedEmail,
                licensePhotoUrl,
                employeePhotoUrl
            });

        } catch (uploadError) {
            console.error('Upload error:', uploadError);

            // Clean up any uploaded files
            await Promise.all(filesToDelete.map(file =>
                unlinkAsync(file).catch(err =>
                    console.error(`Error deleting file ${file}:`, err)
                )
            ));

            return res.status(500).json({
                message: "Error uploading photos",
                error: uploadError.message
            });
        }

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: "Error registering driver",
            error: error.message
        });
    }
}

exports.loginDriver = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingDriver = await Driver.findOne({ email });

        if (!existingDriver) {
            return res.status(400).json({ message: "Driver with this email does not exist" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingDriver.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        if (!existingDriver.isEmailVerified) {
            return res.status(400).json({ message: "Email not verified" });
        }

        if (!existingDriver.isApproved) {
            return res.status(400).json({ message: "Application not approved, please wait for approval" });
        }

        const populatedDriver = await Driver.findById(existingDriver._id).populate('assignedVehicle');

        const token = jwt.sign({ driverId: populatedDriver._id }, "passwordKey");

        res.status(200).json({
            token, user: {
                _id: populatedDriver._id,
                firstName: populatedDriver.firstName,
                lastName: populatedDriver.lastName,
                email: populatedDriver.email,
                driversLicenseIdNumber: populatedDriver.driversLicenseIdNumber,
                assignedVehicle: populatedDriver.assignedVehicle,
                driverStatus: populatedDriver.driverStatus,
            }
        })
    } catch (error) {
        res.status(500).json({ message: "Error logging in" });
    }
}

exports.verifyEmail = async (req, res) => {
    console.log('verifyEmail called with:', req.body);
    try {
        const { email, otp } = req.body;
        const verificationResponse = await otpService.verifyOTP({ email, otp });
        console.log('OTP verification response:', verificationResponse);

        if (verificationResponse.success) {
            const normalizedEmail = email.toLowerCase();
            console.log('Attempting to update driver with email:', normalizedEmail);
            const driver = await Driver.findOneAndUpdate(
                { email: normalizedEmail },
                { isEmailVerified: true, updatedAt: new Date() },
                { new: true }
            );
            if (!driver) {
                console.warn('Driver not found for email:', normalizedEmail);
                return res.status(404).json({ message: 'Driver not found' });
            }
            console.log('Updated driver:', driver);
            res.status(200).json({ message: 'Email verified successfully', driver });
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
        const { driverId, fcmToken } = req.body;
        const driver = await Driver.findByIdAndUpdate(driverId, { fcmToken }, { new: true });
        res.status(200).json({ message: 'FCM token updated successfully', driver });
    } catch (error) {
        res.status(500).json({ message: "Error updating FCM token" });
    }
}
