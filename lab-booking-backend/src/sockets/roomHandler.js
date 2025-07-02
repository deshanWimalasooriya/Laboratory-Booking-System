import { logger } from '../config/logger.js';

export default function roomHandler(socket, io) {
  // Handle joining a room
  socket.on('joinRoom', (roomId) => {
    if (!roomId) {
      socket.emit('error', { message: 'Room ID is required to join' });
      return;
    }
    socket.join(roomId);
    socket.emit('joinedRoom', { roomId });
    logger.info(`User ${socket.user.id} joined room ${roomId}`);
  });

  // Handle leaving a room
  socket.on('leaveRoom', (roomId) => {
    if (!roomId) {
      socket.emit('error', { message: 'Room ID is required to leave' });
      return;
    }
    socket.leave(roomId);
    socket.emit('leftRoom', { roomId });
    logger.info(`User ${socket.user.id} left room ${roomId}`);
  });

  // Handle sending a message to a room
  socket.on('sendMessage', (data) => {
    const { roomId, message } = data;
    if (!roomId || !message) {
      socket.emit('error', { message: 'Room ID and message are required' });
      return;
    }
    io.to(roomId).emit('newMessage', {
      userId: socket.user.id,
      message,
      timestamp: new Date(),
    });
    logger.info(`User ${socket.user.id} sent message to room ${roomId}`);
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { roomId, isTyping } = data;
    if (!roomId) return;
    socket.to(roomId).emit('userTyping', {
      userId: socket.user.id,
      isTyping,
    });
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    logger.info(`User ${socket.user.id} disconnected: ${reason}`);
  });
}
