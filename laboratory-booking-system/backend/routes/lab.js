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
    FROM lab_schedule JOIN lab
    ON lab_schedule.lab_id = lab.lab_id
    WHERE lab_schedule.status = 'available'
    ORDER BY lab_schedule.date, lab_schedule.time_slot
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


router.get('/bookings', (req, res) => {
  const sql = `
  SELECT *
  FROM lab_schedule JOIN lab
  ON lab_schedule.lab_id = lab.lab_id
  WHERE lab_schedule.status = 'booked'`
  ;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
