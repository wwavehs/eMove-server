const express = require('express');
const router = express.Router();
const locationController = require('../controller/locationController');

router.get('/view-location', locationController.getLocations);
router.post('/add-location', locationController.createLocation);
router.put('/update-location/:id', locationController.updateLocation);
router.delete('/delete-location/:id', locationController.deleteLocation);
router.get('/view-location/:id', locationController.getLocationById);

module.exports = router;