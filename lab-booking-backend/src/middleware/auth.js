import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { createError } from '../utils/responseUtils.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(createError('Access token required', 401));
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        return res.status(401).json(createError('User not found', 401));
      }

      if (!user.isActive) {
        return res.status(403).json(createError('Account deactivated', 403));
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json(createError('Token expired', 401));
      }
      return res.status(401).json(createError('Invalid token', 401));
    }

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json(createError('Authentication failed', 500));
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] },
      });

      if (user && user.isActive) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (jwtError) {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

