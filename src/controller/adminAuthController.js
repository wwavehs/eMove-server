const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const Admin = require('../model/adminModel')

exports.registerAdmin = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin with this email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        await newAdmin.save();
        res.status(201).json({ message: "Admin registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error registering admin" });
    }
}

exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingAdmin = await Admin.findOne({ email });

        if (!existingAdmin) {
            return res.status(400).json({ message: "Admin with this email does not exist" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingAdmin.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: existingAdmin._id, email: existingAdmin.email },
            process.env.JWT_SECRET || 'your_jwt_secret', // Use your actual secret!
            { expiresIn: '1d' }
        );

        res.status(200).json({
            token,
            user: {
                _id: existingAdmin._id,
                firstName: existingAdmin.firstName,
                lastName: existingAdmin.lastName,
                email: existingAdmin.email,
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in" });
    }
}