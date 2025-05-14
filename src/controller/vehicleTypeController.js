const VehicleType = require('../model/vehicleTypeModel');

exports.getVehicleTypes = async (req, res) => {
    try {
        const vehicleTypes = await VehicleType.find();
        res.status(200).json(vehicleTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createVehicleType = async (req, res) => {
    try {
        const { name, capacity, quantity } = req.body;
        const vehicleType = new VehicleType({ name, capacity, quantity });
        await vehicleType.save();
        res.status(201).json(vehicleType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateVehicleType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, capacity, quantity } = req.body;
        const vehicleType = await VehicleType.findByIdAndUpdate(id, { name, capacity, quantity }, { new: true });
        res.status(200).json(vehicleType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteVehicleType = async (req, res) => {
    try {
        const { id } = req.params;
        await VehicleType.findByIdAndDelete(id);
        res.status(200).json({ message: 'Vehicle type deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};