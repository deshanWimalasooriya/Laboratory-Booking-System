import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticate, requireRole('lecture_in_charge'), (req, res) => {
  res.json({ message: 'Get all users - TODO: Implement' });
});

// Get user by ID
router.get('/:id', authenticate, (req, res) => {
  res.json({ message: 'Get user by ID - TODO: Implement' });
});

// Update user
router.put('/:id', authenticate, (req, res) => {
  res.json({ message: 'Update user - TODO: Implement' });
});

// Delete user (admin only)
router.delete('/:id', authenticate, requireRole('lecture_in_charge'), (req, res) => {
  res.json({ message: 'Delete user - TODO: Implement' });
});

export default router;
