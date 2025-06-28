const AuthModel = require('../models/auth.model');

exports.login = (req, res) => {
  const { email, password } = req.body;

  AuthModel.findUserByEmailAndPassword(email, password, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
};
