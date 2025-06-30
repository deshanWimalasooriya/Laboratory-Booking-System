import express from 'express';
import { 
  createBooking,
  getUserBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  getLabAvailability
} from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Booking routes
router.post('/', authenticate, createBooking);
router.get('/', authenticate, getUserBookings);
router.get('/:id', authenticate, getBookingById);
router.put('/:id', authenticate, updateBooking);
router.delete('/:id', authenticate, cancelBooking);

// Availability routes - Fix the parameter name
router.get('/lab/:laboratoryId/availability', authenticate, getLabAvailability);

export default router;
