import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendEmail } from './emailService.js';

export const sendNotification = async ({
  userId,
  userIds,
  role,
  type,
  title,
  message,
  priority = 'normal',
  data = {},
  actionUrl = null,
  expiresAt = null,
  relatedEntityType = null,
  relatedEntityId = null,
  sendEmail: shouldSendEmail = false,
}) => {
  try {
    let targetUserIds = [];

    if (userId) {
      targetUserIds = [userId];
    } else if (userIds) {
      targetUserIds = userIds;
    } else if (role) {
      const users = await User.findAll({
        where: { role, isActive: true },
        attributes: ['id'],
      });
      targetUserIds = users.map(user => user.id);
    }

    if (targetUserIds.length === 0) {
      console.warn('No target users found for notification');
      return;
    }

    // Create notifications for all target users
    const notifications = await Promise.all(
      targetUserIds.map(async (targetUserId) => {
        const notification = await Notification.create({
          userId: targetUserId,
          title,
          message,
          type,
          priority,
          data,
          actionUrl,
          expiresAt,
          relatedEntityType,
          relatedEntityId,
          sentVia: {
            inApp: true,
            email: shouldSendEmail,
            sms: false,
          },
        });

        // Send email if requested
        if (shouldSendEmail) {
          const user = await User.findByPk(targetUserId);
          if (user && user.email) {
            await sendEmail({
              to: user.email,
              subject: title,
              template: 'notification',
              data: {
                firstName: user.firstName,
                title,
                message,
                actionUrl,
              },
            });
          }
        }

        return notification;
      })
    );

    // Emit real-time notifications via Socket.io
    const io = global.io;
    if (io) {
      targetUserIds.forEach(targetUserId => {
        io.to(`user_${targetUserId}`).emit('newNotification', {
          id: notifications.find(n => n.userId === targetUserId)?.id,
          title,
          message,
          type,
          priority,
          data,
          actionUrl,
          createdAt: new Date(),
        });
      });
    }

    return notifications;

  } catch (error) {
    console.error('Send notification error:', error);
    throw error;
  }
};

// Send booking-related notifications
export const sendBookingNotification = async (booking, action, additionalData = {}) => {
  const notificationMap = {
    created: {
      title: 'New Booking Request',
      message: `A new booking request has been submitted for ${booking.laboratory?.name}`,
      type: 'booking',
      recipients: ['technical_officer', 'lecture_in_charge'],
    },
    approved: {
      title: 'Booking Approved',
      message: `Your booking for ${booking.laboratory?.name} has been approved`,
      type: 'approval',
      recipients: [booking.userId],
    },
    rejected: {
      title: 'Booking Rejected',
      message: `Your booking for ${booking.laboratory?.name} has been rejected`,
      type: 'rejection',
      recipients: [booking.userId],
    },
    cancelled: {
      title: 'Booking Cancelled',
      message: `Booking for ${booking.laboratory?.name} has been cancelled`,
      type: 'cancellation',
      recipients: [booking.userId],
    },
    reminder: {
      title: 'Booking Reminder',
      message: `Your booking for ${booking.laboratory?.name} starts soon`,
      type: 'reminder',
      recipients: [booking.userId],
    },
  };

  const config = notificationMap[action];
  if (!config) return;

  const data = {
    bookingId: booking.id,
    laboratoryId: booking.laboratoryId,
    laboratoryName: booking.laboratory?.name,
    startTime: booking.startTime,
    endTime: booking.endTime,
    ...additionalData,
  };

  if (Array.isArray(config.recipients) && config.recipients.every(r => typeof r === 'string')) {
    // Recipients are roles
    for (const role of config.recipients) {
      await sendNotification({
        role,
        title: config.title,
        message: config.message,
        type: config.type,
        data,
        actionUrl: `/bookings/${booking.id}`,
        relatedEntityType: 'booking',
        relatedEntityId: booking.id,
        sendEmail: true,
      });
    }
  } else {
    // Recipients are user IDs
    await sendNotification({
      userIds: config.recipients,
      title: config.title,
      message: config.message,
      type: config.type,
      data,
      actionUrl: `/bookings/${booking.id}`,
      relatedEntityType: 'booking',
      relatedEntityId: booking.id,
      sendEmail: true,
    });
  }
};

// Send equipment-related notifications
export const sendEquipmentNotification = async (equipment, action, additionalData = {}) => {
  const notificationMap = {
    created: {
      title: 'New Equipment Added',
      message: `New equipment "${equipment.name}" has been added to ${equipment.laboratory?.name}`,
      type: 'equipment',
      recipients: ['technical_officer', 'lecture_in_charge'],
    },
    statusChanged: {
      title: 'Equipment Status Updated',
      message: `Equipment "${equipment.name}" status changed to ${equipment.status}`,
      type: 'equipment',
      recipients: ['technical_officer', 'lecture_in_charge'],
    },
    maintenanceRequired: {
      title: 'Equipment Maintenance Required',
      message: `Equipment "${equipment.name}" requires maintenance`,
      type: 'equipment',
      priority: 'high',
      recipients: ['technical_officer'],
    },
  };

  const config = notificationMap[action];
  if (!config) return;

  const data = {
    equipmentId: equipment.id,
    equipmentName: equipment.name,
    laboratoryId: equipment.laboratoryId,
    laboratoryName: equipment.laboratory?.name,
    status: equipment.status,
    ...additionalData,
  };

  for (const role of config.recipients) {
    await sendNotification({
      role,
      title: config.title,
      message: config.message,
      type: config.type,
      priority: config.priority || 'normal',
      data,
      actionUrl: `/equipment/${equipment.id}`,
      relatedEntityType: 'equipment',
      relatedEntityId: equipment.id,
    });
  }
};

// Clean up expired notifications
export const cleanupExpiredNotifications = async () => {
  try {
    const deletedCount = await Notification.destroy({
      where: {
        expiresAt: { [Op.lt]: new Date() },
      },
    });

    console.log(`Cleaned up ${deletedCount} expired notifications`);
    return deletedCount;
  } catch (error) {
    console.error('Cleanup expired notifications error:', error);
    throw error;
  }
};
