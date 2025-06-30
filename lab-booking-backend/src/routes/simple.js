import express from 'express';

const router = express.Router();

// Test routes with proper parameter names
router.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

// Add one route at a time to find the problematic one
router.get('/bookings/:id', (req, res) => {
  res.json({ message: `Booking ${req.params.id}` });
});


router.get('/users', (req, res) => {
  res.json({ message: 'Users endpoint' });
});

router.get('/users/:id', (req, res) => {
  res.json({ message: `User ${req.params.id}` });
});

router.get('/labs', (req, res) => {
  res.json({ message: 'Labs endpoint' });
});

router.get('/labs/:labId', (req, res) => {
  res.json({ message: `Lab ${req.params.labId}` });
});

export default router;
