import express from 'express';
import { 
  getPendingBookings,
  approveBooking,
  rejectBooking,
  bulkApproveBookings,
  getApprovalStats
} from '../controllers/approvalController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAnyRole } from '../middleware/roleCheck.js';

const router = express.Router();

// Approval routes (Technical Officer and Lecture in Charge only)
router.get('/pending', authenticate, requireAnyRole('technical_officer', 'lecture_in_charge'), getPendingBookings);
router.get('/stats', authenticate, requireAnyRole('technical_officer', 'lecture_in_charge'), getApprovalStats);
router.post('/:id/approve', authenticate, requireAnyRole('technical_officer', 'lecture_in_charge'), approveBooking);
router.post('/:id/reject', authenticate, requireAnyRole('technical_officer', 'lecture_in_charge'), rejectBooking);
router.post('/bulk-approve', authenticate, requireAnyRole('technical_officer', 'lecture_in_charge'), bulkApproveBookings);

export default router;
