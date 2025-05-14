const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientType: {
        type: String,
        required: true,
        enum: ['Passenger', 'Driver'],
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientType',
    },
    type: {
        type: String,
        enum: ['ride_accepted', 'ride_rejected', 'driver_arrived', 'ride_completed', 'ride_cancelled'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: false,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Notification', notificationSchema);
