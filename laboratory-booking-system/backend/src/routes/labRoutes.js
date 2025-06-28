const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');

router.get('/available', labController.getAvailableLabs);
router.get('/bookings', labController.getLabBookings);

module.exports = router;
