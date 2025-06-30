import { Op } from 'sequelize';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Laboratory from '../models/Laboratory.js';
import { createResponse, createError } from '../utils/responseUtils.js';
import { sendNotification } from '../services/notificationService.js';

// Get all pending bookings for approval
export const getPendingBookings = async (req, res) => {
  try {
    // Check permissions
    if (!['technical_officer', 'lecture_in_charge'].includes(req.user.role)) {
      return res.status(403).json(createError('Access denied', 403));
    }

    const {
      page = 1,
      limit = 10,
      laboratoryId,
      priority,
      startDate,
      endDate,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { status: 'pending' };

    // Add filters
    if (laboratoryId) {
      whereClause.laboratoryId = laboratoryId;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    if (startDate && endDate) {
      whereClause.startTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const { count, rows: pendingBookings } = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
        },
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code', 'location', 'capacity'],
        },
      ],
      order: [
        ['priority', 'DESC'],
        ['startTime', 'ASC'],
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / limit);

    res.json(createResponse({
      pendingBookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    }));

  } catch (error) {
    console.error('Get pending bookings error:', error);
    res.status(500).json(createError('Failed to get pending bookings', 500));
  }
};

// Approve booking
export const approveBooking = async (req, res) => {
  try {
    // Check permissions
    if (!['technical_officer', 'lecture_in_charge'].includes(req.user.role)) {
      return res.status(403).json(createError('Access denied', 403));
    }

    const { id } = req.params;
    const { notes } = req.body;

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code'],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json(createError('Booking not found', 404));
    }

    if (booking.status !== 'pending') {
      return res.status(400).json(createError('Booking is not pending approval', 400));
    }

    // Check for conflicts before approving
    const conflicts = await Booking.findAll({
      where: {
        laboratoryId: booking.laboratoryId,
        status: 'approved',
        id: { [Op.ne]: booking.id },
        [Op.or]: [
          {
            startTime: {
              [Op.between]: [booking.startTime, booking.endTime],
            },
          },
          {
            endTime: {
              [Op.between]: [booking.startTime, booking.endTime],
            },
          },
          {
            [Op.and]: [
              { startTime: { [Op.lte]: booking.startTime } },
              { endTime: { [Op.gte]: booking.endTime } },
            ],
          },
        ],
      },
    });

    if (conflicts.length > 0) {
      return res.status(409).json(createError(
        'Cannot approve booking due to time conflicts with existing approved bookings',
        409,
        { conflicts }
      ));
    }

    // Approve the booking
    await booking.update({
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date(),
    });

    // Send notification to user
    await sendNotification({
      userId: booking.userId,
      type: 'approval',
      title: 'Booking Approved',
      message: `Your booking for ${booking.laboratory.name} has been approved.`,
      data: {
        bookingId: booking.id,
        laboratoryName: booking.laboratory.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
        approvedBy: `${req.user.firstName} ${req.user.lastName}`,
        notes,
      },
      actionUrl: `/bookings/${booking.id}`,
    });

    res.json(createResponse({
      message: 'Booking approved successfully',
      booking,
    }));

  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json(createError('Failed to approve booking', 500));
  }
};

// Reject booking
export const rejectBooking = async (req, res) => {
  try {
    // Check permissions
    if (!['technical_officer', 'lecture_in_charge'].includes(req.user.role)) {
      return res.status(403).json(createError('Access denied', 403));
    }

    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json(createError('Rejection reason is required', 400));
    }

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code'],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json(createError('Booking not found', 404));
    }

    if (booking.status !== 'pending') {
      return res.status(400).json(createError('Booking is not pending approval', 400));
    }

    // Reject the booking
    await booking.update({
      status: 'rejected',
      rejectedBy: req.user.id,
      rejectedAt: new Date(),
      rejectionReason: reason,
    });

    // Send notification to user
    await sendNotification({
      userId: booking.userId,
      type: 'rejection',
      title: 'Booking Rejected',
      message: `Your booking for ${booking.laboratory.name} has been rejected.`,
      data: {
        bookingId: booking.id,
        laboratoryName: booking.laboratory.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
        rejectedBy: `${req.user.firstName} ${req.user.lastName}`,
        reason,
      },
      actionUrl: `/bookings/${booking.id}`,
    });

    res.json(createResponse({
      message: 'Booking rejected successfully',
      booking,
    }));

  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json(createError('Failed to reject booking', 500));
  }
};

