const Vehicle = require('../model/vehicleModel');
const Driver = require('../model/driverModel');
const VehicleType = require('../model/vehicleTypeModel');

exports.getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find()
            .populate('type')
            .populate('assignedTo');

        console.log(JSON.stringify(vehicles, null, 2)); // 👈 Inspect here
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createVehicle = async (req, res) => {
    try {
        const { name, type, assignedTo, status } = req.body;

        // Validate input fields
        if (!name || !type || !status) {
            return res.status(400).json({ message: 'Name, type, and status are required' });
        }

        // Check if the vehicle already exists
        const existingVehicle = await Vehicle.findOne({ name });
        if (existingVehicle) {
            return res.status(400).json({ message: 'Vehicle already exists' });
        }

        // Find the vehicle type to check its quantity
        const vehicleType = await VehicleType.findById(type);
        if (!vehicleType) {
            return res.status(400).json({ message: 'Invalid vehicle type' });
        }

        // Check the current number of vehicles of this type
        const vehicleCount = await Vehicle.countDocuments({ type: type });
        if (vehicleCount >= vehicleType.quantity) {
            return res.status(400).json({ message: `Cannot add more vehicles. Max quantity for this type is ${vehicleType.quantity}` });
        }

        // Remove this driver from all other vehicles before assigning
        if (assignedTo) {
            await Vehicle.updateMany({ assignedTo: assignedTo }, { $set: { assignedTo: null } });
        }

        // Create the new vehicle
        const vehicle = new Vehicle({ name, type, assignedTo: assignedTo || null, status });
        await vehicle.save();

        // Update the driver's assignedVehicle field (if you have such a field)
        if (assignedTo) {
            await Driver.findByIdAndUpdate(
                assignedTo,
                { assignedVehicle: vehicle._id, assignedVehicleType: type }
            );
        }

        res.status(201).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, assignedTo, status } = req.body;

        // Update the vehicle's basic info
        const vehicle = await Vehicle.findByIdAndUpdate(
            id,
            { name, type, assignedTo, status },
            { new: true }
        );
        if (!vehicle) {
            return res.status(400).json({ message: 'Vehicle not found' });
        }

        const vehicleType = await VehicleType.findById(type);
        if (!vehicleType) {
            return res.status(400).json({ message: 'Invalid vehicle type' });
        }

        // If assignedTo is provided, remove this driver from all other vehicles before assigning
        if (assignedTo) {
            await Vehicle.updateMany(
                { assignedTo: assignedTo, _id: { $ne: vehicle._id } },
                { $set: { assignedTo: null } }
            );
        }

        // Optionally, update the driver's assignedVehicle field if you have such a field
        if (assignedTo) {
            await Driver.findByIdAndUpdate(
                assignedTo,
                { assignedVehicle: vehicle._id, assignedVehicleType: type }
            );
        }

        // Return the updated vehicle with populated fields
        const populatedVehicle = await Vehicle.findById(vehicle._id)
            .populate('type')
            .populate('assignedTo');

        res.status(200).json(populatedVehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle.findByIdAndDelete(id);
        if (!vehicle) {
            return res.status(400).json({ message: 'Vehicle not found' });
        }
        if (vehicle.assignedTo) {
            await Driver.findByIdAndUpdate(vehicle.assignedTo, { $pull: { vehicles: vehicle._id } });
        }
        res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAssignedVehicle = async (req, res) => {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (vehicle) {
        res.status(200).json(vehicle);
    } else {
        res.status(404).json({ message: 'Vehicle not found' });
    }
};
