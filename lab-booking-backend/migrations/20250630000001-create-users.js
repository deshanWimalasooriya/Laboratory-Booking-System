'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('student', 'instructor', 'technical_officer', 'lecture_in_charge'),
        allowNull: false,
        defaultValue: 'student'
      },
      profile_image: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      department: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      student_id: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      employee_id: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      email_verification_token: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      password_reset_token: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      password_reset_expires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['student_id']);
    await queryInterface.addIndex('users', ['employee_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
