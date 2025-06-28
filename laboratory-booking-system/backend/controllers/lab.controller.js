const LabModel = require('../models/lab.model');

exports.getAvailable = (req, res) => {
  LabModel.getAvailableLabs((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getBookings = (req, res) => {
  LabModel.getBookedLabs((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
