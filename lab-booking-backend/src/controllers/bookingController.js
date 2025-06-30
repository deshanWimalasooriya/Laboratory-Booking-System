import { Op } from 'sequelize';
import Booking from '../models/Booking.js';
import Laboratory from '../models/Laboratory.js';
import User from '../models/User.js';
import { createResponse, createError } from '../utils/responseUtils.js';
import { validateBooking } from '../utils/validators.js';
import { sendNotification } from '../services/notificationService.js';
import { checkBookingConflicts } from '../utils/bookingUtils.js';

// Create new booking
export const createBooking = async (req, res) => {
  try {
    // Validate input
    const { error } = validateBooking(req.body);
    if (error) {
      return res.status(400).json(createError(error.details[0].message, 400));
    }

    const {
      laboratoryId,
      title,
      description,
      purpose,
      startTime,
      endTime,
      expectedAttendees,
      equipmentRequested,
      specialRequirements,
      isRecurring,
      recurringPattern,
    } = req.body;

    // Check if laboratory exists and is active
    const laboratory = await Laboratory.findOne({
      where: { id: laboratoryId, isActive: true, maintenanceMode: false },
    });

    if (!laboratory) {
      return res.status(404).json(createError('Laboratory not found or unavailable', 404));
    }

    // Check capacity
    if (expectedAttendees > laboratory.capacity) {
      return res.status(400).json(createError(
        `Expected attendees (${expectedAttendees}) exceeds laboratory capacity (${laboratory.capacity})`,
        400
      ));
    }

    // Check for booking conflicts
    const conflicts = await checkBookingConflicts(laboratoryId, startTime, endTime);
    if (conflicts.length > 0) {
      return res.status(409).json(createError(
        'Time slot conflicts with existing bookings',
        409,
        { conflicts }
      ));
    }

    // Check booking rules
    const bookingRules = laboratory.bookingRules;
    const duration = Math.ceil((new Date(endTime) - new Date(startTime)) / (1000 * 60));
    
    if (duration > bookingRules.maxBookingDuration) {
      return res.status(400).json(createError(
        `Booking duration (${duration} minutes) exceeds maximum allowed (${bookingRules.maxBookingDuration} minutes)`,
        400
      ));
    }

    const now = new Date();
    const startDateTime = new Date(startTime);
    const advanceTime = Math.ceil((startDateTime - now) / (1000 * 60));

    if (advanceTime < bookingRules.minAdvanceBooking) {
      return res.status(400).json(createError(
        `Booking must be made at least ${bookingRules.minAdvanceBooking} minutes in advance`,
        400
      ));
    }

    if (advanceTime > bookingRules.maxAdvanceBooking) {
      return res.status(400).json(createError(
        `Booking cannot be made more than ${bookingRules.maxAdvanceBooking} minutes in advance`,
        400
      ));
    }

    // Determine initial status based on user role and lab rules
    let initialStatus = 'pending';
    if (req.user.role === 'lecture_in_charge' || !bookingRules.requireApproval) {
      initialStatus = 'approved';
    }

    // Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      laboratoryId,
      title,
      description,
      purpose,
      startTime,
      endTime,
      expectedAttendees,
      equipmentRequested: equipmentRequested || [],
      specialRequirements,
      status: initialStatus,
      isRecurring,
      recurringPattern,
    });

    // Handle recurring bookings
    const createdBookings = [booking];
    if (isRecurring && recurringPattern) {
      const recurringBookings = await createRecurringBookings(booking, recurringPattern);
      createdBookings.push(...recurringBookings);
    }

    // Send notifications
    await sendBookingNotifications(booking, 'created');

    // Load booking with associations
    const bookingWithDetails = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code', 'location'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    res.status(201).json(createResponse({
      message: `Booking ${initialStatus === 'approved' ? 'created and approved' : 'created successfully'}`,
      booking: bookingWithDetails,
      recurringCount: createdBookings.length - 1,
    }, 201));

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json(createError('Failed to create booking', 500));
  }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      laboratoryId,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { userId: req.user.id };

    // Add filters
    if (status) {
      whereClause.status = status;
    }

    if (startDate && endDate) {
      whereClause.startTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    if (laboratoryId) {
      whereClause.laboratoryId = laboratoryId;
    }

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code', 'location', 'capacity'],
        },
        {
          model: User,
          as: 'approvedByUser',
          attributes: ['id', 'firstName', 'lastName'],
          required: false,
        },
      ],
      order: [['startTime', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / limit);

    res.json(createResponse({
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    }));

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json(createError('Failed to get bookings', 500));
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code', 'location', 'capacity', 'facilities'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
        },
        {
          model: User,
          as: 'approvedByUser',
          attributes: ['id', 'firstName', 'lastName'],
          required: false,
        },
        {
          model: User,
          as: 'rejectedByUser',
          attributes: ['id', 'firstName', 'lastName'],
          required: false,
        },
      ],
    });

    if (!booking) {
      return res.status(404).json(createError('Booking not found', 404));
    }

    // Check if user has permission to view this booking
    const canView = booking.userId === req.user.id ||
                   req.user.role === 'technical_officer' ||
                   req.user.role === 'lecture_in_charge';

    if (!canView) {
      return res.status(403).json(createError('Access denied', 403));
    }

    res.json(createResponse({ booking }));

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json(createError('Failed to get booking', 500));
  }
};

