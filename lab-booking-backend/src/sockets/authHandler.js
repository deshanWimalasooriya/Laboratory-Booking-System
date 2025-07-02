import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from '../config/logger.js';

export default async function authHandler(socket, io) {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      socket.emit('error', { message: 'Authentication token required' });
      return socket.disconnect();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      socket.emit('error', { message: 'User not found or inactive' });
      return socket.disconnect();
    }

    socket.user = user;

    // Join user to personal room
    socket.join(`user_${user.id}`);

    // Join user to role-based room
    socket.join(`role_${user.role}`);

    // Emit connection success
    socket.emit('authenticated', {
      message: 'Authentication successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

    logger.info(`User ${user.id} connected via socket`);

  } catch (error) {
    logger.error('Socket authentication error:', error);
    socket.emit('error', { message: 'Authentication failed' });
    socket.disconnect();
  }
}
