const BookingModel = require('../models/booking.model');

// Get all bookings
exports.getAllBookings = (req, res) => {
  BookingModel.getAllBookings((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
// Create new booking
exports.createBooking = (req, res) => {
  const bookingData = req.body;
  BookingModel.createBooking(bookingData, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Booking created successfully', booking_id: result.insertId });
  });
};
// Update booking
exports.updateBooking = (req, res) => {
  const booking_id = req.params.booking_id;
  const bookingData = req.body;
  BookingModel.updateBooking(booking_id, bookingData, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Booking updated successfully' });
  });
};
// Delete booking
exports.deleteBooking = (req, res) => {
  const booking_id = req.params.id;
  BookingModel.deleteBooking(booking_id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Booking deleted successfully' });
  });
};
