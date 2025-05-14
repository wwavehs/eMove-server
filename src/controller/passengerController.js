const Passenger = require('../model/passengerModel');

exports.getPassengerDetails = async (req, res) => {
    const { id } = req.params;
    const passenger = await Passenger.findById(id);
    res.status(200).json(passenger);
};

exports.getCompletedBookingsForPassenger = async (req, res) => {
    const { id } = req.params;
    const bookings = await Booking.find({ passenger: id, status: 'completed' });
    res.status(200).json(bookings);
};
