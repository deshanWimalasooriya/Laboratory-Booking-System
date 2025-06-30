import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Import handlers with error handling
let chatHandler, notificationHandler, bookingHandler;

try {
  const chatModule = await import('./chatHandler.js');
  chatHandler = chatModule.default;
} catch (error) {
  console.warn('Chat handler not available:', error.message);
  chatHandler = (socket, io) => {
    console.log('Chat handler placeholder for user:', socket.user.id);
  };
}

try {
  const notificationModule = await import('./notificationHandler.js');
  notificationHandler = notificationModule.default;
} catch (error) {
  console.warn('Notification handler not available:', error.message);
  notificationHandler = (socket, io) => {
    console.log('Notification handler placeholder for user:', socket.user.id);
  };
}

try {
  const bookingModule = await import('./bookingHandler.js');
  bookingHandler = bookingModule.default;
} catch (error) {
  console.warn('Booking handler not available:', error.message);
  bookingHandler = (socket, io) => {
    console.log('Booking handler placeholder for user:', socket.user.id);
  };
}

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user || !user.isActive) {
      return next(new Error('Authentication error'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

// Initialize socket handlers
export const initializeSocketHandlers = (io) => {
  // Set global io instance
  global.io = io;

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.firstName} ${socket.user.lastName} (${socket.id})`);

    // Join user to their personal room for notifications
    socket.join(`user_${socket.user.id}`);

    // Join user to role-based rooms
    socket.join(`role_${socket.user.role}`);

    // Handle user online status
    socket.emit('connected', {
      message: 'Connected successfully',
      user: {
        id: socket.user.id,
        firstName: socket.user.firstName,
        lastName: socket.user.lastName,
        role: socket.user.role,
      },
    });

    // Initialize handlers
    try {
      chatHandler(socket, io);
      notificationHandler(socket, io);
      bookingHandler(socket, io);
    } catch (error) {
      console.error('Error initializing socket handlers:', error);
    }

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.user.firstName} ${socket.user.lastName} (${reason})`);
      
      // Leave all rooms
      socket.leave(`user_${socket.user.id}`);
      socket.leave(`role_${socket.user.role}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Handle connection errors
  io.on('connect_error', (error) => {
    console.error('Socket.io connection error:', error);
  });
};
