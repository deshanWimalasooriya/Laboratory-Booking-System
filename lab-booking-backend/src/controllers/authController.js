import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';
import { createResponse, createError } from '../utils/responseUtils.js';
import { validateRegistration, validateLogin } from '../utils/validators.js';

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });

  return { accessToken, refreshToken };
};

// Register new user
export const register = async (req, res) => {
  try {
    // Validate input
    const { error } = validateRegistration(req.body);
    if (error) {
      return res.status(400).json(createError(error.details[0].message, 400));
    }

    const {
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      department,
      studentId,
      employeeId,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json(createError('User with this email already exists', 409));
    }

    // Check for duplicate student/employee ID
    if (studentId) {
      const existingStudent = await User.findOne({ where: { studentId } });
      if (existingStudent) {
        return res.status(409).json(createError('Student ID already exists', 409));
      }
    }

    if (employeeId) {
      const existingEmployee = await User.findOne({ where: { employeeId } });
      if (existingEmployee) {
        return res.status(409).json(createError('Employee ID already exists', 409));
      }
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      department,
      studentId,
      employeeId,
      emailVerificationToken,
    });

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;
    await sendEmail({
      to: email,
      subject: 'Verify Your Email - Lab Booking System',
      template: 'emailVerification',
      data: {
        firstName,
        verificationUrl,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json(createResponse({
      message: 'Registration successful. Please check your email to verify your account.',
      user,
      accessToken,
    }, 201));

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(createError('Registration failed', 500));
  }
};

// Login user
export const login = async (req, res) => {
  try {
    // Validate input
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json(createError(error.details[0].message, 400));
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({
      where: { email },
      attributes: { include: ['password'] },
    });

    if (!user) {
      return res.status(401).json(createError('Invalid email or password', 401));
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json(createError('Invalid email or password', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json(createError('Your account has been deactivated. Please contact support.', 403));
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Remove password from response
    const userResponse = user.toJSON();

    res.json(createResponse({
      message: 'Login successful',
      user: userResponse,
      accessToken,
    }));

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(createError('Login failed', 500));
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    res.json(createResponse({
      message: 'Logout successful',
    }));

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json(createError('Logout failed', 500));
  }
};

// Refresh access token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json(createError('Refresh token not provided', 401));
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json(createError('Invalid refresh token', 401));
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);

    // Set new refresh token cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json(createResponse({
      accessToken: tokens.accessToken,
    }));

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json(createError('Invalid refresh token', 401));
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json(createError('User not found', 404));
    }

    res.json(createResponse({
      user,
    }));

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(createError('Failed to get profile', 500));
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json(createError('Verification token is required', 400));
    }

    // Find user with verification token
    const user = await User.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return res.status(400).json(createError('Invalid or expired verification token', 400));
    }

    // Update user as verified
    await user.update({
      emailVerified: true,
      emailVerificationToken: null,
    });

    res.json(createResponse({
      message: 'Email verified successfully',
    }));

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json(createError('Email verification failed', 500));
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(createError('Email is required', 400));
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not
      return res.json(createResponse({
        message: 'If an account with that email exists, a password reset link has been sent.',
      }));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset token
    await user.update({
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'Password Reset - Lab Booking System',
      template: 'passwordReset',
      data: {
        firstName: user.firstName,
        resetUrl,
      },
    });

    res.json(createResponse({
      message: 'If an account with that email exists, a password reset link has been sent.',
    }));

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json(createError('Failed to process password reset request', 500));
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json(createError('Token and password are required', 400));
    }

    if (password.length < 6) {
      return res.status(400).json(createError('Password must be at least 6 characters long', 400));
    }

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json(createError('Invalid or expired reset token', 400));
    }

    // Update password and clear reset token
    await user.update({
      password,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    res.json(createResponse({
      message: 'Password reset successful',
    }));

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json(createError('Password reset failed', 500));
  }
};
