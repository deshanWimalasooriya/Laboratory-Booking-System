import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Equipment = sequelize.define('Equipment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Equipment name is required' },
      len: { args: [2, 100], msg: 'Equipment name must be between 2-100 characters' },
    },
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Equipment code is required' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM('computer', 'microscope', 'projector', 'whiteboard', 'furniture', 'safety', 'measurement', 'other'),
    allowNull: false,
    defaultValue: 'other',
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  serialNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  warrantyExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  laboratoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'laboratories',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('working', 'not_working', 'under_repair', 'maintenance', 'retired'),
    allowNull: false,
    defaultValue: 'working',
  },
  condition: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor'),
    allowNull: false,
    defaultValue: 'good',
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  specifications: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  maintenanceSchedule: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      frequency: 'monthly',
      lastMaintenance: null,
      nextMaintenance: null,
    },
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  manuals: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
    { fields: ['serial_number'] },
    { fields: ['laboratory_id'] },
    { fields: ['status'] },
    { fields: ['category'] },
    { fields: ['created_by'] },
  ],
});

// Instance methods
Equipment.prototype.isAvailable = function() {
  return this.status === 'working' && this.isActive;
};

Equipment.prototype.needsMaintenance = function() {
  if (!this.maintenanceSchedule?.nextMaintenance) return false;
  return new Date(this.maintenanceSchedule.nextMaintenance) <= new Date();
};

export default Equipment;
