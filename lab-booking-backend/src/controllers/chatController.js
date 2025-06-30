import { Op } from 'sequelize';
import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import UserChatRoom from '../models/UserChatRoom.js';
import { createResponse, createError } from '../utils/responseUtils.js';
import { uploadToCloudinary } from '../services/fileService.js';

// Get user's chat rooms
export const getUserChatRooms = async (req, res) => {
  try {
    const userId = req.user.id;

    const chatRooms = await ChatRoom.findAll({
      include: [
        {
          model: User,
          as: 'members',
          where: { id: userId },
          through: {
            where: { isActive: true },
            attributes: ['role', 'lastReadAt', 'settings'],
          },
          attributes: ['id', 'firstName', 'lastName', 'profileImage', 'role'],
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'firstName', 'lastName', 'profileImage'],
            },
          ],
        },
      ],
      where: { isActive: true },
      order: [['lastMessageAt', 'DESC']],
    });

    // Get unread message counts for each chat room
    const chatRoomsWithUnreadCount = await Promise.all(
      chatRooms.map(async (chatRoom) => {
        const userChatRoom = await UserChatRoom.findOne({
          where: {
            userId,
            chatRoomId: chatRoom.id,
          },
        });

        const unreadCount = await Message.count({
          where: {
            chatRoomId: chatRoom.id,
            createdAt: {
              [Op.gt]: userChatRoom?.lastReadAt || new Date(0),
            },
            senderId: { [Op.ne]: userId },
          },
        });

        return {
          ...chatRoom.toJSON(),
          unreadCount,
        };
      })
    );

    res.json(createResponse({
      chatRooms: chatRoomsWithUnreadCount,
    }));

  } catch (error) {
    console.error('Get user chat rooms error:', error);
    res.status(500).json(createError('Failed to get chat rooms', 500));
  }
};

// Create new chat room
export const createChatRoom = async (req, res) => {
  try {
    const { name, description, type, memberIds } = req.body;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json(createError('Member IDs are required', 400));
    }

    // For direct chats, check if room already exists
    if (type === 'direct' && memberIds.length === 1) {
      const existingRoom = await ChatRoom.findOne({
        where: { type: 'direct' },
        include: [
          {
            model: User,
            as: 'members',
            where: {
              id: { [Op.in]: [req.user.id, memberIds[0]] },
            },
            through: { where: { isActive: true } },
          },
        ],
        having: sequelize.literal('COUNT(members.id) = 2'),
        group: ['ChatRoom.id'],
      });

      if (existingRoom) {
        return res.json(createResponse({
          message: 'Chat room already exists',
          chatRoom: existingRoom,
        }));
      }
    }

    // Verify all members exist
    const members = await User.findAll({
      where: { id: { [Op.in]: memberIds } },
      attributes: ['id', 'firstName', 'lastName', 'profileImage'],
    });

    if (members.length !== memberIds.length) {
      return res.status(400).json(createError('Some members not found', 400));
    }

    // Create chat room
    const chatRoom = await ChatRoom.create({
      name: type === 'direct' ? null : name,
      description,
      type,
      createdBy: req.user.id,
    });

    // Add members to chat room
    const userChatRoomData = [
      {
        userId: req.user.id,
        chatRoomId: chatRoom.id,
        role: 'admin',
      },
      ...memberIds.map(memberId => ({
        userId: memberId,
        chatRoomId: chatRoom.id,
        role: 'member',
      })),
    ];

    await UserChatRoom.bulkCreate(userChatRoomData);

    // Load chat room with members
    const chatRoomWithMembers = await ChatRoom.findByPk(chatRoom.id, {
      include: [
        {
          model: User,
          as: 'members',
          through: { attributes: ['role'] },
          attributes: ['id', 'firstName', 'lastName', 'profileImage', 'role'],
        },
      ],
    });

    res.status(201).json(createResponse({
      message: 'Chat room created successfully',
      chatRoom: chatRoomWithMembers,
    }, 201));

  } catch (error) {
    console.error('Create chat room error:', error);
    res.status(500).json(createError('Failed to create chat room', 500));
  }
};

