import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from '../models/User.js';
import Laboratory from '../models/Laboratory.js';
import Booking from '../models/Booking.js';
import Equipment from '../models/Equipment.js';
import Schedule from '../models/Schedule.js';
import Notification from '../models/Notification.js';
import { createResponse, createError } from '../utils/responseUtils.js';

// Get dashboard statistics based on user role
export const getDashboardStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    let stats = {};

    switch (userRole) {
      case 'student':
        stats = await getStudentDashboardStats(req.user.id);
        break;
      case 'instructor':
        stats = await getInstructorDashboardStats(req.user.id);
        break;
      case 'technical_officer':
        stats = await getTechnicalOfficerDashboardStats();
        break;
      case 'lecture_in_charge':
        stats = await getLectureInChargeDashboardStats();
        break;
      default:
        return res.status(400).json(createError('Invalid user role', 400));
    }

    res.json(createResponse({ stats }));

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json(createError('Failed to get dashboard statistics', 500));
  }
};

// Student dashboard statistics
const getStudentDashboardStats = async (userId) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Upcoming bookings
  const upcomingBookings = await Booking.findAll({
    where: {
      userId,
      status: 'approved',
      startTime: { [Op.gte]: today },
    },
    include: [
      {
        model: Laboratory,
        as: 'laboratory',
        attributes: ['id', 'name', 'location'],
      },
    ],
    order: [['startTime', 'ASC']],
    limit: 5,
  });

  // Recent bookings this month
  const monthlyBookings = await Booking.count({
    where: {
      userId,
      createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
    },
  });

  // Booking status counts
  const bookingStats = await Booking.findAll({
    where: { userId },
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    group: ['status'],
    raw: true,
  });

  // Available laboratories
  const availableLabs = await Laboratory.count({
    where: { isActive: true, maintenanceMode: false },
  });

  // Today's schedules
  const todaySchedules = await Schedule.findAll({
    where: {
      dayOfWeek: today.toLocaleLowerCase().slice(0, 3),
      isActive: true,
      startDate: { [Op.lte]: today },
      endDate: { [Op.gte]: today },
    },
    include: [
      {
        model: Laboratory,
        as: 'laboratory',
        attributes: ['id', 'name', 'location'],
      },
    ],
    order: [['startTime', 'ASC']],
  });

  // Unread notifications
  const unreadNotifications = await Notification.count({
    where: { userId, isRead: false },
  });

  return {
    upcomingBookings,
    monthlyBookings,
    bookingStats: bookingStats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.count);
      return acc;
    }, {}),
    availableLabs,
    todaySchedules,
    unreadNotifications,
  };
};

// Instructor dashboard statistics
const getInstructorDashboardStats = async (userId) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  // My bookings
  const myBookings = await Booking.findAll({
    where: {
      userId,
      startTime: { [Op.gte]: today },
    },
    include: [
      {
        model: Laboratory,
        as: 'laboratory',
        attributes: ['id', 'name', 'location'],
      },
    ],
    order: [['startTime', 'ASC']],
    limit: 5,
  });

  // My schedules this week
  const weeklySchedules = await Schedule.findAll({
    where: {
      instructorId: userId,
      isActive: true,
      startDate: { [Op.lte]: endOfWeek },
      endDate: { [Op.gte]: startOfWeek },
    },
    include: [
      {
        model: Laboratory,
        as: 'laboratory',
        attributes: ['id', 'name', 'location'],
      },
    ],
    order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
  });

  // Booking statistics
  const bookingStats = await Booking.findAll({
    where: { userId },
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    group: ['status'],
    raw: true,
  });

  // Available laboratories
  const availableLabs = await Laboratory.count({
    where: { isActive: true, maintenanceMode: false },
  });

  // Pending bookings count
  const pendingBookings = await Booking.count({
    where: { userId, status: 'pending' },
  });

  return {
    myBookings,
    weeklySchedules,
    bookingStats: bookingStats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.count);
      return acc;
    }, {}),
    availableLabs,
    pendingBookings,
  };
};

