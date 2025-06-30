import { Op } from 'sequelize';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { createResponse, createError } from '../utils/responseUtils.js';

// Get notifications for user
export const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead, type, priority } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };

    // Add filters
    if (isRead !== undefined) {
      whereClause.isRead = isRead === 'true';
    }

    if (type) {
      whereClause.type = type;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    // Filter out expired notifications
    whereClause[Op.or] = [
      { expiresAt: null },
      { expiresAt: { [Op.gt]: new Date() } },
    ];

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereClause,
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / limit);

    res.json(createResponse({
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    }));

  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json(createError('Failed to get notifications', 500));
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json(createError('Notification not found', 404));
    }

    await notification.markAsRead();

    res.json(createResponse({
      message: 'Notification marked as read',
      notification,
    }));

  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json(createError('Failed to mark notification as read', 500));
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.update(
      { 
        isRead: true, 
        readAt: new Date(),
      },
      { 
        where: { 
          userId: req.user.id, 
          isRead: false,
        },
      }
    );

    res.json(createResponse({
      message: 'All notifications marked as read',
    }));

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json(createError('Failed to mark all notifications as read', 500));
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json(createError('Notification not found', 404));
    }

    await notification.destroy();

    res.json(createResponse({
      message: 'Notification deleted successfully',
    }));

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json(createError('Failed to delete notification', 500));
  }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [unreadCount, totalCount, priorityStats] = await Promise.all([
      Notification.count({
        where: { 
          userId, 
          isRead: false,
          [Op.or]: [
            { expiresAt: null },
            { expiresAt: { [Op.gt]: new Date() } },
          ],
        },
      }),
      Notification.count({ where: { userId } }),
      Notification.findAll({
        where: { 
          userId, 
          isRead: false,
          [Op.or]: [
            { expiresAt: null },
            { expiresAt: { [Op.gt]: new Date() } },
          ],
        },
        attributes: [
          'priority',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['priority'],
        raw: true,
      }),
    ]);

    const priorityBreakdown = priorityStats.reduce((acc, stat) => {
      acc[stat.priority] = parseInt(stat.count);
      return acc;
    }, {});

    res.json(createResponse({
      unreadCount,
      totalCount,
      priorityBreakdown,
    }));

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json(createError('Failed to get notification statistics', 500));
  }
};

// Get notifications by type
export const getNotificationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: {
        userId: req.user.id,
        type,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } },
        ],
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / limit);

    res.json(createResponse({
      notifications,
      type,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    }));

  } catch (error) {
    console.error('Get notifications by type error:', error);
    res.status(500).json(createError('Failed to get notifications by type', 500));
  }
};

// Clear expired notifications
export const clearExpiredNotifications = async (req, res) => {
  try {
    const deletedCount = await Notification.destroy({
      where: {
        userId: req.user.id,
        expiresAt: { [Op.lt]: new Date() },
      },
    });

    res.json(createResponse({
      message: `${deletedCount} expired notifications cleared`,
      deletedCount,
    }));

  } catch (error) {
    console.error('Clear expired notifications error:', error);
    res.status(500).json(createError('Failed to clear expired notifications', 500));
  }
};