// Bulk approve bookings
export const bulkApproveBookings = async (req, res) => {
  try {
    // Check permissions
    if (!['technical_officer', 'lecture_in_charge'].includes(req.user.role)) {
      return res.status(403).json(createError('Access denied', 403));
    }

    const { bookingIds, notes } = req.body;

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json(createError('Booking IDs are required', 400));
    }

    const bookings = await Booking.findAll({
      where: {
        id: { [Op.in]: bookingIds },
        status: 'pending',
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code'],
        },
      ],
    });

    if (bookings.length === 0) {
      return res.status(404).json(createError('No pending bookings found', 404));
    }

    const approvedBookings = [];
    const conflictBookings = [];

    for (const booking of bookings) {
      // Check for conflicts
      const conflicts = await Booking.findAll({
        where: {
          laboratoryId: booking.laboratoryId,
          status: 'approved',
          id: { [Op.ne]: booking.id },
          [Op.or]: [
            {
              startTime: {
                [Op.between]: [booking.startTime, booking.endTime],
              },
            },
            {
              endTime: {
                [Op.between]: [booking.startTime, booking.endTime],
              },
            },
            {
              [Op.and]: [
                { startTime: { [Op.lte]: booking.startTime } },
                { endTime: { [Op.gte]: booking.endTime } },
              ],
            },
          ],
        },
      });

      if (conflicts.length === 0) {
        await booking.update({
          status: 'approved',
          approvedBy: req.user.id,
          approvedAt: new Date(),
        });

        // Send notification
        await sendNotification({
          userId: booking.userId,
          type: 'approval',
          title: 'Booking Approved',
          message: `Your booking for ${booking.laboratory.name} has been approved.`,
          data: {
            bookingId: booking.id,
            laboratoryName: booking.laboratory.name,
            startTime: booking.startTime,
            endTime: booking.endTime,
            approvedBy: `${req.user.firstName} ${req.user.lastName}`,
            notes,
          },
          actionUrl: `/bookings/${booking.id}`,
        });

        approvedBookings.push(booking);
      } else {
        conflictBookings.push({
          booking,
          conflicts: conflicts.length,
        });
      }
    }

    res.json(createResponse({
      message: `${approvedBookings.length} bookings approved successfully`,
      approvedBookings,
      conflictBookings,
      summary: {
        total: bookings.length,
        approved: approvedBookings.length,
        conflicts: conflictBookings.length,
      },
    }));

  } catch (error) {
    console.error('Bulk approve bookings error:', error);
    res.status(500).json(createError('Failed to bulk approve bookings', 500));
  }
};

// Get approval statistics
export const getApprovalStats = async (req, res) => {
  try {
    // Check permissions
    if (!['technical_officer', 'lecture_in_charge'].includes(req.user.role)) {
      return res.status(403).json(createError('Access denied', 403));
    }

    const { startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate && endDate) {
      dateFilter.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else {
      // Default to last 30 days
      dateFilter.createdAt = {
        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };
    }

    // Get booking counts by status
    const statusCounts = await Booking.findAll({
      where: dateFilter,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    // Get approval times (average time from creation to approval)
    const approvedBookings = await Booking.findAll({
      where: {
        ...dateFilter,
        status: 'approved',
        approvedAt: { [Op.ne]: null },
      },
      attributes: ['createdAt', 'approvedAt'],
      raw: true,
    });

    let averageApprovalTime = 0;
    if (approvedBookings.length > 0) {
      const totalTime = approvedBookings.reduce((sum, booking) => {
        const approvalTime = new Date(booking.approvedAt) - new Date(booking.createdAt);
        return sum + approvalTime;
      }, 0);
      averageApprovalTime = totalTime / approvedBookings.length / (1000 * 60 * 60); // Convert to hours
    }

    // Get pending bookings by priority
    const pendingByPriority = await Booking.findAll({
      where: { status: 'pending' },
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['priority'],
      raw: true,
    });

    const stats = {
      byStatus: statusCounts.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      averageApprovalTimeHours: Math.round(averageApprovalTime * 100) / 100,
      pendingByPriority: pendingByPriority.reduce((acc, item) => {
        acc[item.priority] = parseInt(item.count);
        return acc;
      }, {}),
      totalPending: pendingByPriority.reduce((sum, item) => sum + parseInt(item.count), 0),
    };

    res.json(createResponse({
      stats,
      period: {
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: endDate || new Date().toISOString(),
      },
    }));

  } catch (error) {
    console.error('Get approval stats error:', error);
    res.status(500).json(createError('Failed to get approval statistics', 500));
  }
};
