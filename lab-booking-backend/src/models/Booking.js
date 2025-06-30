import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  bookingNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  laboratoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'laboratories',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Booking title is required' },
      len: { args: [5, 200], msg: 'Title must be between 5-200 characters' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  purpose: {
    type: DataTypes.ENUM('lecture', 'practical', 'research', 'meeting', 'exam', 'workshop', 'other'),
    allowNull: false,
    defaultValue: 'practical',
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: { msg: 'Start time must be a valid date' },
      isAfter: {
        args: new Date().toISOString(),
        msg: 'Start time must be in the future',
      },
    },
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: { msg: 'End time must be a valid date' },
      isAfterStartTime(value) {
        if (value <= this.startTime) {
          throw new Error('End time must be after start time');
        }
      },
    },
  },
  expectedAttendees: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Expected attendees must be at least 1' },
    },
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected', 'cancelled', 'completed', 'no_show'),
    allowNull: false,
    defaultValue: 'pending',
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'normal',
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recurringPattern: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
  },
  parentBookingId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'bookings',
      key: 'id',
    },
  },
  equipmentRequested: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  specialRequirements: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejectedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  rejectedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  checkInTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  checkOutTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  actualAttendees: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: { args: [1], msg: 'Rating must be between 1-5' },
      max: { args: [5], msg: 'Rating must be between 1-5' },
    },
  },
  notificationsSent: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      created: false,
      approved: false,
      rejected: false,
      reminder24h: false,
      reminder1h: false,
      completed: false,
    },
  },
}, {
  hooks: {
    beforeCreate: async (booking) => {
      // Generate booking number
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      booking.bookingNumber = `BK${year}${month}${day}${random}`;
    },
  },
  indexes: [
    { fields: ['user_id'] },
    { fields: ['laboratory_id'] },
    { fields: ['status'] },
    { fields: ['start_time'] },
    { fields: ['end_time'] },
    { fields: ['booking_number'] },
    { fields: ['approved_by'] },
    { fields: ['parent_booking_id'] },
  ],
});

// Instance methods
Booking.prototype.getDuration = function() {
  return Math.ceil((this.endTime - this.startTime) / (1000 * 60)); // Duration in minutes
};

Booking.prototype.canBeCancelled = function() {
  const now = new Date();
  const startTime = new Date(this.startTime);
  const timeDiff = startTime - now;
  const hoursUntilStart = timeDiff / (1000 * 60 * 60);
  
  return ['pending', 'approved'].includes(this.status) && hoursUntilStart > 1;
};

Booking.prototype.canBeModified = function() {
  const now = new Date();
  const startTime = new Date(this.startTime);
  const timeDiff = startTime - now;
  const hoursUntilStart = timeDiff / (1000 * 60 * 60);
  
  return ['draft', 'pending'].includes(this.status) && hoursUntilStart > 2;
};

export default Booking;
