const Booking = require("../model/bookingModel");
const Driver = require("../model/driverModel");
const sendBookingNotificationToDriver = require("../utils/sendNotification")

exports.createBooking = async (req, res) => {
    try {
        const { passengerId, origin, destination, vehicleType, numberOfPassengers, purpose, driverId } = req.body;

        if (!passengerId || !origin || !destination || !vehicleType || !numberOfPassengers || !purpose || !driverId) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const booking = new Booking({ passengerId, origin, destination, vehicleType, numberOfPassengers, purpose, driverId });
        await booking.save();
        sendBookingNotificationToDriver(driverId, booking);
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('passengerId')
            .populate('driverId')
            .populate('origin')
            .populate('destination')
            .populate('vehicleType');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllActiveBookings = async (req, res) => {
    const bookings = await Booking.find({ status: { $in: ['accepted', 'arrived_pickup', 'arrived_destination', 'returning', 'arrived_origin'] } })
        .populate('passengerId')
        .populate('driverId')
        .populate('origin')
        .populate('destination')
        .populate('vehicleType');
    res.status(200).json({ count: bookings.length, bookings });
};

exports.getAllCancelledBookings = async (req, res) => {
    const bookings = await Booking.find({ status: 'cancelled' })
        .populate('passengerId')
        .populate('driverId')
        .populate('origin')
        .populate('destination')
        .populate('vehicleType');
    res.status(200).json({ count: bookings.length, bookings });
};

exports.getAllRejectedBookings = async (req, res) => {
    const bookings = await Booking.find({ status: 'rejected' })
        .populate('passengerId')
        .populate('driverId')
        .populate('origin')
        .populate('destination')
        .populate('vehicleType');
    res.status(200).json({ count: bookings.length, bookings });
};

exports.getAllCompletedBookings = async (req, res) => {
    const bookings = await Booking.find({ status: 'completed' })
        .populate('passengerId')
        .populate('driverId')
        .populate('origin')
        .populate('destination')
        .populate('vehicleType');
    res.status(200).json({ count: bookings.length, bookings });
};

exports.getSomeRecentBookings = async (req, res) => {
    const bookings = await Booking.find()
        .populate('passengerId')
        .populate('driverId')
        .populate('origin')
        .populate('destination')
        .populate('vehicleType')
        .sort({ createdAt: -1 })
        .limit(4);
    res.status(200).json({ count: bookings.length, bookings });
};

exports.updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findByIdAndDelete(id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Example: Node.js + Express route
exports.getPendingBookings = async (req, res) => {
    const { driverId } = req.params;
    const driver = await Driver.findById(driverId);
    if (!driver || !driver.isAvailable) {
        // Driver not found or not available
        return res.status(200).json({ booking: [] });
    }
    const booking = await Booking.find({ driverId, status: 'pending' });
    return res.json({ booking });
};

exports.getActiveBookings = async (req, res) => {
    const { driverId } = req.params;
    const booking = await Booking.find({
        driverId,
        status: { $in: ['accepted', 'arrived_pickup', 'arrived_destination', 'returning', 'arrived_origin'] }
    });
    return res.json({ booking });
};

exports.respondToBooking = async (req, res) => {
    const { bookingId, accept } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
    }
    booking.status = accept ? 'accepted' : 'rejected';
    const updatedBooking = await Booking.findByIdAndUpdate(bookingId, { status: booking.status }, { new: true });
    res.status(200).json(updatedBooking);
};

exports.getCompletedBookings = async (req, res) => {
    const { driverId } = req.params;
    const booking = await Booking.findOne({ driverId, status: 'completed' });
    if (booking) {
        return res.json({ booking });
    } else {
        return res.status(204).send(); // No content
    }
};

exports.rejectBooking = async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
    res.status(200).json(booking);
};

exports.acceptBooking = async (req, res) => {
    const { id } = req.params;
    const { driverLat, driverLng } = req.body;
    const booking = await Booking.findByIdAndUpdate(id, { status: 'accepted', pickUpStartLat: driverLat, pickUpStartLong: driverLng }, { new: true });
    const driver = await Driver.findByIdAndUpdate(booking.driverId, { isAvailable: false }, { new: true });
    res.status(200).json(booking);
};

exports.completeBooking = async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(id, { status: 'completed' }, { new: true });
    if (booking) {
        await Driver.findByIdAndUpdate(booking.driverId, { isAvailable: true });
        return res.status(200).json(booking);
    } else {
        return res.status(404).json({ message: 'Booking not found' });
    }
};

exports.cancelBooking = async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.status === 'accepted') {
        return res.status(400).json({ message: 'Booking already accepted' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.status(200).json(booking);
};

exports.getBookingStatus = async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json({ status: booking.status });
};

exports.getActiveBookingForDriver = async (req, res) => {
    const { driverId } = req.params;
    // Find the most recent booking with status 'accepted' (or whatever you define as active)
    const booking = await Booking.findOne({
        driverId,
        status: 'accepted'
    }).sort({ updatedAt: -1 }); // Optional: get the latest one
    if (booking) {
        return res.status(200).json(booking);
    } else {
        return res.status(204).send(); // No active booking
    }
};

exports.updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status, cancellationReason, rejectionReason } = req.body;
    const booking = await Booking.findByIdAndUpdate(id, { status, cancellationReason, rejectionReason }, { new: true });
    res.status(200).json(booking);
};

// exports.getActiveBookingForPassenger = async (req, res) => {
//     const { passengerId } = req.params;
//     const booking = await Booking.findOne({
//         passengerId,
//         status: { $in: ['accepted', 'arrived_pickup', 'arrived_destination', 'returning', 'arrived_origin'] }
//     }).sort({ updatedAt: -1 });
//     if (booking) {
//         return res.status(200).json(booking);
//     } else {
//         return res.status(204).send();
//     }
// };

exports.getActiveBookingsForPassenger = async (req, res) => {
    const { passengerId } = req.params;
    const bookings = await Booking.find({
        passengerId,
        status: { $in: ['accepted', 'arrived_pickup'] }
    });
    res.status(200).json({ count: bookings.length, bookings });
};

exports.getCompletedBookingsForPassenger = async (req, res) => {
    const { passengerId } = req.params;
    const bookings = await Booking.find({ passengerId, status: 'completed' }).sort({ createdAt: -1 }).populate('driverId').populate('origin').populate('destination');
    res.status(200).json({ count: bookings.length, bookings });
};

exports.getCancelledBookingsForPassenger = async (req, res) => {
    const { passengerId } = req.params;
    const bookings = await Booking.find({ passengerId, status: 'cancelled' }).sort({ createdAt: -1 }).populate('driverId').populate('origin').populate('destination');
    res.status(200).json({ count: bookings.length, bookings });
};

exports.getRejectedBookingsForPassenger = async (req, res) => {
    const { passengerId } = req.params;
    const bookings = await Booking.find({ passengerId, status: 'rejected' }).sort({ createdAt: -1 }).populate('driverId').populate('origin').populate('destination');
    res.status(200).json({ count: bookings.length, bookings });
};

exports.getRecentBookingsForPassenger = async (req, res) => {
    const { passengerId } = req.params;
    const bookings = await Booking.find({ passengerId }).sort({ createdAt: -1 }).limit(3).populate('driverId').populate('origin').populate('destination');
    res.status(200).json({ count: bookings.length, bookings });
};

exports.getBookingStatistics = async (req, res) => {
    try {
        const statistics = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.status(200).json(statistics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBookingStatusStatistics = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // includes today

        const stats = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        status: "$status"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
