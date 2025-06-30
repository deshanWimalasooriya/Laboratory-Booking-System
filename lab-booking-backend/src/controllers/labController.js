import { Op } from 'sequelize';
import Laboratory from '../models/Laboratory.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { createResponse, createError } from '../utils/responseUtils.js';
import { validateLaboratory } from '../utils/validators.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/fileService.js';

// Get all laboratories
export const getAllLaboratories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      labType,
      building,
      isActive,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
      ];
    }

    if (labType) {
      whereClause.labType = labType;
    }

    if (building) {
      whereClause.building = building;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    // For students and instructors, only show active labs
    if (['student', 'instructor'].includes(req.user.role)) {
      whereClause.isActive = true;
      whereClause.maintenanceMode = false;
    }

    const { count, rows: laboratories } = await Laboratory.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / limit);

    res.json(createResponse({
      laboratories,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    }));

  } catch (error) {
    console.error('Get laboratories error:', error);
    res.status(500).json(createError('Failed to get laboratories', 500));
  }
};

// Get laboratory by ID
export const getLaboratoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const laboratory = await Laboratory.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'firstName', 'lastName'],
          required: false,
        },
      ],
    });

    if (!laboratory) {
      return res.status(404).json(createError('Laboratory not found', 404));
    }

    // For students and instructors, only show active labs
    if (['student', 'instructor'].includes(req.user.role)) {
      if (!laboratory.isActive || laboratory.maintenanceMode) {
        return res.status(404).json(createError('Laboratory not found', 404));
      }
    }

    // Get recent bookings for this lab (for statistics)
    const recentBookings = await Booking.findAll({
      where: {
        laboratoryId: id,
        startTime: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      attributes: ['status'],
    });

    const bookingStats = {
      total: recentBookings.length,
      approved: recentBookings.filter(b => b.status === 'approved').length,
      pending: recentBookings.filter(b => b.status === 'pending').length,
      completed: recentBookings.filter(b => b.status === 'completed').length,
    };

    res.json(createResponse({
      laboratory,
      bookingStats,
    }));

  } catch (error) {
    console.error('Get laboratory error:', error);
    res.status(500).json(createError('Failed to get laboratory', 500));
  }
};

// Create new laboratory (Lecture in Charge only)
export const createLaboratory = async (req, res) => {
  try {
    // Check permissions
    if (req.user.role !== 'lecture_in_charge') {
      return res.status(403).json(createError('Access denied', 403));
    }

    // Validate input
    const { error } = validateLaboratory(req.body);
    if (error) {
      return res.status(400).json(createError(error.details[0].message, 400));
    }

    const {
      name,
      code,
      description,
      capacity,
      location,
      building,
      floor,
      roomNumber,
      labType,
      facilities,
      safetyRequirements,
      operatingHours,
      bookingRules,
    } = req.body;

    // Check if code already exists
    const existingLab = await Laboratory.findOne({ where: { code } });
    if (existingLab) {
      return res.status(409).json(createError('Laboratory code already exists', 409));
    }

    // Handle image uploads if provided
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'laboratories');
        images.push({
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
        });
      }
    }

    // Create laboratory
    const laboratory = await Laboratory.create({
      name,
      code,
      description,
      capacity,
      location,
      building,
      floor,
      roomNumber,
      labType,
      facilities: facilities || [],
      safetyRequirements: safetyRequirements || [],
      images,
      operatingHours: operatingHours || {
        monday: { start: '08:00', end: '17:00', closed: false },
        tuesday: { start: '08:00', end: '17:00', closed: false },
        wednesday: { start: '08:00', end: '17:00', closed: false },
        thursday: { start: '08:00', end: '17:00', closed: false },
        friday: { start: '08:00', end: '17:00', closed: false },
        saturday: { start: '09:00', end: '13:00', closed: false },
        sunday: { start: '09:00', end: '13:00', closed: true },
      },
      bookingRules: bookingRules || {
        maxBookingDuration: 180,
        minAdvanceBooking: 30,
        maxAdvanceBooking: 2160,
        allowRecurring: true,
        requireApproval: true,
      },
      createdBy: req.user.id,
    });

    // Load laboratory with creator info
    const laboratoryWithCreator = await Laboratory.findByPk(laboratory.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    res.status(201).json(createResponse({
      message: 'Laboratory created successfully',
      laboratory: laboratoryWithCreator,
    }, 201));

  } catch (error) {
    console.error('Create laboratory error:', error);
    res.status(500).json(createError('Failed to create laboratory', 500));
  }
};

// Update laboratory
export const updateLaboratory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check permissions
    if (req.user.role !== 'lecture_in_charge') {
      return res.status(403).json(createError('Access denied', 403));
    }

    const laboratory = await Laboratory.findByPk(id);
    if (!laboratory) {
      return res.status(404).json(createError('Laboratory not found', 404));
    }

    // Validate input
    const { error } = validateLaboratory(req.body);
    if (error) {
      return res.status(400).json(createError(error.details[0].message, 400));
    }

    const updates = { ...req.body };

    // Check if code is being changed and if it already exists
    if (updates.code && updates.code !== laboratory.code) {
      const existingLab = await Laboratory.findOne({ 
        where: { 
          code: updates.code,
          id: { [Op.ne]: id },
        },
      });
      if (existingLab) {
        return res.status(409).json(createError('Laboratory code already exists', 409));
      }
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'laboratories');
        newImages.push({
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
        });
      }
      
      // Merge with existing images or replace
      if (updates.replaceImages === 'true') {
        // Delete old images from Cloudinary
        if (laboratory.images && laboratory.images.length > 0) {
          for (const image of laboratory.images) {
            if (image.publicId) {
              await deleteFromCloudinary(image.publicId);
            }
          }
        }
        updates.images = newImages;
      } else {
        updates.images = [...(laboratory.images || []), ...newImages];
      }
    }

    updates.updatedBy = req.user.id;

    // Update laboratory
    await laboratory.update(updates);

    // Load updated laboratory with associations
    const updatedLaboratory = await Laboratory.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    res.json(createResponse({
      message: 'Laboratory updated successfully',
      laboratory: updatedLaboratory,
    }));

  } catch (error) {
    console.error('Update laboratory error:', error);
    res.status(500).json(createError('Failed to update laboratory', 500));
  }
};

