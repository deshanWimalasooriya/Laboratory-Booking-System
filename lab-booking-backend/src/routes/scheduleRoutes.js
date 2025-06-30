import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Schedule routes (TODO: Implement controllers)
router.get('/', authenticate, (req, res) => {
  res.json({ message: 'Get schedules - TODO: Implement' });
});

router.get('/:id', authenticate, (req, res) => {
  res.json({ message: 'Get schedule by ID - TODO: Implement' });
});

router.post('/', authenticate, (req, res) => {
  res.json({ message: 'Create schedule - TODO: Implement' });
});

router.put('/:id', authenticate, (req, res) => {
  res.json({ message: 'Update schedule - TODO: Implement' });
});

router.delete('/:id', authenticate, (req, res) => {
  res.json({ message: 'Delete schedule - TODO: Implement' });
});

export default router;
