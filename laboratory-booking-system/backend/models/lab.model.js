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

// This function retrieves all booked labs from the database
exports.getBookedLabs = (callback) => {
  const sql = `
    SELECT *
    FROM lab_schedules
    JOIN labs ON lab_schedules.lab_id = labs.lab_id
    WHERE lab_schedules.status = 'booked'
  `;
  db.query(sql, callback);
};

// Get all labs (both available and booked)
exports.getAllLabs = (callback) => {
  const sql = `
    SELECT *
    FROM lab_schedules
    JOIN labs ON lab_schedules.lab_id = labs.lab_id
  `;
  db.query(sql, callback);
};

// Get lab by ID
exports.getLabById = (lab_id, callback) => {
  const sql = `
    SELECT *
    FROM lab_schedules JOIN labs
    ON lab_schedules.lab_id = labs.lab_id
    WHERE lab_id = ?
  `;
  db.query(sql, [lab_id], callback);
};

// Create new lab schedule
exports.createLabSchedule = (labData, callback) => {
  const sql = `
    INSERT INTO lab_schedules SET ?
  `;
  db.query(sql, [labData], callback);
}

// Update lab schedule
exports.updateLabSchedule = (lab_id, labData, callback) => {
  const sql = `
    UPDATE lab_schedules
    SET ?
    WHERE schedule_id = ?
  `;
  db.query(sql, [labData, lab_id], callback);
};

// Delete lab schedule
exports.deleteLabSchedule = (lab_id, callback) => {
  const sql = `
    DELETE FROM lab_schedules
    WHERE schedule_id = ?
  `;
  db.query(sql, [lab_id], callback);
};