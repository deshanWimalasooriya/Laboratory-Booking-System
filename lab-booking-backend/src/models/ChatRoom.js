import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ChatRoom = sequelize.define('ChatRoom', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('direct', 'group', 'department', 'laboratory'),
    allowNull: false,
    defaultValue: 'direct',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      allowFileSharing: true,
      allowVoiceMessages: true,
      muteNotifications: false,
      autoDeleteMessages: false,
      autoDeleteDays: 30,
    },
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  indexes: [
    { fields: ['type'] },
    { fields: ['is_active'] },
    { fields: ['last_message_at'] },
    { fields: ['created_by'] },
  ],
});

export default ChatRoom;
