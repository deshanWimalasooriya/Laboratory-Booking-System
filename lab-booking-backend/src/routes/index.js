import express from 'express';

// Import individual route modules
import profileRoutes from './profileRoutes.js';
import messageRoutes from './messageRoutes.js';
import fileRoutes from './fileRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import labRoutes from './labRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import equipmentRoutes from './equipmentRoutes.js';
import scheduleRoutes from './scheduleRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import chatRoutes from './chatRoutes.js';
import approvalRoutes from './approvalRoutes.js';
import testRoutes from './test.js';
import { requireRole } from '../middleware/roleCheck.js';
import { authenticate } from '../middleware/auth.js';
import { adminHandler } from '../controllers/adminController.js'; // or wherever it is defined

// ...other imports


const router = express.Router();

// Mount routes
router.use('/profile', profileRoutes);
router.use('/messages', messageRoutes);
router.use('/files', fileRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/test', testRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/labs', labRoutes);
router.use('/bookings', bookingRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/notifications', notificationRoutes);
router.use('/chat', chatRoutes);
router.use('/approvals', approvalRoutes);
router.get('/admin', authenticate, requireRole('lecture_in_charge'), adminHandler);

// Health check route
router.get('/', (req, res) => {
  res.json({ 
    message: 'Lab Booking System API',
    version: '1.0.0',
    status: 'running'
  });
});

export default router;
