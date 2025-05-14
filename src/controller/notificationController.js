const Notification = require('../model/notificationModel');

exports.createNotification = async (req, res) => {
    const { recipientType, recipient, type, title, message } = req.body;
    const notification = new Notification({ recipientType, recipient, type, title, message });
    await notification.save();
    res.status(201).json(notification);
};

exports.getNotificationsForPassenger = async (req, res) => {
    const { passengerId } = req.params;
    const passengerNotifications = await Notification.find({ recipient: passengerId });
    res.status(200).json(passengerNotifications);
};

exports.getNotificationsForDriver = async (req, res) => {
    const { driverId } = req.params;
    const driverNotifications = await Notification.find({ recipient: driverId });
    res.status(200).json(driverNotifications);
};

exports.deleteNotification = async (req, res) => {
    const { notificationId } = req.params;
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: 'Notification deleted successfully' });
};

exports.updateNotification = async (req, res) => {
    const { notificationId } = req.params;
    const { isRead } = req.body;
    await Notification.findByIdAndUpdate(notificationId, { isRead });
    res.status(200).json({ message: 'Notification updated successfully' });
};