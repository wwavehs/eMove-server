const mongoose = require('mongoose');

const vehicleTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

const VehicleType = mongoose.model('VehicleType', vehicleTypeSchema);
module.exports = VehicleType;