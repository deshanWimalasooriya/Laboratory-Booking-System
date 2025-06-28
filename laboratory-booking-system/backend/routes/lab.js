const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get available lab slots
router.get('/available', (req, res) => {
  const sql = `
    SELECT
      lab_schedules.schedule_id,
      labs.type AS lab_type,
      labs.availability,
      labs.capacity,
      lab_schedules.date,
      lab_schedules.time_slot,
      lab_schedules.status
    FROM lab_schedules JOIN labs
    ON lab_schedules.lab_id = labs.lab_id
    WHERE lab_schedules.status = 'available'
    ORDER BY lab_schedules.date, lab_schedules.time_slot
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


router.get('/bookings', (req, res) => {
  const sql = `
  SELECT *
  FROM lab_schedules JOIN labs
  ON lab_schedules.lab_id = labs.lab_id
  WHERE lab_schedules.status = 'booked'`
  ;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
