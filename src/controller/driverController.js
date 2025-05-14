const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const Router = express.Router();
const Driver = require('../model/driverModel')
const Vehicle = require('../model/vehicleModel')
const nodemailer = require('nodemailer');
require('dotenv').config();

exports.updateDriverStatus = async (req, res) => {
    const { driverId } = req.params;
    const { isAvailable } = req.body;
    const driver = await Driver.findByIdAndUpdate(driverId, { isAvailable }, { new: true });
    if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
    }
    res.status(200).json(driver);
};

exports.getUnapprovedDrivers = async (req, res) => {
    try {
        const unapprovedDrivers = await Driver.find({ isApproved: false });
        res.status(200).json(unapprovedDrivers);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.approveDriver = async (req, res) => {
    try {
        const driver = await Driver.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false, // Don't fail on invalid certs
                ciphers: 'SSLv3'
            }
        });

        await transporter.verify();

        const mailOptions = {
            from: process.env.FROM || 'eMove App <noreply@yourapp.com>',
            to: driver.email,
            subject: 'Application Approved',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Application Approved</h2>
                    <p>Dear ${driver.firstName} ${driver.lastName},</p>
                    <p>Your application has been approved. You can now log in to your account.</p>
                    <p>Thank you for your application.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json(driver);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.rejectDriver = async (req, res) => {
    try {
        const { reason } = req.body;
        const driverId = req.params.id; // <-- FIXED

        if (!reason || reason.trim() === "") {
            return res.status(400).json({ message: "Rejection reason is required." });
        }

        const driver = await Driver.findByIdAndUpdate(
            driverId,
            { isApproved: false, rejectionReason: reason },
            { new: true }
        );

        if (!driver) {
            return res.status(404).json({ message: "Driver not found." });
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false,
                ciphers: 'SSLv3'
            }
        });

        await transporter.verify();

        const mailOptions = {
            from: process.env.FROM || 'eMove App <noreply@yourapp.com>',
            to: driver.email,
            subject: 'Application Rejected',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Application Rejected</h2>
                    <p>Dear ${driver.firstName} ${driver.lastName},</p>
                    <p>We regret to inform you that your application has been rejected.</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    <p>Thank you for your interest in the eMove platform.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        await Driver.findByIdAndDelete(driverId);

        res.status(200).json({ message: "Driver application rejected.", driver });
    } catch (error) {
        res.status(500).json({ message: "Error rejecting driver." });
    }
};

exports.getCurrentDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.user.id);
        res.status(200).json(driver);
    } catch (error) {
        res.status(500).json({ message: "Error fetching current driver." });
    }
};


exports.getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find().populate('assignedVehicle');
        if (!drivers || drivers.length === 0) {
            return res.status(404).json({ message: 'No drivers found' });
        }
        res.json(drivers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching drivers' });
    }
};


exports.createDriver = async (req, res) => {
    try {
        const { name, email, password, phone, address, userType, driverStatus, assignedVehicle, assignedVehicleType } = req.body;

        // Input validation (this can be expanded as needed)
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Email, password, and name are required' });
        }

        const existingDriver = await Driver.findOne({ email });
        if (existingDriver) {
            return res.status(400).json({ message: 'Driver with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const driver = new Driver({ name, email, password: hashedPassword, phone, address, userType, driverStatus, assignedVehicle, assignedVehicleType });
        await driver.save();

        res.status(201).json(driver);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while creating the driver' });
    }
};

exports.updateDriver = async (req, res) => {
    try {
        const { name, email, password, phone, address, userType, driverStatus, assignedVehicle, assignedVehicleType } = req.body;

        const updateData = { name, email, phone, address, userType, driverStatus, assignedVehicle, assignedVehicleType };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const driver = await Driver.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json(driver);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating the driver' });
    }
};

exports.deleteDriver = async (req, res) => {
    try {
        const driver = await Driver.findByIdAndDelete(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json({ message: 'Driver deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the driver' });
    }
};

exports.getDriverMe = async (req, res) => {
    try {
        const driver = await Driver.findById(req.user.driverId).populate('assignedVehicle');
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json(driver);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while fetching driver data' });
    }
};

exports.validateDriverLicense = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const driverId = req.params.id;
        const adminId = req.user.id; // Assuming we have the admin's ID from auth middleware

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Must be either 'approved' or 'rejected'" });
        }

        if (status === 'rejected' && (!rejectionReason || rejectionReason.trim() === '')) {
            return res.status(400).json({ message: "Rejection reason is required when rejecting a license" });
        }

        const updateData = {
            'driversLicenseIdPhoto.isValidated': true,
            'driversLicenseIdPhoto.validatedBy': adminId,
            'driversLicenseIdPhoto.validatedAt': new Date(),
            'driversLicenseIdPhoto.status': status
        };

        if (status === 'rejected') {
            updateData['driversLicenseIdPhoto.rejectionReason'] = rejectionReason;
        }

        const driver = await Driver.findByIdAndUpdate(
            driverId,
            { $set: updateData },
            { new: true }
        );

        if (!driver) {
            return res.status(404).json({ message: "Driver not found" });
        }

        // Send email notification to driver about license validation
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false,
                ciphers: 'SSLv3'
            }
        });

        const emailSubject = status === 'approved' ? 'Driver License Approved' : 'Driver License Rejected';
        const emailContent = status === 'approved'
            ? `Your driver's license has been approved. You can now start accepting rides.`
            : `Your driver's license has been rejected. Reason: ${rejectionReason}`;

        const mailOptions = {
            from: process.env.FROM || 'eMove App <noreply@yourapp.com>',
            to: driver.email,
            subject: emailSubject,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>${emailSubject}</h2>
                    <p>Dear ${driver.firstName} ${driver.lastName},</p>
                    <p>${emailContent}</p>
                    <p>Thank you for using eMove.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: `Driver's license has been ${status}`,
            driver
        });
    } catch (error) {
        console.error('Error validating driver license:', error);
        res.status(500).json({ message: "Error validating driver's license", error: error.message });
    }
};

exports.getPendingLicenseValidations = async (req, res) => {
    try {
        const pendingDrivers = await Driver.find({
            'driversLicenseIdPhoto.status': 'pending',
            'driversLicenseIdPhoto.path': { $exists: true, $ne: null }
        });

        res.status(200).json(pendingDrivers);
    } catch (error) {
        console.error('Error fetching pending license validations:', error);
        res.status(500).json({ message: "Error fetching pending license validations", error: error.message });
    }
};


exports.uploadLicenseImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Get the driver ID from authenticated user
        const driverId = req.user.id || req.user.driverId;

        // Create the URL path for the uploaded file
        const imageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/licenses/${req.file.filename}`;

        // Update the driver document with the new license image path
        const driver = await Driver.findByIdAndUpdate(
            driverId,
            {
                $set: {
                    driversLicenseIdPhoto: imageUrl // Store directly as string URL
                }
            },
            { new: true }
        );

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        res.status(200).json({
            message: 'License image uploaded successfully',
            driver,
            imageUrl
        });
    } catch (error) {
        console.error('Error uploading license image:', error);
        res.status(500).json({ message: 'Error uploading license image', error: error.message });
    }
};