import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { profileImageUpload } from '../config/multer.js';
import {
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/profileController.js';

const router = express.Router();

// Get current user's profile
router.get('/', authenticate, getProfile);

// Update profile (with optional profile image upload)
router.put(
  '/',
  authenticate,
  profileImageUpload.single('profileImage'),
  updateProfile
);

// Change password
router.put('/password', authenticate, changePassword);

export default router;
