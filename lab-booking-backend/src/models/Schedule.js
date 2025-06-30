import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Schedule title is required' },
      len: { args: [3, 200], msg: 'Title must be between 3-200 characters' },
    },
  },
  description: {
    type: DataTypes.TEXT,
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
  instructorId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  courseCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  courseName: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  semester: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  academicYear: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  dayOfWeek: {
    type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
    allowNull: false,
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
    validate: {
      isAfterStartTime(value) {
        if (value <= this.startTime) {
          throw new Error('End time must be after start time');
        }
      },
    },
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfterStartDate(value) {
        if (value <= this.startDate) {
          throw new Error('End date must be after start date');
        }
      },
    },
  },
  maxStudents: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: { args: [1], msg: 'Max students must be at least 1' },
    },
  },
  scheduleType: {
    type: DataTypes.ENUM('regular', 'exam', 'makeup', 'special'),
    allowNull: false,
    defaultValue: 'regular',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  notes: {
    type: DataTypes.TEXT,
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
    { fields: ['laboratory_id'] },
    { fields: ['instructor_id'] },
    { fields: ['day_of_week'] },
    { fields: ['start_date'] },
    { fields: ['end_date'] },
    { fields: ['course_code'] },
    { fields: ['created_by'] },
  ],
});

// Instance methods
Schedule.prototype.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && 
         now >= this.startDate && 
         now <= this.endDate;
};

Schedule.prototype.getNextOccurrence = function() {
  const today = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDay = dayNames.indexOf(this.dayOfWeek);
  const todayDay = today.getDay();
  
  let daysUntilNext = targetDay - todayDay;
  if (daysUntilNext <= 0) {
    daysUntilNext += 7;
  }
  
  const nextOccurrence = new Date(today);
  nextOccurrence.setDate(today.getDate() + daysUntilNext);
  
  return nextOccurrence;
};

export default Schedule;
