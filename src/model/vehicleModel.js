const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehicleType',
        required: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: false,
        default: null,
    },
    status: {
        type: String,
        enum: ['Available', 'Booked', 'Under_Maintenance'],
        default: 'Available',
    },
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;