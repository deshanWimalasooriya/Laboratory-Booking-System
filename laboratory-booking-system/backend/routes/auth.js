const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM user WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB Error' });
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

module.exports = router;
