import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Hash a password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate a random token (for email verification, password reset, etc.)
export const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};
