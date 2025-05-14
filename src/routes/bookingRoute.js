const express = require('express');
const router = express.Router();
const bookingController = require('../controller/bookingController');

router.post('/create-booking', bookingController.createBooking);
router.get('/view-bookings', bookingController.getBookings);
router.get('/active-bookings', bookingController.getAllActiveBookings);
router.get('/completed-bookings', bookingController.getAllCompletedBookings);
router.get('/cancelled-bookings', bookingController.getAllCancelledBookings);
router.get('/rejected-bookings', bookingController.getAllRejectedBookings);
router.get('/recent-bookings', bookingController.getSomeRecentBookings);
router.put('/update-booking/:id', bookingController.updateBooking);
router.delete('/delete-booking/:id', bookingController.deleteBooking);
router.get('/booking-statistics', bookingController.getBookingStatistics);
router.get('/status-statistics', bookingController.getBookingStatusStatistics);

router.get('/pending-bookings/:driverId', bookingController.getPendingBookings);
router.get('/completed-bookings/:driverId', bookingController.getCompletedBookings);
router.get('/active-bookings/:driverId', bookingController.getActiveBookings);

router.post('/reject-booking/:id', bookingController.rejectBooking);
router.post('/accept-booking/:id', bookingController.acceptBooking);
router.post('/complete-booking/:id', bookingController.completeBooking);
router.post('/cancel-booking/:id', bookingController.cancelBooking);
router.get('/get-booking-status/:id', bookingController.getBookingStatus);
router.post('/update-status/:id', bookingController.updateBookingStatus);

router.get('/active-bookings/passenger/:passengerId', bookingController.getActiveBookingsForPassenger);
router.get('/completed-bookings/passenger/:passengerId', bookingController.getCompletedBookingsForPassenger);
router.get('/cancelled-bookings/passenger/:passengerId', bookingController.getCancelledBookingsForPassenger);
router.get('/rejected-bookings/passenger/:passengerId', bookingController.getRejectedBookingsForPassenger);
router.get('/recent-bookings/passenger/:passengerId', bookingController.getRecentBookingsForPassenger);

module.exports = router;