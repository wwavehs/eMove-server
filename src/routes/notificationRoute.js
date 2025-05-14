const express = require('express');
const router = express.Router();

const { createNotification, getNotificationsForPassenger, getNotificationsForDriver, deleteNotification, updateNotification } = require('../controller/notificationController');

router.post('/create-notification', createNotification);
router.get('/get-notifications-for-passenger/:passengerId', getNotificationsForPassenger);
router.get('/get-notifications-for-driver/:driverId', getNotificationsForDriver);
router.delete('/delete-notification/:notificationId', deleteNotification);
router.put('/update-notification/:notificationId', updateNotification);

module.exports = router;