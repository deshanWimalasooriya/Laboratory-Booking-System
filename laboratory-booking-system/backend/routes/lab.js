const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get available lab slots
router.get('/available', (req, res) => {
  const sql = `
    SELECT
      lab_schedule.schedule_id,
      lab.type AS lab_type, 
      lab.availability,
      lab.capacity,
      lab_schedule.date, 
      lab_schedule.time_slot, 
      lab_schedule.status
    FROM lab_schedule
    JOIN lab ON lab_schedule.lab_id = lab.lab_id
    WHERE lab_schedule.status = 'available'
    ORDER BY lab_schedule.date, lab_schedule.time_slot
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Book a lab slot
router.post('/book', (req, res) => {
  const { schedule_id, user_id } = req.body;
  if (!user_id) return res.status(401).json({ error: 'User not authenticated' });

  const insertBooking = `
    INSERT INTO lab_booking (user_id, lab_id, schedule_id, status, created_at)
    SELECT ?, l.lab_id, s.schedule_id, 'confirmed', NOW()
    FROM lab_schedule s
    JOIN lab l ON s.lab_id = l.lab_id
    WHERE s.schedule_id = ? AND s.status = 'available'
  `;
  db.query(insertBooking, [user_id, schedule_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'Slot already booked or unavailable' });
    }
    db.query(
      "UPDATE lab_schedule SET status = 'booked' WHERE schedule_id = ?",
      [schedule_id],
      (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ success: true });
      }
    );
  });
});

module.exports = router;
