const express = require('express');
const router = express.Router();
const driverController = require('../controller/driverController');
const upload = require('../middlewares/uploadMiddleware')

router.get('/view-drivers', driverController.getDrivers);
router.post('/create-driver', driverController.createDriver);
router.put('/update-driver/:id', driverController.updateDriver);
router.delete('/delete-driver/:id', driverController.deleteDriver);
router.get('/unapproved', driverController.getUnapprovedDrivers);
router.put('/approve-driver/:id', driverController.approveDriver);
router.put('/reject-driver/:id', driverController.rejectDriver);
router.get('/me', driverController.getDriverMe);

router.post('/update-availability/:driverId', driverController.updateDriverStatus);
// License image upload route - ensure 'licenseImage' matches the form field name
router.post('/upload-license', upload.single('licenseImage'), driverController.uploadLicenseImage);

module.exports = router;
