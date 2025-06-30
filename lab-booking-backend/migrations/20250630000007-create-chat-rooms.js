'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chat_rooms', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('direct', 'group', 'department', 'laboratory'),
        allowNull: false,
        defaultValue: 'direct'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      avatar: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      settings: {
        type: Sequelize.JSON,
        allowNull: true
      },
      last_message_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('chat_rooms', ['type']);
    await queryInterface.addIndex('chat_rooms', ['is_active']);
    await queryInterface.addIndex('chat_rooms', ['created_by']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('chat_rooms');
  }
};
