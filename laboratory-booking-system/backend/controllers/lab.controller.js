const LabModel = require('../models/lab.model');

// Get all labs
exports.getAllLabs = (req, res) => {
  LabModel.getAllLabs((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
// Create new lab
exports.createLab = (req, res) => {
  const labData = req.body;
  LabModel.createLab(labData, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Lab created successfully', lab_id: result.insertId });
  });
};
// Update lab
exports.updateLab = (req, res) => {
  const labId = req.params.lab_id;
  const labData = req.body;
  LabModel.updateLab(labId, labData, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Lab not found' });
    res.json({ message: 'Lab updated successfully' });
  });
};
// Delete lab
exports.deleteLab = (req, res) => {
  const labId = req.params.lab_id;
  LabModel.deleteLab(labId, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Lab not found' });
    res.json({ message: 'Lab deleted successfully' });
  });
};