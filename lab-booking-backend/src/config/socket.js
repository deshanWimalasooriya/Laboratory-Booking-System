import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from './logger.js';

// Socket.io configuration
export const socketConfig = {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  allowEIO3: true,
};

// Socket authentication middleware
export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || 
                 socket.handshake.headers.authorization?.replace('Bearer ', '') ||
                 socket.request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      logger.warn(`Socket connection rejected: No token provided from ${socket.handshake.address}`);
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
    });

    if (!user) {
      logger.warn(`Socket connection rejected: User not found for token from ${socket.handshake.address}`);
      return next(new Error('User not found'));
    }

    if (!user.isActive) {
      logger.warn(`Socket connection rejected: Inactive user ${user.id} from ${socket.handshake.address}`);
      return next(new Error('User account is deactivated'));
    }

    // Attach user to socket
    socket.user = user;
    socket.userId = user.id;
    socket.userRole = user.role;

    logger.info(`Socket authenticated: User ${user.firstName} ${user.lastName} (${user.id}) connected from ${socket.handshake.address}`);
    next();

  } catch (error) {
    logger.error(`Socket authentication failed from ${socket.handshake.address}:`, error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Invalid authentication token'));
    } else if (error.name === 'TokenExpiredError') {
      return next(new Error('Authentication token expired'));
    } else {
      return next(new Error('Authentication failed'));
    }
  }
};

// Socket connection handler
export const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    const user = socket.user;
    
    // Join user to personal room
    socket.join(`user_${user.id}`);
    
    // Join user to role-based room
    socket.join(`role_${user.role}`);
    
    // Join user to department room if available
    if (user.department) {
      socket.join(`department_${user.department.toLowerCase().replace(/\s+/g, '_')}`);
    }

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Successfully connected to real-time server',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
      },
      timestamp: new Date().toISOString(),
    });

    // Broadcast user online status to relevant users
    socket.broadcast.to(`role_${user.role}`).emit('userOnline', {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      timestamp: new Date().toISOString(),
    });

    // Handle ping/pong for connection health
    socket.on('ping', (callback) => {
      if (typeof callback === 'function') {
        callback('pong');
      } else {
        socket.emit('pong');
      }
    });

    // Handle user status updates
    socket.on('updateStatus', (status) => {
      socket.broadcast.to(`role_${user.role}`).emit('userStatusUpdate', {
        userId: user.id,
        status,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle joining specific rooms
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      socket.emit('joinedRoom', { roomId, timestamp: new Date().toISOString() });
      logger.info(`User ${user.id} joined room: ${roomId}`);
    });

    // Handle leaving specific rooms
    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
      socket.emit('leftRoom', { roomId, timestamp: new Date().toISOString() });
      logger.info(`User ${user.id} left room: ${roomId}`);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`User ${user.firstName} ${user.lastName} (${user.id}) disconnected: ${reason}`);
      
      // Broadcast user offline status
      socket.broadcast.to(`role_${user.role}`).emit('userOffline', {
        userId: user.id,
        reason,
        timestamp: new Date().toISOString(),
      });
      
      // Leave all rooms
      socket.leave(`user_${user.id}`);
      socket.leave(`role_${user.role}`);
      if (user.department) {
        socket.leave(`department_${user.department.toLowerCase().replace(/\s+/g, '_')}`);
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${user.id}:`, error);
      socket.emit('error', {
        message: 'Connection error occurred',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle reconnection
    socket.on('reconnect', () => {
      logger.info(`User ${user.id} reconnected`);
      socket.emit('reconnected', {
        message: 'Successfully reconnected',
        timestamp: new Date().toISOString(),
      });
    });
  });

  // Handle connection errors
  io.on('connect_error', (error) => {
    logger.error('Socket.io connection error:', error);
  });

  return io;
};

// Utility functions for socket operations
export const socketUtils = {
  // Send message to specific user
  sendToUser: (io, userId, event, data) => {
    io.to(`user_${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  },

  // Send message to users with specific role
  sendToRole: (io, role, event, data) => {
    io.to(`role_${role}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  },

  // Send message to department
  sendToDepartment: (io, department, event, data) => {
    const roomName = `department_${department.toLowerCase().replace(/\s+/g, '_')}`;
    io.to(roomName).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  },

  // Send message to specific room
  sendToRoom: (io, roomId, event, data) => {
    io.to(roomId).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  },

  // Broadcast to all connected users
  broadcast: (io, event, data) => {
    io.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  },

  // Get connected users count
  getConnectedUsersCount: async (io) => {
    const sockets = await io.fetchSockets();
    return sockets.length;
  },

  // Get users in specific room
  getUsersInRoom: async (io, roomId) => {
    const sockets = await io.in(roomId).fetchSockets();
    return sockets.map(socket => ({
      id: socket.userId,
      name: `${socket.user.firstName} ${socket.user.lastName}`,
      role: socket.user.role,
    }));
  },
};
