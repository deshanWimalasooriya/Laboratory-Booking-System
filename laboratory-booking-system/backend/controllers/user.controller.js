const User = require('../models/user.model');

// GET all users
exports.getAll = (req, res) => {
  User.getAllUsers((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// GET one user
exports.getOne = (req, res) => {
  User.getUserById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  });
};

// POST create user
exports.create = (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email || !role)
    return res.status(400).json({ message: "All fields are required" });

  const newUser = { name, email, role };

  User.createUser(newUser, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ id: result.insertId, ...newUser });
  });
};

// PUT update user
exports.update = (req, res) => {
  const id = req.params.id;
  if (req.body.password == ""){
    password = req.params.password;
  }
  const { name, email, password, role } = req.body;

  const updatedUser = { name, email, password, role };

  User.updateUser(id, updatedUser, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "User updated successfully" });
  });
};

// DELETE user
exports.remove = (req, res) => {
  const id = req.params.id;

  User.deleteUser(id, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "User deleted successfully" });
  });
};