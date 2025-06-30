'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('schedules', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      laboratory_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'laboratories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      instructor_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      course_code: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      course_name: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      semester: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      academic_year: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      day_of_week: {
        type: Sequelize.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      max_students: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      schedule_type: {
        type: Sequelize.ENUM('regular', 'exam', 'makeup', 'special'),
        allowNull: false,
        defaultValue: 'regular'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.addIndex('schedules', ['laboratory_id']);
    await queryInterface.addIndex('schedules', ['instructor_id']);
    await queryInterface.addIndex('schedules', ['day_of_week']);
    await queryInterface.addIndex('schedules', ['start_date']);
    await queryInterface.addIndex('schedules', ['end_date']);
    await queryInterface.addIndex('schedules', ['course_code']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('schedules');
  }
};
