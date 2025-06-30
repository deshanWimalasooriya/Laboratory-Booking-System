import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'First name is required' },
      len: { args: [2, 50], msg: 'First name must be between 2-50 characters' },
    },
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Last name is required' },
      len: { args: [2, 50], msg: 'Last name must be between 2-50 characters' },
    },
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Please provide a valid email' },
      notEmpty: { msg: 'Email is required' },
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: { args: [6, 255], msg: 'Password must be at least 6 characters' },
    },
  },
  role: {
    type: DataTypes.ENUM('student', 'instructor', 'technical_officer', 'lecture_in_charge'),
    allowNull: false,
    defaultValue: 'student',
  },
  profileImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      isNumeric: { msg: 'Phone number must contain only numbers' },
    },
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  studentId: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
  },
  employeeId: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  emailVerificationToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  passwordResetToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
  indexes: [
    { fields: ['email'] },
    { fields: ['role'] },
    { fields: ['student_id'] },
    { fields: ['employee_id'] },
  ],
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.emailVerificationToken;
  delete values.passwordResetToken;
  return values;
};

export default User;
