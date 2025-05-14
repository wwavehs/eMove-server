const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    passengerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passenger',
        required: true,
    },
    origin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true,
    },
    destination: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true,
    },
    vehicleType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehicleType',
        required: true,
    },
    numberOfPassengers: {
        type: Number,
        required: true,
    },
    purpose: {
        type: String,
        required: true,
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true,
    },
    pickUpStartLat: {
        type: Number,
    },
    pickUpStartLong: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'arrived_pickup', 'arrived_destination', 'returning', 'arrived_origin', 'completed', 'cancelled', 'rejected'],
        default: 'pending',
        required: true,
    },
    cancellationReason: {
        type: String,
    },
    rejectionReason: {
        type: String,
    },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
