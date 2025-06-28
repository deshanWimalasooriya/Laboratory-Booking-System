const db = require('../config/db');

// Get all labs
exports.getAllLabs = (callback) => {
  const sql = `
    SELECT *
    FROM labs
  `;
  db.query(sql, callback);
};
// Create new lab
exports.createLab = (labData, callback) => {
  const sql = `
    INSERT INTO labs SET ?
  `;
  db.query(sql, [labData], callback);
};
// Update lab
exports.updateLab = (lab_id, labData, callback) => {
  const sql = `
    UPDATE labs
    SET ?
    WHERE lab_id = ?
  `;
  db.query(sql, [labData, lab_id], callback);
};
// Delete lab
exports.deleteLab = (lab_id, callback) => {
  const sql = `
    DELETE FROM labs
    WHERE lab_id = ?
  `;
  db.query(sql, [lab_id], callback);
};
