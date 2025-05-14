const express = require('express');
const router = express.Router();
const vehicleController = require('../controller/vehicleController');

router.get('/view-vehicles', vehicleController.getVehicles);
router.post('/create-vehicle', vehicleController.createVehicle);
router.put('/update-vehicle/:id', vehicleController.updateVehicle);
router.delete('/delete-vehicle/:id', vehicleController.deleteVehicle);
router.get('/assigned-vehicle/:id', vehicleController.getAssignedVehicle);

module.exports = router;
