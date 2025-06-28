const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');


// Define routes for booking management
router.get('/', bookingController.getAllBookings);
router.get('/:user_id', bookingController.getBookingsByUser);
router.post('/', bookingController.createBooking);
router.put('/:booking_id', bookingController.updateBooking);
router.delete('/:booking_id', bookingController.deleteBooking);

module.exports = router;