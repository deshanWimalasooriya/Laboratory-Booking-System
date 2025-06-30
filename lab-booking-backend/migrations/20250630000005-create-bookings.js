'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bookings', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      booking_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      purpose: {
        type: Sequelize.ENUM('lecture', 'practical', 'research', 'meeting', 'exam', 'workshop', 'other'),
        allowNull: false,
        defaultValue: 'practical'
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      expected_attendees: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('draft', 'pending', 'approved', 'rejected', 'cancelled', 'completed', 'no_show'),
        allowNull: false,
        defaultValue: 'pending'
      },
      priority: {
        type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal'
      },
      is_recurring: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      recurring_pattern: {
        type: Sequelize.JSON,
        allowNull: true
      },
      parent_booking_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'bookings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      equipment_requested: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '[]'
      },
      special_requirements: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      approved_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rejected_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      rejected_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      check_in_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      check_out_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      actual_attendees: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      notifications_sent: {
        type: Sequelize.JSON,
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
    await queryInterface.addIndex('bookings', ['user_id']);
    await queryInterface.addIndex('bookings', ['laboratory_id']);
    await queryInterface.addIndex('bookings', ['status']);
    await queryInterface.addIndex('bookings', ['start_time']);
    await queryInterface.addIndex('bookings', ['end_time']);
    await queryInterface.addIndex('bookings', ['booking_number']);
    await queryInterface.addIndex('bookings', ['approved_by']);
    await queryInterface.addIndex('bookings', ['parent_booking_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('bookings');
  }
};
