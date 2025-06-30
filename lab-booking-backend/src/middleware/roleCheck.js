import { createError } from '../utils/responseUtils.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(createError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(createError('Insufficient permissions', 403));
    }

    next();
  };
};

export const requireAnyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(createError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(createError('Access denied', 403));
    }

    next();
  };
};

export const requireAdmin = requireRole('lecture_in_charge');
export const requireTechnicalOfficer = requireAnyRole('technical_officer', 'lecture_in_charge');
export const requireInstructor = requireAnyRole('instructor', 'technical_officer', 'lecture_in_charge');
export const requireStudent = requireAnyRole('student', 'instructor', 'technical_officer', 'lecture_in_charge');

// Permission helpers
export const canManageLabs = (userRole) => {
  return ['lecture_in_charge'].includes(userRole);
};

export const canManageEquipment = (userRole) => {
  return ['technical_officer', 'lecture_in_charge'].includes(userRole);
};

export const canApproveBookings = (userRole) => {
  return ['technical_officer', 'lecture_in_charge'].includes(userRole);
};

export const canCreateBookings = (userRole) => {
  return ['instructor', 'technical_officer', 'lecture_in_charge'].includes(userRole);
};

export const canViewSchedules = (userRole) => {
  return ['student', 'instructor', 'technical_officer', 'lecture_in_charge'].includes(userRole);
};
