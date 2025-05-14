module.exports = function initPassengerSocket(io, socket) {
    const passengerId = socket.handshake.query.userId;
    console.log(`New passenger connected: ${passengerId}`);
    socket.join(`passenger-${passengerId}`);

    // Create a booking
    socket.on('createBooking', (data) => {
        const { driverId, bookingId, pickupLocation, destination, numberOfPassengers, purpose } = data;
        console.log(`Received booking request for driver ${driverId}: from ${pickupLocation} to ${destination} with ${numberOfPassengers} passengers for ${purpose}`);

        // This is the key change - use io.to() instead of socket.to()
        // This sends the event from the server to the driver's room
        io.to(`driver-${driverId}`).emit('bookingRequest', {
            bookingId,
            passengerId,
            pickupLocation,
            destination,
            numberOfPassengers,
            purpose,
        });

        // Log that the server attempted to send the request
        console.log(`Server emitted bookingRequest to driver-${driverId}`);
    });

    // Add listener for driver acknowledgments
    io.on('bookingRequestReceived', (data) => {
        console.log(`Driver ${data.driverId} confirmed receipt of booking ${data.bookingId} at ${data.timestamp}`);

        // Notify passenger that driver received the request
        io.to(`passenger-${data.passengerId}`).emit('driverReceivedRequest', {
            bookingId: data.bookingId,
            driverId: data.driverId
        });
    });
};
