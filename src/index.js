require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path')

const adminAuthRoute = require('./routes/adminAuthRoute');
const driverAuthRoute = require('./routes/driverAuthRoute');
const otpRoute = require('./routes/otpRoute');
const driverRoute = require('./routes/driverRoute');
const vehicleTypeRoute = require('./routes/vehicleTypeRoute');
const vehicleRoute = require('./routes/vehicleRoute');
const locationRoute = require('./routes/locationRoute');
const passengerAuthRoute = require('./routes/passengerAuthRoute');
const bookingRoute = require('./routes/bookingRoute');
const passengerRoute = require('./routes/passengerRoute');
const notificationRoute = require('./routes/notificationRoute');

// Initialize the server
const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Routes
app.use('/api/admin/auth', adminAuthRoute);

app.use('/api/driver/auth', driverAuthRoute);
app.use('/api/driver/otp', otpRoute);
app.use('/api/driver', driverRoute);

app.use('/api/passenger/auth', passengerAuthRoute);
app.use('/api/passenger/otp', otpRoute);
app.use('/api/passenger', passengerRoute);

app.use('/api/vehicle-type', vehicleTypeRoute);
app.use('/api/vehicle', vehicleRoute);
app.use('/api/location', locationRoute);
app.use('/api/booking', bookingRoute);

app.use('/api/notification', notificationRoute);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
