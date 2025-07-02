import cron from 'node-cron';
import { Op } from 'sequelize';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import { sendNotification } from './notificationService.js';
import { logger } from '../config/logger.js';

// Clean up expired notifications
export const cleanupExpiredNotifications = async () => {
  try {
    const deletedCount = await Notification.destroy({
      where: {
        expiresAt: { [Op.lt]: new Date() },
      },
    });

    logger.info(`Cleaned up ${deletedCount} expired notifications`);
    return deletedCount;
  } catch (error) {
    logger.error('Cleanup expired notifications error:', error);
    throw error;
  }
};

// Send booking reminders
export const sendBookingReminders = async () => {
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find bookings starting in 1 hour
    const oneHourReminders = await Booking.findAll({
      where: {
        status: 'approved',
        startTime: {
          [Op.between]: [now, oneHourFromNow],
        },
        notificationsSent: {
          reminder1h: false,
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'location'],
        },
      ],
    });

    // Send 1-hour reminders
    for (const booking of oneHourReminders) {
      await sendNotification({
        userId: booking.userId,
        type: 'reminder',
        title: 'Booking Reminder - Starting Soon',
        message: `Your booking for ${booking.laboratory.name} starts in 1 hour`,
        data: {
          bookingId: booking.id,
          laboratoryName: booking.laboratory.name,
          startTime: booking.startTime,
          location: booking.laboratory.location,
        },
        actionUrl: `/bookings/${booking.id}`,
        sendEmail: true,
      });

      // Update notification sent flag
      await booking.update({
        notificationsSent: {
          ...booking.notificationsSent,
          reminder1h: true,
        },
      });
    }

    // Find bookings starting in 24 hours
    const twentyFourHourReminders = await Booking.findAll({
      where: {
        status: 'approved',
        startTime: {
          [Op.between]: [twentyFourHoursFromNow, new Date(twentyFourHoursFromNow.getTime() + 60 * 60 * 1000)],
        },
        notificationsSent: {
          reminder24h: false,
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'location'],
        },
      ],
    });

    // Send 24-hour reminders
    for (const booking of twentyFourHourReminders) {
      await sendNotification({
        userId: booking.userId,
        type: 'reminder',
        title: 'Booking Reminder - Tomorrow',
        message: `Your booking for ${booking.laboratory.name} is scheduled for tomorrow`,
        data: {
          bookingId: booking.id,
          laboratoryName: booking.laboratory.name,
          startTime: booking.startTime,
          location: booking.laboratory.location,
        },
        actionUrl: `/bookings/${booking.id}`,
        sendEmail: true,
      });

      // Update notification sent flag
      await booking.update({
        notificationsSent: {
          ...booking.notificationsSent,
          reminder24h: true,
        },
      });
    }

    logger.info(`Sent ${oneHourReminders.length} 1-hour reminders and ${twentyFourHourReminders.length} 24-hour reminders`);

  } catch (error) {
    logger.error('Send booking reminders error:', error);
    throw error;
  }
};

// Mark completed bookings
export const markCompletedBookings = async () => {
  try {
    const now = new Date();

    const completedBookings = await Booking.findAll({
      where: {
        status: 'approved',
        endTime: { [Op.lt]: now },
      },
    });

    for (const booking of completedBookings) {
      await booking.update({ status: 'completed' });
    }

    logger.info(`Marked ${completedBookings.length} bookings as completed`);
    return completedBookings.length;

  } catch (error) {
    logger.error('Mark completed bookings error:', error);
    throw error;
  }
};

// Initialize cron jobs
export const initializeCronJobs = () => {
  // Clean up expired notifications daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      await cleanupExpiredNotifications();
    } catch (error) {
      logger.error('Cron job - cleanup notifications failed:', error);
    }
  });

  // Send booking reminders every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      await sendBookingReminders();
    } catch (error) {
      logger.error('Cron job - send reminders failed:', error);
    }
  });

  // Mark completed bookings every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await markCompletedBookings();
    } catch (error) {
      logger.error('Cron job - mark completed bookings failed:', error);
    }
  });

  logger.info('Cron jobs initialized successfully');
};
