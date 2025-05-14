const Location = require('../model/locationModel');

exports.getLocations = async (req, res) => {
    try {
        const locations = await Location.find();
        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createLocation = async (req, res) => {
    try {
        const { name, latitude, longitude, type } = req.body;

        if (!name || !latitude || !longitude || !type) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingLocation = await Location.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
        if (existingLocation) {
            return res.status(400).json({ message: 'Location with this name already exists' });
        }

        const location = new Location({ name, latitude, longitude, type });
        await location.save();
        res.status(201).json(location);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, latitude, longitude, type } = req.body;

        if (!name || !latitude || !longitude || !type) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const location = await Location.findByIdAndUpdate(
            id,
            { name, latitude, longitude, type },
            { new: true }
        );

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        await Location.findByIdAndDelete(id);
        res.status(200).json({ message: 'Location deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLocationById = async (req, res) => {
    try {
        const { id } = req.params;
        const location = await Location.findById(id);
        res.status(200).json(location);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
