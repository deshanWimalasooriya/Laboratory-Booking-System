'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('messages', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
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
      sender_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      message_type: {
        type: Sequelize.ENUM('text', 'image', 'file', 'voice', 'video', 'location', 'system'),
        allowNull: false,
        defaultValue: 'text'
      },
      attachments: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '[]'
      },
      reply_to_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'messages',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      is_edited: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      edited_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reactions: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '{}'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '{}'
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
    await queryInterface.addIndex('messages', ['chat_room_id']);
    await queryInterface.addIndex('messages', ['sender_id']);
    await queryInterface.addIndex('messages', ['message_type']);
    await queryInterface.addIndex('messages', ['created_at']);
    await queryInterface.addIndex('messages', ['reply_to_id']);
    await queryInterface.addIndex('messages', ['is_deleted']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('messages');
  }
};
