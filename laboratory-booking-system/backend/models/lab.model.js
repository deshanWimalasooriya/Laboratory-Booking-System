const db = require('../config/db');

exports.getAvailableLabs = (callback) => {
  const sql = `
    SELECT
      lab_schedules.schedule_id,
      labs.type AS lab_type,
      labs.availability,
      labs.capacity,
      lab_schedules.date,
      lab_schedules.time_slot,
      lab_schedules.status
    FROM lab_schedules
    JOIN labs ON lab_schedules.lab_id = labs.lab_id
    WHERE lab_schedules.status = 'available'
    ORDER BY lab_schedules.date, lab_schedules.time_slot
  `;
  db.query(sql, callback);
};

exports.getBookedLabs = (callback) => {
  const sql = `
    SELECT *
    FROM lab_schedules
    JOIN labs ON lab_schedules.lab_id = labs.lab_id
    WHERE lab_schedules.status = 'booked'
  `;
  db.query(sql, callback);
};
