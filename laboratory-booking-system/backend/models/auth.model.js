const db = require('../config/db');

exports.findUserByEmailAndPassword = (email, password, callback) => {
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], callback);
};