// Delete laboratory
export const deleteLaboratory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check permissions
    if (req.user.role !== 'lecture_in_charge') {
      return res.status(403).json(createError('Access denied', 403));
    }

    const laboratory = await Laboratory.findByPk(id);
    if (!laboratory) {
      return res.status(404).json(createError('Laboratory not found', 404));
    }

    // Check if there are active bookings
    const activeBookings = await Booking.findOne({
      where: {
        laboratoryId: id,
        status: ['approved', 'pending'],
        startTime: { [Op.gte]: new Date() },
      },
    });

    if (activeBookings) {
      return res.status(400).json(createError(
        'Cannot delete laboratory with active or pending bookings',
        400
      ));
    }

    // Delete images from Cloudinary
    if (laboratory.images && laboratory.images.length > 0) {
      for (const image of laboratory.images) {
        if (image.publicId) {
          await deleteFromCloudinary(image.publicId);
        }
      }
    }

    // Soft delete by setting isActive to false
    await laboratory.update({ 
      isActive: false,
      updatedBy: req.user.id,
    });

    res.json(createResponse({
      message: 'Laboratory deleted successfully',
    }));

  } catch (error) {
    console.error('Delete laboratory error:', error);
    res.status(500).json(createError('Failed to delete laboratory', 500));
  }
};

// Toggle maintenance mode
export const toggleMaintenanceMode = async (req, res) => {
  try {
    const { id } = req.params;
    const { maintenanceMode, reason } = req.body;

    // Check permissions
    if (!['technical_officer', 'lecture_in_charge'].includes(req.user.role)) {
      return res.status(403).json(createError('Access denied', 403));
    }

    const laboratory = await Laboratory.findByPk(id);
    if (!laboratory) {
      return res.status(404).json(createError('Laboratory not found', 404));
    }

    await laboratory.update({
      maintenanceMode,
      updatedBy: req.user.id,
    });

    // If enabling maintenance mode, notify users with active bookings
    if (maintenanceMode) {
      const affectedBookings = await Booking.findAll({
        where: {
          laboratoryId: id,
          status: ['approved', 'pending'],
          startTime: { [Op.gte]: new Date() },
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName'],
          },
        ],
      });

      // Send notifications to affected users
      // Implementation depends on your notification service
    }

    res.json(createResponse({
      message: `Laboratory ${maintenanceMode ? 'entered' : 'exited'} maintenance mode`,
      laboratory,
    }));

  } catch (error) {
    console.error('Toggle maintenance mode error:', error);
    res.status(500).json(createError('Failed to toggle maintenance mode', 500));
  }
};

// Get laboratory statistics
export const getLaboratoryStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Check permissions
    if (!['technical_officer', 'lecture_in_charge'].includes(req.user.role)) {
      return res.status(403).json(createError('Access denied', 403));
    }

    const laboratory = await Laboratory.findByPk(id);
    if (!laboratory) {
      return res.status(404).json(createError('Laboratory not found', 404));
    }

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.startTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else {
      // Default to last 30 days
      dateFilter.startTime = {
        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };
    }

    // Get booking statistics
    const bookings = await Booking.findAll({
      where: {
        laboratoryId: id,
        ...dateFilter,
      },
      attributes: ['status', 'startTime', 'endTime', 'expectedAttendees', 'actualAttendees'],
    });

    const stats = {
      totalBookings: bookings.length,
      approvedBookings: bookings.filter(b => b.status === 'approved').length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
      noShowBookings: bookings.filter(b => b.status === 'no_show').length,
      totalHoursBooked: bookings.reduce((total, booking) => {
        const duration = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
        return total + duration;
      }, 0),
      averageBookingDuration: 0,
      utilizationRate: 0,
      averageAttendees: 0,
    };

    if (stats.totalBookings > 0) {
      stats.averageBookingDuration = stats.totalHoursBooked / stats.totalBookings;
      
      const completedBookings = bookings.filter(b => b.status === 'completed' && b.actualAttendees);
      if (completedBookings.length > 0) {
        stats.averageAttendees = completedBookings.reduce((total, b) => total + b.actualAttendees, 0) / completedBookings.length;
      }

      // Calculate utilization rate (simplified)
      const totalAvailableHours = 8 * 30; // Assuming 8 hours/day for 30 days
      stats.utilizationRate = (stats.totalHoursBooked / totalAvailableHours) * 100;
    }

    res.json(createResponse({
      laboratory: {
        id: laboratory.id,
        name: laboratory.name,
        code: laboratory.code,
      },
      stats,
      period: {
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: endDate || new Date().toISOString(),
      },
    }));

  } catch (error) {
    console.error('Get laboratory stats error:', error);
    res.status(500).json(createError('Failed to get laboratory statistics', 500));
  }
};
