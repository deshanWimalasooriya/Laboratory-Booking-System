import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const UserChatRoom = sequelize.define('UserChatRoom', {
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
  chatRoomId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'chat_rooms',
      key: 'id',
    },
  },
  role: {
    type: DataTypes.ENUM('member', 'admin', 'moderator'),
    allowNull: false,
    defaultValue: 'member',
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  leftAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastReadAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      muteNotifications: false,
      customName: null,
    },
  },
}, {
  indexes: [
    { fields: ['user_id'] },
    { fields: ['chat_room_id'] },
    { fields: ['user_id', 'chat_room_id'], unique: true },
    { fields: ['is_active'] },
  ],
});

export default UserChatRoom;
