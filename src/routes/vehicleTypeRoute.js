const express = require('express');
const router = express.Router();
const vehicleTypeController = require('../controller/vehicleTypeController');

router.get('/view', vehicleTypeController.getVehicleTypes);
router.post('/add', vehicleTypeController.createVehicleType);
router.put('/update/:id', vehicleTypeController.updateVehicleType);
router.delete('/delete/:id', vehicleTypeController.deleteVehicleType);

module.exports = router;
