import { Op } from 'sequelize';
import Schedule from '../models/Schedule.js';
import Laboratory from '../models/Laboratory.js';
import User from '../models/User.js';
import { createResponse, createError } from '../utils/responseUtils.js';
import { sendNotification } from '../services/notificationService.js';

// Get all schedules
export const getAllSchedules = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      laboratoryId,
      instructorId,
      dayOfWeek,
      scheduleType,
      isActive,
      startDate,
      endDate,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (laboratoryId) {
      whereClause.laboratoryId = laboratoryId;
    }

    if (instructorId) {
      whereClause.instructorId = instructorId;
    }

    if (dayOfWeek) {
      whereClause.dayOfWeek = dayOfWeek;
    }

    if (scheduleType) {
      whereClause.scheduleType = scheduleType;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    if (startDate && endDate) {
      whereClause[Op.or] = [
        {
          startDate: {
            [Op.between]: [new Date(startDate), new Date(endDate)],
          },
        },
        {
          endDate: {
            [Op.between]: [new Date(startDate), new Date(endDate)],
          },
        },
        {
          [Op.and]: [
            { startDate: { [Op.lte]: new Date(startDate) } },
            { endDate: { [Op.gte]: new Date(endDate) } },
          ],
        },
      ];
    }

    const { count, rows: schedules } = await Schedule.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code', 'location', 'capacity'],
        },
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false,
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / limit);

    res.json(createResponse({
      schedules,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    }));

  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json(createError('Failed to get schedules', 500));
  }
};

// Get schedule by ID
export const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findByPk(id, {
      include: [
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code', 'location', 'capacity'],
        },
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email', 'department'],
          required: false,
        },
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

    if (!schedule) {
      return res.status(404).json(createError('Schedule not found', 404));
    }

    res.json(createResponse({ schedule }));

  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json(createError('Failed to get schedule', 500));
  }
};

// Create new schedule
export const createSchedule = async (req, res) => {
  try {
    // Check permissions
    if (!['instructor', 'technical_officer', 'lecture_in_charge'].includes(req.user.role)) {
      return res.status(403).json(createError('Access denied', 403));
    }

    const {
      title,
      description,
      laboratoryId,
      instructorId,
      courseCode,
      courseName,
      semester,
      academicYear,
      dayOfWeek,
      startTime,
      endTime,
      startDate,
      endDate,
      maxStudents,
      scheduleType,
      notes,
    } = req.body;

    // Validate required fields
    if (!title || !laboratoryId || !dayOfWeek || !startTime || !endTime || !startDate || !endDate) {
      return res.status(400).json(createError('Missing required fields', 400));
    }

    // Verify laboratory exists
    const laboratory = await Laboratory.findByPk(laboratoryId);
    if (!laboratory) {
      return res.status(404).json(createError('Laboratory not found', 404));
    }

    // Verify instructor exists if provided
    if (instructorId) {
      const instructor = await User.findOne({
        where: { 
          id: instructorId, 
          role: { [Op.in]: ['instructor', 'technical_officer', 'lecture_in_charge'] }
        }
      });
      if (!instructor) {
        return res.status(404).json(createError('Instructor not found', 404));
      }
    }

    // Check for schedule conflicts
    const conflicts = await Schedule.findAll({
      where: {
        laboratoryId,
        dayOfWeek,
        isActive: true,
        [Op.or]: [
          {
            startTime: {
              [Op.between]: [startTime, endTime],
            },
          },
          {
            endTime: {
              [Op.between]: [startTime, endTime],
            },
          },
          {
            [Op.and]: [
              { startTime: { [Op.lte]: startTime } },
              { endTime: { [Op.gte]: endTime } },
            ],
          },
        ],
        [Op.or]: [
          {
            startDate: {
              [Op.between]: [startDate, endDate],
            },
          },
          {
            endDate: {
              [Op.between]: [startDate, endDate],
            },
          },
          {
            [Op.and]: [
              { startDate: { [Op.lte]: startDate } },
              { endDate: { [Op.gte]: endDate } },
            ],
          },
        ],
      },
    });

    if (conflicts.length > 0) {
      return res.status(409).json(createError(
        'Schedule conflicts with existing schedules',
        409,
        { conflicts }
      ));
    }

    // Create schedule
    const schedule = await Schedule.create({
      title,
      description,
      laboratoryId,
      instructorId,
      courseCode,
      courseName,
      semester,
      academicYear,
      dayOfWeek,
      startTime,
      endTime,
      startDate,
      endDate,
      maxStudents: maxStudents || laboratory.capacity,
      scheduleType: scheduleType || 'regular',
      notes,
      createdBy: req.user.id,
    });

    // Load schedule with associations
    const scheduleWithDetails = await Schedule.findByPk(schedule.id, {
      include: [
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code', 'location'],
        },
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false,
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    // Send notification to students
    await sendNotification({
      role: 'student',
      type: 'schedule',
      title: 'New Schedule Added',
      message: `New schedule "${title}" has been added for ${laboratory.name}`,
      data: {
        scheduleId: schedule.id,
        laboratoryName: laboratory.name,
        dayOfWeek,
        startTime,
        endTime,
      },
      actionUrl: `/schedules/${schedule.id}`,
    });

    res.status(201).json(createResponse({
      message: 'Schedule created successfully',
      schedule: scheduleWithDetails,
    }, 201));

  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json(createError('Failed to create schedule', 500));
  }
};

// Update schedule
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    // Check permissions
    if (!['instructor', 'technical_officer', 'lecture_in_charge'].includes(req.user.role)) {
      return res.status(403).json(createError('Access denied', 403));
    }

    const schedule = await Schedule.findByPk(id);
    if (!schedule) {
      return res.status(404).json(createError('Schedule not found', 404));
    }

    // Check if user can update this schedule
    const canUpdate = req.user.role === 'lecture_in_charge' || 
                     schedule.createdBy === req.user.id ||
                     schedule.instructorId === req.user.id;

    if (!canUpdate) {
      return res.status(403).json(createError('Access denied', 403));
    }

    const updates = { ...req.body };

    // Check for conflicts if time or date is being changed
    if (updates.dayOfWeek || updates.startTime || updates.endTime || updates.startDate || updates.endDate) {
      const conflicts = await Schedule.findAll({
        where: {
          id: { [Op.ne]: id },
          laboratoryId: updates.laboratoryId || schedule.laboratoryId,
          dayOfWeek: updates.dayOfWeek || schedule.dayOfWeek,
          isActive: true,
          [Op.or]: [
            {
              startTime: {
                [Op.between]: [
                  updates.startTime || schedule.startTime,
                  updates.endTime || schedule.endTime
                ],
              },
            },
            {
              endTime: {
                [Op.between]: [
                  updates.startTime || schedule.startTime,
                  updates.endTime || schedule.endTime
                ],
              },
            },
            {
              [Op.and]: [
                { startTime: { [Op.lte]: updates.startTime || schedule.startTime } },
                { endTime: { [Op.gte]: updates.endTime || schedule.endTime } },
              ],
            },
          ],
        },
      });

      if (conflicts.length > 0) {
        return res.status(409).json(createError(
          'Schedule conflicts with existing schedules',
          409,
          { conflicts }
        ));
      }
    }

    updates.updatedBy = req.user.id;

    await schedule.update(updates);

    // Load updated schedule with associations
    const updatedSchedule = await Schedule.findByPk(id, {
      include: [
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code', 'location'],
        },
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false,
        },
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
      message: 'Schedule updated successfully',
      schedule: updatedSchedule,
    }));

  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json(createError('Failed to update schedule', 500));
  }
};

