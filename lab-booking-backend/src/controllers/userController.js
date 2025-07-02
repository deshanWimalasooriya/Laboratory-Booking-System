import { Op } from 'sequelize';
import User from '../models/User.js';
import { createResponse, createError } from '../utils/responseUtils.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/fileService.js';

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      department,
      isActive,
      sortBy = 'firstName',
      sortOrder = 'ASC',
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { studentId: { [Op.like]: `%${search}%` } },
        { employeeId: { [Op.like]: `%${search}%` } },
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (department) {
      whereClause.department = department;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / limit);

    res.json(createResponse({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    }));

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json(createError('Failed to get users', 500));
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
    });

    if (!user) {
      return res.status(404).json(createError('User not found', 404));
    }

    // Check permissions - users can only view their own profile unless admin
    if (req.user.id !== id && req.user.role !== 'lecture_in_charge') {
      return res.status(403).json(createError('Access denied', 403));
    }

    res.json(createResponse({ user }));

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json(createError('Failed to get user', 500));
  }
};

// Update user profile
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json(createError('User not found', 404));
    }

    // Check permissions
    const canUpdate = req.user.id === id || req.user.role === 'lecture_in_charge';
    if (!canUpdate) {
      return res.status(403).json(createError('Access denied', 403));
    }

    // Restrict role changes to admin only
    if (updates.role && req.user.role !== 'lecture_in_charge') {
      delete updates.role;
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

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.password;
    delete updates.emailVerificationToken;
    delete updates.passwordResetToken;

    await user.update(updates);

    // Return updated user without sensitive data
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
    });

    res.json(createResponse({
      message: 'User updated successfully',
      user: updatedUser,
    }));

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json(createError('Failed to update user', 500));
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json(createError('Current password and new password are required', 400));
    }

    if (newPassword.length < 6) {
      return res.status(400).json(createError('New password must be at least 6 characters long', 400));
    }

    const user = await User.findByPk(id, {
      attributes: { include: ['password'] },
    });

    if (!user) {
      return res.status(404).json(createError('User not found', 404));
    }

    // Check permissions - users can only change their own password
    if (req.user.id !== id) {
      return res.status(403).json(createError('Access denied', 403));
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json(createError('Current password is incorrect', 400));
    }

    // Update password (will be hashed by the model hook)
    await user.update({ password: newPassword });

    res.json(createResponse({
      message: 'Password changed successfully',
    }));

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(createError('Failed to change password', 500));
  }
};

// Deactivate user (Admin only)
export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json(createError('User not found', 404));
    }

    // Prevent admin from deactivating themselves
    if (req.user.id === id) {
      return res.status(400).json(createError('Cannot deactivate your own account', 400));
    }

    await user.update({ isActive: false });

    res.json(createResponse({
      message: 'User deactivated successfully',
    }));

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json(createError('Failed to deactivate user', 500));
  }
};

// Activate user (Admin only)
export const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json(createError('User not found', 404));
    }

    await user.update({ isActive: true });

    res.json(createResponse({
      message: 'User activated successfully',
    }));

  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json(createError('Failed to activate user', 500));
  }
};

// Get user statistics (Admin only)
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const inactiveUsers = totalUsers - activeUsers;

    // Users by role
    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['role'],
      raw: true,
    });

    // Recent registrations (last 30 days)
    const recentRegistrations = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      recentRegistrations,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = parseInt(item.count);
        return acc;
      }, {}),
    };

    res.json(createResponse({ stats }));

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json(createError('Failed to get user statistics', 500));
  }
};
