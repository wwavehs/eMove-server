const Booking = require('../model/bookingModel')

module.exports = function initDriverSocket(io, socket) {
    const driverId = socket.handshake.query.userId;
    console.log(`New driver connected: ${driverId}`);
    socket.join(`driver-${driverId}`);
    console.log(`Driver joined room: driver-${driverId}`);

    socket.on('bookingRequest', (data) => {
        console.log(`Driver ${driverId} received booking request:`, data);

        // Send acknowledgment back to server that request was received
        socket.emit('bookingRequestReceived', {
            bookingId: data.bookingId,
            driverId: driverId,
            passengerId: data.passengerId,
            timestamp: new Date().toISOString()
        });
    });

    // Accept or reject booking
    socket.on('acceptBooking', async (data) => {
        const { bookingId, passengerId } = data;
        console.log(`Driver ${driverId} accepted booking: ${bookingId}`);

        // Update booking status in the database
        await Booking.findByIdAndUpdate(bookingId, { status: 'accepted' });

        // Notify passenger (optional)
        io.to(`passenger-${passengerId}`).emit('bookingAccepted', {
            bookingId,
            driverId,
        });
    });

    socket.on('rejectBooking', async (data) => {
        const { bookingId, passengerId } = data;
        console.log(`Driver ${driverId} rejected booking: ${bookingId}`);

        // Update booking status in the database
        await Booking.findByIdAndUpdate(bookingId, { status: 'rejected' });

        // Notify passenger (optional)
        io.to(`passenger-${passengerId}`).emit('bookingRejected', {
            bookingId,
            driverId,
        });
    });

};