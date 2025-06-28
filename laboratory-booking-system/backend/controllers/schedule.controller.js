const LabScheduleModel = require('../models/schedule.model');

// Get all available labs
exports.getAvailable = (req, res) => {
  LabScheduleModel.getAvailableLabs((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
// Get all booked labs
exports.getBookings = (req, res) => {
  LabScheduleModel.getBookedLabs((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
// Get all labs (both available and booked)
exports.getAllLabsSchedules = (req, res) => {
  LabScheduleModel.getAllLabsSchedules((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
// Get lab by ID
exports.getLabById = (req, res) => {
  const labId = req.params.lab_id;
  LabScheduleModel.getLabById(labId, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!result) return res.status(404).json({ message: 'Lab not found' });
    res.json(result);
  });
};
// Create new lab schedule
exports.createLabSchedule = (req, res) => {
  const labData = req.body;
  LabScheduleModel.createLabSchedule(labData, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Lab schedule created successfully', lab_id: result.insertId });
  });
};
// Update lab schedule
exports.updateLabSchedule = (req, res) => {
  const labId = req.params.lab_id;
  const labData = req.body;
  LabScheduleModel.updateLabSchedule(labId, labData, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Lab schedule not found' });
    res.json({ message: 'Lab schedule updated successfully' });
  });
};
// Delete lab schedule
exports.deleteLabSchedule = (req, res) => {
  const labId = req.params.lab_id;
  LabScheduleModel.deleteLabSchedule(labId, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Lab schedule not found' });
    res.json({ message: 'Lab schedule deleted successfully' });
  });
};
