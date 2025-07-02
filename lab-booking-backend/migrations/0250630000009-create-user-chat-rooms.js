'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_chat_rooms', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
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
      chat_room_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'chat_rooms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('member', 'admin', 'moderator'),
        allowNull: false,
        defaultValue: 'member'
      },
      joined_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      left_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_read_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      settings: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '{"muteNotifications": false, "customName": null}'
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
    await queryInterface.addIndex('user_chat_rooms', ['user_id']);
    await queryInterface.addIndex('user_chat_rooms', ['chat_room_id']);
    await queryInterface.addIndex('user_chat_rooms', ['user_id', 'chat_room_id'], { unique: true });
    await queryInterface.addIndex('user_chat_rooms', ['is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_chat_rooms');
  }
};
