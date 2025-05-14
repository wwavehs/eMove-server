const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride',
        required: true,
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passenger',
        required: true,
    },
    reviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    comment: {
        type: String,
        maxlength: 500,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Review', reviewSchema);
