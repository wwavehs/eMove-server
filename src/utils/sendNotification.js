const admin = require('firebase-admin');
const Driver = require('../model/driverModel');
const serviceAccount = require('../firebase-service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

async function sendBookingNotificationToDriver(driverId, bookingDetails) {
    const driver = await Driver.findById(driverId);
    if (!driver?.fcmToken) return;

    const message = {
        notification: {
            title: 'New Booking Request',
            body: `Pickup at ${bookingDetails.origin}`,
        },
        data: {
            bookingId: bookingDetails.id,
            pickup: bookingDetails.origin,
            destination: bookingDetails.destination,
        },
        token: driver.fcmToken,
    };

    try {
        await admin.messaging().send(message);
        console.log('Notification sent to driver');
    } catch (err) {
        console.error('Error sending notification:', err);
    }
}

module.exports = sendBookingNotificationToDriver;
