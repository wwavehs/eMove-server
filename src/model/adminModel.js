const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true, // Remove whitespace
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePhoto: {
        type: String,
        required: false

    },
    userType: {
        type: String,
        enum: ['admin', 'driver', 'passenger'],
        default: 'admin',
    },
    fcmToken: {
        type: String,
        required: false
    },
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
