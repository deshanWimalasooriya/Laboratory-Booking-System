const express = require('express');
const router = express.Router();
const labController = require('../controllers/lab.controller');

router.get('/available', labController.getAvailable);
router.get('/bookings', labController.getBookings);

module.exports = router;