// Delete schedule
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    // Check permissions
    if (!['instructor', 'technical_officer', 'lecture_in_charge'].includes(req.user.role)) {
      return res.status(403).json(createError('Access denied', 403));
    }

    const schedule = await Schedule.findByPk(id);
    if (!schedule) {
      return res.status(404).json(createError('Schedule not found', 404));
    }

    // Check if user can delete this schedule
    const canDelete = req.user.role === 'lecture_in_charge' || 
                     schedule.createdBy === req.user.id;

    if (!canDelete) {
      return res.status(403).json(createError('Access denied', 403));
    }

    // Soft delete by setting isActive to false
    await schedule.update({ 
      isActive: false,
      updatedBy: req.user.id,
    });

    res.json(createResponse({
      message: 'Schedule deleted successfully',
    }));

  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json(createError('Failed to delete schedule', 500));
  }
};

// Get weekly schedule
export const getWeeklySchedule = async (req, res) => {
  try {
    const { laboratoryId, week, year } = req.query;

    const whereClause = { isActive: true };

    if (laboratoryId) {
      whereClause.laboratoryId = laboratoryId;
    }

    // Calculate date range for the week if provided
    if (week && year) {
      const startOfWeek = new Date(year, 0, 1 + (week - 1) * 7);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      whereClause[Op.or] = [
        {
          startDate: {
            [Op.between]: [startOfWeek, endOfWeek],
          },
        },
        {
          endDate: {
            [Op.between]: [startOfWeek, endOfWeek],
          },
        },
        {
          [Op.and]: [
            { startDate: { [Op.lte]: startOfWeek } },
            { endDate: { [Op.gte]: endOfWeek } },
          ],
        },
      ];
    }

    const schedules = await Schedule.findAll({
      where: whereClause,
      include: [
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code', 'location'],
        },
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName'],
          required: false,
        },
      ],
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
    });

    // Group schedules by day of week
    const weeklySchedule = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    schedules.forEach(schedule => {
      weeklySchedule[schedule.dayOfWeek].push(schedule);
    });

    res.json(createResponse({
      weeklySchedule,
      totalSchedules: schedules.length,
    }));

  } catch (error) {
    console.error('Get weekly schedule error:', error);
    res.status(500).json(createError('Failed to get weekly schedule', 500));
  }
};
