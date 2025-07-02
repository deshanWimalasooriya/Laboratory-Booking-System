import jwt from 'jsonwebtoken';

// Generate JWT access token
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
    issuer: 'lab-booking-system',
    audience: 'lab-booking-users',
  });
};

// Generate JWT refresh token
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
    issuer: 'lab-booking-system',
    audience: 'lab-booking-users',
  });
};

// Verify JWT token
export const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret, {
      issuer: 'lab-booking-system',
      audience: 'lab-booking-users',
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  return verifyToken(token, process.env.JWT_REFRESH_SECRET);
};

// Decode token without verification (for debugging)
export const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
};

// Generate tokens pair
export const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_EXPIRE || '7d',
  };
};

// Extract token from authorization header
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

// Check if token is expired
export const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Get token expiration time
export const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded?.exp ? new Date(decoded.exp * 1000) : null;
  } catch (error) {
    return null;
  }
};

// Refresh token if needed
export const refreshTokenIfNeeded = (token, refreshToken) => {
  if (isTokenExpired(token)) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      return generateAccessToken({ userId: decoded.userId });
    } catch (error) {
      throw new Error('Refresh token is invalid or expired');
    }
  }
  return token;
};
