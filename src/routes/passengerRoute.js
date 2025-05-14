const express = require('express');
const router = express.Router();
const passengerController = require('../controller/passengerController');

router.get('/get-passenger-details/:id', passengerController.getPassengerDetails);


module.exports = router;
