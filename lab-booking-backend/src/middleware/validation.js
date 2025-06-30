import { validationResult } from 'express-validator';
import { createError } from '../utils/responseUtils.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json(createError(
      'Validation failed',
      400,
      { errors: errorMessages }
    ));
  }

  next();
};

export const validateRequest = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    handleValidationErrors(req, res, next);
  };
};

