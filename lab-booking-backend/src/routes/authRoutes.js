import express from 'express';
import { 
  register, 
  login, 
  logout, 
  refreshToken, 
  getProfile, 
  verifyEmail, 
  forgotPassword, 
  resetPassword 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadProfileImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', authenticate, getProfile);

export default router;
