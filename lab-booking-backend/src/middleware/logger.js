import { logger } from '../config/logger.js';

// Request logger middleware
export const requestLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
};

// Error logger middleware (optional, for use before errorHandler)
export const errorLogger = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);
  next(err);
};
