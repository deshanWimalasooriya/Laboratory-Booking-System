import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getDashboardStats,
  getRecentActivities,
} from '../controllers/dashboardController.js';

const router = express.Router();

// Get dashboard statistics for the logged-in user
router.get('/stats', authenticate, getDashboardStats);

// Get recent activities (bookings, messages, etc.)
router.get('/activities', authenticate, getRecentActivities);

export default router;