// Get chat room messages
export const getChatRoomMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is member of chat room
    const userChatRoom = await UserChatRoom.findOne({
      where: {
        userId: req.user.id,
        chatRoomId,
        isActive: true,
      },
    });

    if (!userChatRoom) {
      return res.status(403).json(createError('Access denied', 403));
    }

    const offset = (page - 1) * limit;

    const { count, rows: messages } = await Message.findAndCountAll({
      where: {
        chatRoomId,
        isDeleted: false,
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'profileImage', 'role'],
        },
        {
          model: Message,
          as: 'replyTo',
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'firstName', 'lastName'],
            },
          ],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Update last read timestamp
    await userChatRoom.update({ lastReadAt: new Date() });

    const totalPages = Math.ceil(count / limit);

    res.json(createResponse({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    }));

  } catch (error) {
    console.error('Get chat room messages error:', error);
    res.status(500).json(createError('Failed to get messages', 500));
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { content, messageType = 'text', replyToId } = req.body;

    // Verify user is member of chat room
    const userChatRoom = await UserChatRoom.findOne({
      where: {
        userId: req.user.id,
        chatRoomId,
        isActive: true,
      },
    });

    if (!userChatRoom) {
      return res.status(403).json(createError('Access denied', 403));
    }

    // Verify chat room exists and is active
    const chatRoom = await ChatRoom.findOne({
      where: { id: chatRoomId, isActive: true },
    });

    if (!chatRoom) {
      return res.status(404).json(createError('Chat room not found', 404));
    }

    // Handle file attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'chat');
        attachments.push({
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
        });
      }
    }

    // Create message
    const message = await Message.create({
      chatRoomId,
      senderId: req.user.id,
      content: content || null,
      messageType,
      attachments,
      replyToId: replyToId || null,
    });

    // Update chat room's last message timestamp
    await chatRoom.update({ lastMessageAt: new Date() });

    // Load message with sender info
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'profileImage', 'role'],
        },
        {
          model: Message,
          as: 'replyTo',
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'firstName', 'lastName'],
            },
          ],
          required: false,
        },
      ],
    });

    // Emit to socket for real-time delivery
    req.app.get('io').to(chatRoomId).emit('newMessage', messageWithSender);

    res.status(201).json(createResponse({
      message: messageWithSender,
    }, 201));

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json(createError('Failed to send message', 500));
  }
};

// Edit message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json(createError('Message not found', 404));
    }

    // Only sender can edit message
    if (message.senderId !== req.user.id) {
      return res.status(403).json(createError('Access denied', 403));
    }

    // Can't edit messages older than 24 hours
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const maxEditTime = 24 * 60 * 60 * 1000; // 24 hours

    if (messageAge > maxEditTime) {
      return res.status(400).json(createError('Message too old to edit', 400));
    }

    await message.update({
      content,
      isEdited: true,
      editedAt: new Date(),
    });

    // Load updated message with sender info
    const updatedMessage = await Message.findByPk(messageId, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        },
      ],
    });

    // Emit to socket for real-time update
    req.app.get('io').to(message.chatRoomId).emit('messageEdited', updatedMessage);

    res.json(createResponse({
      message: updatedMessage,
    }));

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json(createError('Failed to edit message', 500));
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json(createError('Message not found', 404));
    }

    // Only sender can delete message
    if (message.senderId !== req.user.id) {
      return res.status(403).json(createError('Access denied', 403));
    }

    await message.update({
      isDeleted: true,
      deletedAt: new Date(),
      content: null,
      attachments: [],
    });

    // Emit to socket for real-time update
    req.app.get('io').to(message.chatRoomId).emit('messageDeleted', {
      messageId,
      chatRoomId: message.chatRoomId,
    });

    res.json(createResponse({
      message: 'Message deleted successfully',
    }));

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json(createError('Failed to delete message', 500));
  }
};

// Add reaction to message
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json(createError('Message not found', 404));
    }

    // Verify user is member of chat room
    const userChatRoom = await UserChatRoom.findOne({
      where: {
        userId: req.user.id,
        chatRoomId: message.chatRoomId,
        isActive: true,
      },
    });

    if (!userChatRoom) {
      return res.status(403).json(createError('Access denied', 403));
    }

    await message.addReaction(req.user.id, emoji);

    // Load updated message
    const updatedMessage = await Message.findByPk(messageId);

    // Emit to socket for real-time update
    req.app.get('io').to(message.chatRoomId).emit('reactionAdded', {
      messageId,
      userId: req.user.id,
      emoji,
      reactions: updatedMessage.reactions,
    });

    res.json(createResponse({
      message: 'Reaction added successfully',
      reactions: updatedMessage.reactions,
    }));

  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json(createError('Failed to add reaction', 500));
  }
};

// Search messages
export const searchMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { query, page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json(createError('Search query is required', 400));
    }

    // Verify user is member of chat room
    const userChatRoom = await UserChatRoom.findOne({
      where: {
        userId: req.user.id,
        chatRoomId,
        isActive: true,
      },
    });

    if (!userChatRoom) {
      return res.status(403).json(createError('Access denied', 403));
    }

    const offset = (page - 1) * limit;

    const { count, rows: messages } = await Message.findAndCountAll({
      where: {
        chatRoomId,
        content: { [Op.like]: `%${query}%` },
        isDeleted: false,
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / limit);

    res.json(createResponse({
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
      query,
    }));

  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json(createError('Failed to search messages', 500));
  }
};
