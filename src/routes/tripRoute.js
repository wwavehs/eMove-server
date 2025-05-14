const express = require('express');
const router = express.Router();
const tripController = require('../controller/tripController');

router.get('/driver/:driverId', tripController.getDriverTrips);
router.post('/', tripController.createTrip);
router.put('/:id/accept', tripController.acceptTrip);
router.put('/:id/complete', tripController.completeTrip);
router.put('/:id/cancel', tripController.cancelTrip);

module.exports = router;