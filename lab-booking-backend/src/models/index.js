import { sequelize } from '../config/database.js';

// Import all models
import User from './User.js';
import Laboratory from './Laboratory.js';
import Booking from './Booking.js';
import Equipment from './Equipment.js';
import Schedule from './Schedule.js';
import Notification from './Notification.js';
import ChatRoom from './ChatRoom.js';
import Message from './Message.js';
import UserChatRoom from './UserChatRoom.js';

// ====================
// Model Associations
// ====================

// User - Booking
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Laboratory - Booking
Laboratory.hasMany(Booking, { foreignKey: 'laboratoryId', as: 'bookings' });
Booking.belongsTo(Laboratory, { foreignKey: 'laboratoryId', as: 'laboratory' });

// Laboratory - Equipment
Laboratory.hasMany(Equipment, { foreignKey: 'laboratoryId', as: 'equipment' });
Equipment.belongsTo(Laboratory, { foreignKey: 'laboratoryId', as: 'laboratory' });

// User - Equipment (created/updated by)
User.hasMany(Equipment, { foreignKey: 'createdBy', as: 'equipmentCreated' });
User.hasMany(Equipment, { foreignKey: 'updatedBy', as: 'equipmentUpdated' });

// User - Notification
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Laboratory - Schedule
Laboratory.hasMany(Schedule, { foreignKey: 'laboratoryId', as: 'schedules' });
Schedule.belongsTo(Laboratory, { foreignKey: 'laboratoryId', as: 'laboratory' });

// User - Schedule (instructor)
User.hasMany(Schedule, { foreignKey: 'instructorId', as: 'instructedSchedules' });
Schedule.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

// User - Schedule (created/updated by)
User.hasMany(Schedule, { foreignKey: 'createdBy', as: 'schedulesCreated' });
User.hasMany(Schedule, { foreignKey: 'updatedBy', as: 'schedulesUpdated' });

// ChatRoom - Message
ChatRoom.hasMany(Message, { foreignKey: 'chatRoomId', as: 'messages' });
Message.belongsTo(ChatRoom, { foreignKey: 'chatRoomId', as: 'chatRoom' });

// User - Message (sender)
User.hasMany(Message, { foreignKey: 'senderId', as: 'messagesSent' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// Message - Message (replyTo)
Message.belongsTo(Message, { foreignKey: 'replyToId', as: 'replyTo' });

// ChatRoom - User (many-to-many via UserChatRoom)
ChatRoom.belongsToMany(User, {
  through: UserChatRoom,
  foreignKey: 'chatRoomId',
  otherKey: 'userId',
  as: 'members',
});
User.belongsToMany(ChatRoom, {
  through: UserChatRoom,
  foreignKey: 'userId',
  otherKey: 'chatRoomId',
  as: 'chatRooms',
});

// UserChatRoom belongs to User and ChatRoom
UserChatRoom.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserChatRoom.belongsTo(ChatRoom, { foreignKey: 'chatRoomId', as: 'chatRoom' });
User.hasMany(UserChatRoom, { foreignKey: 'userId', as: 'userChatRooms' });
ChatRoom.hasMany(UserChatRoom, { foreignKey: 'chatRoomId', as: 'userChatRooms' });

// Export all models and sequelize instance
export {
  sequelize,
  User,
  Laboratory,
  Booking,
  Equipment,
  Schedule,
  Notification,
  ChatRoom,
  Message,
  UserChatRoom,
};
