const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
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
    employeeIdPhoto: {
        type: String,
        required: false

    },
    userType: {
        type: String,
        enum: ['admin', 'driver', 'passenger'],
        default: 'passenger',
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    fcmToken: {
        type: String,
        required: false
    },
}, { timestamps: true });

const Passenger = mongoose.model('Passenger', passengerSchema);
module.exports = Passenger;
