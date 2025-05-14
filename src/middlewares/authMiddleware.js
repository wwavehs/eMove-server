const jwt = require('jsonwebtoken');
const Driver = require('../model/driverModel'); // adjust path as needed

const authenticateDriver = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.driver = await Driver.findById(decoded.id).select('-password');
        if (!req.driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        next();
    } catch (err) {
        console.error('Error during token authentication:', err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = authenticateDriver;
