import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../config/jwt.js';

export const authenticateUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.isActive) return null;
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;
  return user;
};

export const generateTokens = (user) => {
  const payload = { userId: user.id, role: user.role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};
