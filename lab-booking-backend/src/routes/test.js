import express from 'express';

const router = express.Router();

// Simple test routes
router.get('/', (req, res) => {
  res.json({ message: 'Test route working' });
});

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

export default router;
