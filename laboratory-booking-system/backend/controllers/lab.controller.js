const LabModel = require('../models/lab.model');

// Get all available labs
exports.getAvailable = (req, res) => {
  LabModel.getAvailableLabs((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get all booked labs
exports.getBookings = (req, res) => {
  LabModel.getBookedLabs((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get all labs (both available and booked)
exports.getAllLabs = (req, res) => {
  LabModel.getAllLabs((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get lab by ID
exports.getLabById = (req, res) => {
  const labId = req.params.lab_id;
  LabModel.getLabById(labId, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!result) return res.status(404).json({ message: 'Lab not found' });
    res.json(result);
  });
};

// Create new lab schedule
exports.createLabSchedule = (req, res) => {
  const labData = req.body;
  LabModel.createLabSchedule(labData, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Lab schedule created successfully', lab_id: result.insertId });
  });
};

// Update lab schedule
exports.updateLabSchedule = (req, res) => {
  const labId = req.params.lab_id;
  const labData = req.body;
  LabModel.updateLabSchedule(labId, labData, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Lab schedule not found' });
    res.json({ message: 'Lab schedule updated successfully' });
  });
};

// Delete lab schedule
exports.deleteLabSchedule = (req, res) => {
  const labId = req.params.lab_id;
  LabModel.deleteLabSchedule(labId, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Lab schedule not found' });
    res.json({ message: 'Lab schedule deleted successfully' });
  });
};
