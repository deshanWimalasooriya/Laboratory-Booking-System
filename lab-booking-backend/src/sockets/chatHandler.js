import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';
import UserChatRoom from '../models/UserChatRoom.js';
import User from '../models/User.js';

export default function chatHandler(socket, io) {
  // Join chat rooms
  socket.on('joinChatRooms', async () => {
    try {
      const userChatRooms = await UserChatRoom.findAll({
        where: { userId: socket.user.id, isActive: true },
        include: [{ model: ChatRoom, as: 'chatRoom' }],
      });

      userChatRooms.forEach(ucr => {
        socket.join(ucr.chatRoomId);
      });

      socket.emit('chatRoomsJoined', {
        rooms: userChatRooms.map(ucr => ucr.chatRoomId),
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to join chat rooms' });
    }
  });

  // Join specific chat room
  socket.on('joinChatRoom', async (chatRoomId) => {
    try {
      const userChatRoom = await UserChatRoom.findOne({
        where: { userId: socket.user.id, chatRoomId, isActive: true },
      });

      if (userChatRoom) {
        socket.join(chatRoomId);
        socket.emit('joinedChatRoom', { chatRoomId });
        
        // Notify other members that user is online
        socket.to(chatRoomId).emit('userOnline', {
          userId: socket.user.id,
          user: {
            id: socket.user.id,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
            profileImage: socket.user.profileImage,
          },
        });
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to join chat room' });
    }
  });

  // Leave chat room
  socket.on('leaveChatRoom', (chatRoomId) => {
    socket.leave(chatRoomId);
    socket.to(chatRoomId).emit('userOffline', {
      userId: socket.user.id,
    });
  });

  // Typing indicators
  socket.on('typing', ({ chatRoomId, isTyping }) => {
    socket.to(chatRoomId).emit('userTyping', {
      userId: socket.user.id,
      user: {
        firstName: socket.user.firstName,
        lastName: socket.user.lastName,
      },
      isTyping,
    });
  });

  // Mark messages as read
  socket.on('markAsRead', async ({ chatRoomId, messageId }) => {
    try {
      const userChatRoom = await UserChatRoom.findOne({
        where: { userId: socket.user.id, chatRoomId },
      });

      if (userChatRoom) {
        await userChatRoom.update({ lastReadAt: new Date() });
        
        socket.to(chatRoomId).emit('messageRead', {
          userId: socket.user.id,
          messageId,
          readAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  });

  // Voice call signaling
  socket.on('callUser', ({ chatRoomId, targetUserId, offer }) => {
    socket.to(`user_${targetUserId}`).emit('incomingCall', {
      from: socket.user.id,
      chatRoomId,
      offer,
      caller: {
        firstName: socket.user.firstName,
        lastName: socket.user.lastName,
        profileImage: socket.user.profileImage,
      },
    });
  });

  socket.on('answerCall', ({ chatRoomId, targetUserId, answer }) => {
    socket.to(`user_${targetUserId}`).emit('callAnswered', {
      from: socket.user.id,
      answer,
    });
  });

  socket.on('rejectCall', ({ targetUserId }) => {
    socket.to(`user_${targetUserId}`).emit('callRejected', {
      from: socket.user.id,
    });
  });

  socket.on('endCall', ({ chatRoomId, targetUserId }) => {
    socket.to(`user_${targetUserId}`).emit('callEnded', {
      from: socket.user.id,
    });
  });

  // ICE candidates for WebRTC
  socket.on('iceCandidate', ({ targetUserId, candidate }) => {
    socket.to(`user_${targetUserId}`).emit('iceCandidate', {
      from: socket.user.id,
      candidate,
    });
  });

  // Handle new message (placeholder)
  socket.on('sendMessage', (data) => {
    const { roomId, message } = data;
    
    // Broadcast message to room
    io.to(roomId).emit('newMessage', {
      id: Date.now(),
      senderId: socket.user.id,
      sender: {
        firstName: socket.user.firstName,
        lastName: socket.user.lastName,
      },
      message,
      timestamp: new Date(),
    });
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { roomId, isTyping } = data;
    
    socket.to(roomId).emit('userTyping', {
      userId: socket.user.id,
      isTyping,
      user: {
        firstName: socket.user.firstName,
        lastName: socket.user.lastName,
      },
    });
  });
}
