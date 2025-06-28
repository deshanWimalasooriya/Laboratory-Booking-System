const db = require('../config/db');

//Create CRUD operations for bookings

// Get all bookings
exports.getAllBookings = (callback) => {
  const sql = `
    SELECT *
    FROM lab_bookings
  `;
  db.query(sql, callback);
};
// Create new booking
exports.createBooking = (bookingData, callback) => {
  const sql = `
    INSERT INTO lab_bookings SET ?
  `;
  db.query(sql, [bookingData], callback);
};
// Update booking
exports.updateBooking = (booking_id, bookingData, callback) => {
  const sql = `
    UPDATE lab_bookings
    SET ?
    WHERE booking_id = ?
  `;
  db.query(sql, [bookingData, booking_id], callback);
};
// Delete booking
exports.deleteBooking = (booking_id, callback) => {
  const sql = `
    DELETE FROM lab_bookings
    WHERE booking_id = ?
  `;
  db.query(sql, [booking_id], callback);
}