import express from 'express';
import { 
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStats,
  getNotificationsByType,
  clearExpiredNotifications
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Notification routes
router.get('/', authenticate, getUserNotifications);
router.get('/stats', authenticate, getNotificationStats);
router.get('/type/:notificationType', authenticate, getNotificationsByType); // Fixed parameter name
router.patch('/:id/read', authenticate, markNotificationAsRead);
router.patch('/read-all', authenticate, markAllNotificationsAsRead);
router.delete('/:id', authenticate, deleteNotification);
router.delete('/expired', authenticate, clearExpiredNotifications);

export default router;
