import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  chatRoomId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'chat_rooms',
      key: 'id',
    },
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  messageType: {
    type: DataTypes.ENUM('text', 'image', 'file', 'voice', 'video', 'location', 'system'),
    allowNull: false,
    defaultValue: 'text',
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  replyToId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'messages',
      key: 'id',
    },
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  editedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  reactions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
}, {
  indexes: [
    { fields: ['chat_room_id'] },
    { fields: ['sender_id'] },
    { fields: ['message_type'] },
    { fields: ['created_at'] },
    { fields: ['reply_to_id'] },
  ],
});

// Instance methods
Message.prototype.addReaction = async function(userId, emoji) {
  const reactions = this.reactions || {};
  if (!reactions[emoji]) {
    reactions[emoji] = [];
  }
  
  if (!reactions[emoji].includes(userId)) {
    reactions[emoji].push(userId);
    await this.update({ reactions });
  }
};

Message.prototype.removeReaction = async function(userId, emoji) {
  const reactions = this.reactions || {};
  if (reactions[emoji]) {
    reactions[emoji] = reactions[emoji].filter(id => id !== userId);
    if (reactions[emoji].length === 0) {
      delete reactions[emoji];
    }
    await this.update({ reactions });
  }
};

export default Message;
