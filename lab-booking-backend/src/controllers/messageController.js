import Message from '../models/Message.js';
import User from '../models/User.js';
import ChatRoom from '../models/ChatRoom.js';
import UserChatRoom from '../models/UserChatRoom.js';
import { createResponse, createError } from '../utils/responseUtils.js';
import { uploadToCloudinary } from '../services/fileService.js';

// Get all messages in a chat room
export const getMessagesByChatRoom = async (req, res) => {
  // Example: Fetch messages by chatRoomId from DB (replace with your logic)
  const { chatRoomId } = req.params;
  // const messages = await Message.findAll({ where: { chatRoomId } });
  res.json({ success: true, messages: [], chatRoomId });
};


// Get messages for a chat room
export const getMessages = async (req, res) => {
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

    const messages = await Message.findAndCountAll({
      where: { chatRoomId, isDeleted: false },
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

    res.json(createResponse({
      messages: messages.rows.reverse(),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(messages.count / limit),
        totalItems: messages.count,
        itemsPerPage: parseInt(limit),
      },
    }));
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json(createError('Failed to get messages', 500));
  }
};

// Send a new message
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

    res.status(201).json(createResponse({ message: messageWithSender }));
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json(createError('Failed to send message', 500));
  }
};

// Edit a message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json(createError('Message not found', 404));
    }

    if (message.senderId !== req.user.id) {
      return res.status(403).json(createError('Access denied', 403));
    }

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

    res.json(createResponse({ message: updatedMessage }));
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json(createError('Failed to edit message', 500));
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json(createError('Message not found', 404));
    }

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

    res.json(createResponse({ message: 'Message deleted successfully' }));
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

// Search messages in chat room
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

// Get a single message by ID
export const getMessageById = async (req, res) => {
  const { id } = req.params;
  // const message = await Message.findByPk(id);
  res.json({ success: true, message: {}, id });
};