// Technical Officer dashboard statistics
const getTechnicalOfficerDashboardStats = async () => {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  // Pending approvals
  const pendingApprovals = await Booking.findAll({
    where: { status: 'pending' },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: Laboratory,
        as: 'laboratory',
        attributes: ['id', 'name', 'location'],
      },
    ],
    order: [['createdAt', 'ASC']],
    limit: 10,
  });

  // Today's bookings
  const todayBookings = await Booking.findAll({
    where: {
      status: 'approved',
      startTime: { [Op.between]: [startOfDay, endOfDay] },
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: Laboratory,
        as: 'laboratory',
        attributes: ['id', 'name', 'location'],
      },
    ],
    order: [['startTime', 'ASC']],
  });

  // Equipment needing attention
  const equipmentIssues = await Equipment.findAll({
    where: {
      status: { [Op.in]: ['not_working', 'under_repair', 'maintenance'] },
      isActive: true,
    },
    include: [
      {
        model: Laboratory,
        as: 'laboratory',
        attributes: ['id', 'name', 'location'],
      },
    ],
    order: [['updatedAt', 'DESC']],
    limit: 10,
  });

  // Laboratory statistics
  const labStats = {
    total: await Laboratory.count({ where: { isActive: true } }),
    maintenance: await Laboratory.count({ where: { maintenanceMode: true } }),
    available: await Laboratory.count({ 
      where: { isActive: true, maintenanceMode: false } 
    }),
  };

  // Equipment statistics
  const equipmentStats = await Equipment.findAll({
    where: { isActive: true },
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    group: ['status'],
    raw: true,
  });

  // Booking statistics for today
  const bookingStats = await Booking.findAll({
    where: {
      startTime: { [Op.between]: [startOfDay, endOfDay] },
    },
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    group: ['status'],
    raw: true,
  });

  return {
    pendingApprovals,
    todayBookings,
    equipmentIssues,
    labStats,
    equipmentStats: equipmentStats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.count);
      return acc;
    }, {}),
    bookingStats: bookingStats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.count);
      return acc;
    }, {}),
  };
};

// Lecture in Charge dashboard statistics
const getLectureInChargeDashboardStats = async () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Overall system statistics
  const systemStats = {
    totalUsers: await User.count({ where: { isActive: true } }),
    totalLabs: await Laboratory.count({ where: { isActive: true } }),
    totalEquipment: await Equipment.count({ where: { isActive: true } }),
    totalBookings: await Booking.count(),
  };

  // Monthly booking trends
  const monthlyBookings = await Booking.count({
    where: {
      createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
    },
  });

  // User statistics by role
  const userStats = await User.findAll({
    where: { isActive: true },
    attributes: [
      'role',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    group: ['role'],
    raw: true,
  });

  // Laboratory utilization
  const labUtilization = await Laboratory.findAll({
    attributes: [
      'id',
      'name',
      [
        sequelize.literal(`(
          SELECT COUNT(*)
          FROM bookings
          WHERE bookings.laboratory_id = Laboratory.id
          AND bookings.status = 'approved'
          AND bookings.start_time >= '${startOfMonth.toISOString()}'
          AND bookings.start_time <= '${endOfMonth.toISOString()}'
        )`),
        'bookingCount'
      ],
    ],
    where: { isActive: true },
    order: [[sequelize.literal('bookingCount'), 'DESC']],
    limit: 10,
    raw: true,
  });

  // Recent activities
  const recentBookings = await Booking.findAll({
    where: {
      createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: Laboratory,
        as: 'laboratory',
        attributes: ['id', 'name'],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: 10,
  });

  // Equipment status overview
  const equipmentStats = await Equipment.findAll({
    where: { isActive: true },
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    group: ['status'],
    raw: true,
  });

  // Pending approvals
  const pendingApprovals = await Booking.count({
    where: { status: 'pending' },
  });

  return {
    systemStats,
    monthlyBookings,
    userStats: userStats.reduce((acc, stat) => {
      acc[stat.role] = parseInt(stat.count);
      return acc;
    }, {}),
    labUtilization,
    recentBookings,
    equipmentStats: equipmentStats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.count);
      return acc;
    }, {}),
    pendingApprovals,
  };
};

// Get recent activities
export const getRecentActivities = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const userRole = req.user.role;

    let whereClause = {};

    // Filter activities based on user role
    if (userRole === 'student' || userRole === 'instructor') {
      whereClause.userId = req.user.id;
    }

    const recentBookings = await Booking.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'location'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
    });

    const activities = recentBookings.map(booking => ({
      id: booking.id,
      type: 'booking',
      action: getBookingAction(booking.status),
      description: `${booking.user.firstName} ${booking.user.lastName} ${getBookingAction(booking.status)} booking for ${booking.laboratory.name}`,
      timestamp: booking.createdAt,
      data: {
        bookingId: booking.id,
        userId: booking.userId,
        laboratoryId: booking.laboratoryId,
        status: booking.status,
      },
    }));

    res.json(createResponse({ activities }));

  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json(createError('Failed to get recent activities', 500));
  }
};

// Helper function to get booking action text
const getBookingAction = (status) => {
  const actions = {
    pending: 'requested',
    approved: 'got approved for',
    rejected: 'got rejected for',
    cancelled: 'cancelled',
    completed: 'completed',
    no_show: 'missed',
  };
  return actions[status] || 'updated';
};
