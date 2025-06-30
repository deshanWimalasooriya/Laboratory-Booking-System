'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('equipment', {
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
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      category: {
        type: Sequelize.ENUM('computer', 'microscope', 'projector', 'whiteboard', 'furniture', 'safety', 'measurement', 'other'),
        allowNull: false,
        defaultValue: 'other'
      },
      brand: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      model: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      serial_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },
      purchase_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      purchase_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      warranty_expiry: {
        type: Sequelize.DATE,
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
      status: {
        type: Sequelize.ENUM('working', 'not_working', 'under_repair', 'maintenance', 'retired'),
        allowNull: false,
        defaultValue: 'working'
      },
      condition: {
        type: Sequelize.ENUM('excellent', 'good', 'fair', 'poor'),
        allowNull: false,
        defaultValue: 'good'
      },
      location: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      specifications: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '{}'
      },
      maintenance_schedule: {
        type: Sequelize.JSON,
        allowNull: true
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '[]'
      },
      manuals: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '[]'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    await queryInterface.addIndex('equipment', ['code']);
    await queryInterface.addIndex('equipment', ['serial_number']);
    await queryInterface.addIndex('equipment', ['laboratory_id']);
    await queryInterface.addIndex('equipment', ['status']);
    await queryInterface.addIndex('equipment', ['category']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('equipment');
  }
};
