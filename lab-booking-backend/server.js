import { server } from './src/app.js';
import { logger } from './src/config/logger.js';

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📱 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 API Base URL: http://localhost:${PORT}/api`);
  logger.info(`💬 Socket.io enabled for real-time features`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});
