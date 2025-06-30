import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Notification title is required' },
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Notification message is required' },
    },
  },
  type: {
    type: DataTypes.ENUM('booking', 'approval', 'rejection', 'cancellation', 'reminder', 'system', 'equipment', 'schedule'),
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'normal',
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  actionUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  sentVia: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      inApp: true,
      email: false,
      sms: false,
    },
  },
  relatedEntityType: {
    type: DataTypes.ENUM('booking', 'laboratory', 'equipment', 'schedule', 'user'),
    allowNull: true,
  },
  relatedEntityId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['user_id'] },
    { fields: ['type'] },
    { fields: ['is_read'] },
    { fields: ['priority'] },
    { fields: ['created_at'] },
    { fields: ['related_entity_type', 'related_entity_id'] },
  ],
});

// Instance methods
Notification.prototype.markAsRead = async function() {
  if (!this.isRead) {
    await this.update({
      isRead: true,
      readAt: new Date(),
    });
  }
};

Notification.prototype.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

export default Notification;
