'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('laboratories', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      building: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      floor: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      room_number: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      lab_type: {
        type: Sequelize.ENUM('computer', 'chemistry', 'physics', 'biology', 'engineering', 'research', 'general'),
        allowNull: false,
        defaultValue: 'general'
      },
      facilities: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '[]'
      },
      safety_requirements: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '[]'
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '[]'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      maintenance_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      operating_hours: {
        type: Sequelize.JSON,
        allowNull: true
      },
      booking_rules: {
        type: Sequelize.JSON,
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
    await queryInterface.addIndex('laboratories', ['code']);
    await queryInterface.addIndex('laboratories', ['lab_type']);
    await queryInterface.addIndex('laboratories', ['is_active']);
    await queryInterface.addIndex('laboratories', ['created_by']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('laboratories');
  }
};
