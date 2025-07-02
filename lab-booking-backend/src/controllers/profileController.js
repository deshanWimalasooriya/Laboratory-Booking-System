import User from '../models/User.js';
import { createResponse, createError } from '../utils/responseUtils.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/fileService.js';

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
    });

    if (!user) {
      return res.status(404).json(createError('User not found', 404));
    }

    res.json(createResponse({ user }));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(createError('Failed to get profile', 500));
  }
};

// Update current user profile
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json(createError('User not found', 404));
    }

    // Handle profile image upload
    if (req.file) {
      // Delete old profile image if exists
      if (user.profileImage) {
        const oldImagePublicId = user.profileImage.split('/').pop().split('.')[0];
        await deleteFromCloudinary(oldImagePublicId);
      }

      // Upload new image
      const result = await uploadToCloudinary(req.file.buffer, 'profiles');
      updates.profileImage = result.secure_url;
    }

    // Remove sensitive fields
    delete updates.password;
    delete updates.emailVerificationToken;
    delete updates.passwordResetToken;

    await user.update(updates);

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
    });

    res.json(createResponse({
      message: 'Profile updated successfully',
      user: updatedUser,
    }));
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(createError('Failed to update profile', 500));
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json(createError('Current password and new password are required', 400));
    }

    if (newPassword.length < 6) {
      return res.status(400).json(createError('New password must be at least 6 characters long', 400));
    }

    const user = await User.findByPk(req.user.id, {
      attributes: { include: ['password'] },
    });

    if (!user) {
      return res.status(404).json(createError('User not found', 404));
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json(createError('Current password is incorrect', 400));
    }

    await user.update({ password: newPassword });

    res.json(createResponse({
      message: 'Password changed successfully',
    }));
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(createError('Failed to change password', 500));
  }
};

// Delete profile image
export const deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json(createError('User not found', 404));
    }

    if (user.profileImage) {
      const publicId = user.profileImage.split('/').pop().split('.')[0];
      await deleteFromCloudinary(publicId);
      
      await user.update({ profileImage: null });
    }

    res.json(createResponse({
      message: 'Profile image deleted successfully',
    }));
  } catch (error) {
    console.error('Delete profile image error:', error);
    res.status(500).json(createError('Failed to delete profile image', 500));
  }
};
