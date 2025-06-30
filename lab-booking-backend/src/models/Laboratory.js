import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Laboratory = sequelize.define('Laboratory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Laboratory name is required' },
      len: { args: [3, 100], msg: 'Laboratory name must be between 3-100 characters' },
    },
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Laboratory code is required' },
      isAlphanumeric: { msg: 'Laboratory code must be alphanumeric' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Capacity must be at least 1' },
      max: { args: [200], msg: 'Capacity cannot exceed 200' },
    },
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Location is required' },
    },
  },
  building: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  floor: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  roomNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  labType: {
    type: DataTypes.ENUM('computer', 'chemistry', 'physics', 'biology', 'engineering', 'research', 'general'),
    allowNull: false,
    defaultValue: 'general',
  },
  facilities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  safetyRequirements: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  maintenanceMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  operatingHours: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      monday: { start: '08:00', end: '17:00', closed: false },
      tuesday: { start: '08:00', end: '17:00', closed: false },
      wednesday: { start: '08:00', end: '17:00', closed: false },
      thursday: { start: '08:00', end: '17:00', closed: false },
      friday: { start: '08:00', end: '17:00', closed: false },
      saturday: { start: '09:00', end: '13:00', closed: false },
      sunday: { start: '09:00', end: '13:00', closed: true },
    },
  },
  bookingRules: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      maxBookingDuration: 180, // minutes
      minAdvanceBooking: 30, // minutes
      maxAdvanceBooking: 2160, // minutes (1.5 days)
      allowRecurring: true,
      requireApproval: true,
    },
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  indexes: [
    { fields: ['code'] },
    { fields: ['lab_type'] },
    { fields: ['is_active'] },
    { fields: ['created_by'] },
  ],
});

// Instance methods
Laboratory.prototype.isAvailable = function(startTime, endTime) {
  // Check if lab is active and not in maintenance
  if (!this.isActive || this.maintenanceMode) {
    return false;
  }

  // Check operating hours
  const dayOfWeek = new Date(startTime).toLocaleLowerCase().slice(0, 3);
  const operatingHour = this.operatingHours[dayOfWeek];
  
  if (operatingHour?.closed) {
    return false;
  }

  // Additional availability logic can be added here
  return true;
};

export default Laboratory;
