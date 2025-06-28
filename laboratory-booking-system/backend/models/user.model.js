const db = require('../config/db');

// Get all users
exports.getAllUsers = (callback) => {
  db.query('SELECT * FROM users', callback);
};

// Get user by ID
exports.getUserById = (user_id, callback) => {
  db.query('SELECT * FROM users WHERE user_id = ?', [user_id], callback);
};

// Create new user
exports.createUser = (userData, callback) => {
  db.query('INSERT INTO users SET ?', userData, callback);
};

// Update user
exports.updateUser = (user_id, userData, callback) => {
  db.query('UPDATE users SET ? WHERE user_id = ?', [userData, user_id], callback);
};

// Delete user
exports.deleteUser = (user_id, callback) => {
  db.query('DELETE FROM users WHERE user_id = ?', [user_id], callback);
};