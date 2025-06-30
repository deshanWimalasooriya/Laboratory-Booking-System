import User from './User.js';
import Laboratory from './Laboratory.js';
import Booking from './Booking.js';
import Equipment from './Equipment.js';
import Schedule from './Schedule.js';
import Notification from './Notification.js';
import ChatRoom from './ChatRoom.js';
import Message from './Message.js';
import UserChatRoom from './UserChatRoom.js';

// User associations
User.hasMany(Laboratory, { foreignKey: 'createdBy', as: 'createdLaboratories' });
User.hasMany(Laboratory, { foreignKey: 'updatedBy', as: 'updatedLaboratories' });
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
User.hasMany(Booking, { foreignKey: 'approvedBy', as: 'approvedBookings' });
User.hasMany(Booking, { foreignKey: 'rejectedBy', as: 'rejectedBookings' });
User.hasMany(Equipment, { foreignKey: 'createdBy', as: 'createdEquipment' });
User.hasMany(Equipment, { foreignKey: 'updatedBy', as: 'updatedEquipment' });
User.hasMany(Schedule, { foreignKey: 'instructorId', as: 'schedules' });
User.hasMany(Schedule, { foreignKey: 'createdBy', as: 'createdSchedules' });
User.hasMany(Schedule, { foreignKey: 'updatedBy', as: 'updatedSchedules' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasMany(ChatRoom, { foreignKey: 'createdBy', as: 'createdChatRooms' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.belongsToMany(ChatRoom, { through: UserChatRoom, as: 'chatRooms' });

// Laboratory associations
Laboratory.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Laboratory.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });
Laboratory.hasMany(Booking, { foreignKey: 'laboratoryId', as: 'bookings' });
Laboratory.hasMany(Equipment, { foreignKey: 'laboratoryId', as: 'equipment' });
Laboratory.hasMany(Schedule, { foreignKey: 'laboratoryId', as: 'schedules' });

// Booking associations
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Booking.belongsTo(User, { foreignKey: 'approvedBy', as: 'approvedByUser' });
Booking.belongsTo(User, { foreignKey: 'rejectedBy', as: 'rejectedByUser' });
Booking.belongsTo(Laboratory, { foreignKey: 'laboratoryId', as: 'laboratory' });
Booking.belongsTo(Booking, { foreignKey: 'parentBookingId', as: 'parentBooking' });
Booking.hasMany(Booking, { foreignKey: 'parentBookingId', as: 'recurringBookings' });

// Equipment associations
Equipment.belongsTo(Laboratory, { foreignKey: 'laboratoryId', as: 'laboratory' });
Equipment.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Equipment.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

// Schedule associations
Schedule.belongsTo(Laboratory, { foreignKey: 'laboratoryId', as: 'laboratory' });
Schedule.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });
Schedule.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Schedule.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Chat associations
ChatRoom.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
ChatRoom.hasMany(Message, { foreignKey: 'chatRoomId', as: 'messages' });
ChatRoom.belongsToMany(User, { through: UserChatRoom, as: 'members' });

// Message associations
Message.belongsTo(ChatRoom, { foreignKey: 'chatRoomId', as: 'chatRoom' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(Message, { foreignKey: 'replyToId', as: 'replyTo' });
Message.hasMany(Message, { foreignKey: 'replyToId', as: 'replies' });

// UserChatRoom associations
UserChatRoom.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserChatRoom.belongsTo(ChatRoom, { foreignKey: 'chatRoomId', as: 'chatRoom' });

export {
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
