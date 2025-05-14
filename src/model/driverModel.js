const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
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
    driversLicenseIdNumber: {
        type: String,
        required: true,
        trim: true,
    },
    driversLicenseIdExpiry: {
        type: Date,
        required: false
    },
    driversLicenseIdPhoto: {
        type: String,
        required: false,
        default: null
    },
    userType: {
        type: String,
        enum: ['admin', 'driver', 'passenger'],
        default: 'driver',
    },
    assignedVehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        default: null,
        required: false,
    },
    assignedVehicleType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehicleType',
        default: null,
        required: false,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    rejectionReason: { type: String, default: null },
    fcmToken: {
        type: String,
        required: false
    },
}, { timestamps: true });

const Driver = mongoose.model('Driver', driverSchema);
module.exports = Driver;