// Update booking
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json(createError('Booking not found', 404));
    }

    // Check permissions
    const canUpdate = booking.userId === req.user.id ||
                     req.user.role === 'lecture_in_charge';

    if (!canUpdate) {
      return res.status(403).json(createError('Access denied', 403));
    }

    // Check if booking can be modified
    if (!booking.canBeModified()) {
      return res.status(400).json(createError(
        'Booking cannot be modified at this time',
        400
      ));
    }

    // If time is being changed, check for conflicts
    if (updates.startTime || updates.endTime) {
      const newStartTime = updates.startTime || booking.startTime;
      const newEndTime = updates.endTime || booking.endTime;

      const conflicts = await checkBookingConflicts(
        booking.laboratoryId,
        newStartTime,
        newEndTime,
        booking.id
      );

      if (conflicts.length > 0) {
        return res.status(409).json(createError(
          'Time slot conflicts with existing bookings',
          409,
          { conflicts }
        ));
      }
    }

    // Reset approval status if significant changes are made
    const significantFields = ['startTime', 'endTime', 'expectedAttendees', 'laboratoryId'];
    const hasSignificantChanges = significantFields.some(field => 
      updates[field] && updates[field] !== booking[field]
    );

    if (hasSignificantChanges && booking.status === 'approved') {
      updates.status = 'pending';
      updates.approvedBy = null;
      updates.approvedAt = null;
    }

    // Update booking
    await booking.update(updates);

    // Load updated booking with associations
    const updatedBooking = await Booking.findByPk(id, {
      include: [
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code', 'location'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    // Send notifications if status changed
    if (hasSignificantChanges) {
      await sendBookingNotifications(updatedBooking, 'updated');
    }

    res.json(createResponse({
      message: 'Booking updated successfully',
      booking: updatedBooking,
    }));

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json(createError('Failed to update booking', 500));
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json(createError('Booking not found', 404));
    }

    // Check permissions
    const canCancel = booking.userId === req.user.id ||
                     req.user.role === 'technical_officer' ||
                     req.user.role === 'lecture_in_charge';

    if (!canCancel) {
      return res.status(403).json(createError('Access denied', 403));
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json(createError(
        'Booking cannot be cancelled at this time',
        400
      ));
    }

    // Update booking status
    await booking.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: reason,
    });

    // Send notifications
    await sendBookingNotifications(booking, 'cancelled');

    res.json(createResponse({
      message: 'Booking cancelled successfully',
    }));

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json(createError('Failed to cancel booking', 500));
  }
};

// Get laboratory availability
export const getLabAvailability = async (req, res) => {
  try {
    const { laboratoryId } = req.params;
    const { date, duration = 60 } = req.query;

    if (!date) {
      return res.status(400).json(createError('Date is required', 400));
    }

    const laboratory = await Laboratory.findByPk(laboratoryId);
    if (!laboratory) {
      return res.status(404).json(createError('Laboratory not found', 404));
    }

    const requestedDate = new Date(date);
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get existing bookings for the day
    const existingBookings = await Booking.findAll({
      where: {
        laboratoryId,
        status: ['approved', 'pending'],
        [Op.or]: [
          {
            startTime: {
              [Op.between]: [startOfDay, endOfDay],
            },
          },
          {
            endTime: {
              [Op.between]: [startOfDay, endOfDay],
            },
          },
          {
            [Op.and]: [
              { startTime: { [Op.lte]: startOfDay } },
              { endTime: { [Op.gte]: endOfDay } },
            ],
          },
        ],
      },
      attributes: ['startTime', 'endTime', 'title', 'status'],
      order: [['startTime', 'ASC']],
    });

    // Generate available time slots
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const operatingHours = laboratory.operatingHours[dayOfWeek];

    if (operatingHours?.closed) {
      return res.json(createResponse({
        availableSlots: [],
        operatingHours,
        existingBookings: [],
      }));
    }

    const availableSlots = generateAvailableSlots(
      requestedDate,
      operatingHours,
      existingBookings,
      parseInt(duration)
    );

    res.json(createResponse({
      availableSlots,
      operatingHours,
      existingBookings,
    }));

  } catch (error) {
    console.error('Get lab availability error:', error);
    res.status(500).json(createError('Failed to get availability', 500));
  }
};

// Helper function to generate available time slots
const generateAvailableSlots = (date, operatingHours, existingBookings, duration) => {
  const slots = [];
  const startTime = new Date(date);
  const [startHour, startMinute] = operatingHours.start.split(':');
  startTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

  const endTime = new Date(date);
  const [endHour, endMinute] = operatingHours.end.split(':');
  endTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

  const slotDuration = duration * 60 * 1000; // Convert to milliseconds
  const buffer = 15 * 60 * 1000; // 15-minute buffer between bookings

  let currentTime = new Date(startTime);

  while (currentTime.getTime() + slotDuration <= endTime.getTime()) {
    const slotEnd = new Date(currentTime.getTime() + slotDuration);
    
    // Check if slot conflicts with existing bookings
    const hasConflict = existingBookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      return (
        (currentTime >= bookingStart && currentTime < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (currentTime <= bookingStart && slotEnd >= bookingEnd)
      );
    });

    if (!hasConflict) {
      slots.push({
        startTime: new Date(currentTime),
        endTime: new Date(slotEnd),
        available: true,
      });
    }

    currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000); // 30-minute intervals
  }

  return slots;
};

// Helper function to create recurring bookings
const createRecurringBookings = async (parentBooking, pattern) => {
  const recurringBookings = [];
  const { frequency, interval, endDate, daysOfWeek } = pattern;

  // Implementation for recurring booking logic
  // This is a simplified version - you can expand based on requirements
  
  return recurringBookings;
};

// Helper function to send booking notifications
const sendBookingNotifications = async (booking, action) => {
  try {
    // Send notifications based on action and user roles
    // Implementation depends on your notification service
    await sendNotification({
      type: 'booking',
      action,
      booking,
      recipients: ['technical_officer', 'lecture_in_charge'],
    });
  } catch (error) {
    console.error('Notification error:', error);
  }
};
