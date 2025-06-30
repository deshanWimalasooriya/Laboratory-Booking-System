import { Op } from 'sequelize';
import Equipment from '../models/Equipment.js';
import Laboratory from '../models/Laboratory.js';
import User from '../models/User.js';
import { createResponse, createError } from '../utils/responseUtils.js';
import { validateEquipment } from '../utils/validators.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/fileService.js';

// Get all equipment
export const getAllEquipment = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status,
      laboratoryId,
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
        { brand: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } },
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    if (status) {
      whereClause.status = status;
    }

    if (laboratoryId) {
      whereClause.laboratoryId = laboratoryId;
    }

    // For students and instructors, only show active equipment
    if (['student', 'instructor'].includes(req.user.role)) {
      whereClause.isActive = true;
      whereClause.status = 'working';
    }

    const { count, rows: equipment } = await Equipment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code', 'location'],
        },
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
      equipment,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    }));

  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json(createError('Failed to get equipment', 500));
  }
};

// Get equipment by ID
export const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findByPk(id, {
      include: [
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code', 'location', 'building'],
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

    if (!equipment) {
      return res.status(404).json(createError('Equipment not found', 404));
    }

    // For students and instructors, only show active equipment
    if (['student', 'instructor'].includes(req.user.role)) {
      if (!equipment.isActive || equipment.status !== 'working') {
        return res.status(404).json(createError('Equipment not found', 404));
      }
    }

    res.json(createResponse({ equipment }));

  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json(createError('Failed to get equipment', 500));
  }
};

// Create new equipment (Technical Officer and Lecture in Charge only)
export const createEquipment = async (req, res) => {
  try {
    // Check permissions
    if (!['technical_officer', 'lecture_in_charge'].includes(req.user.role)) {
      return res.status(403).json(createError('Access denied', 403));
    }

    // Validate input
    const { error } = validateEquipment(req.body);
    if (error) {
      return res.status(400).json(createError(error.details[0].message, 400));
    }

    const {
      name,
      code,
      description,
      category,
      brand,
      model,
      serialNumber,
      purchaseDate,
      purchasePrice,
      warrantyExpiry,
      laboratoryId,
      status,
      condition,
      location,
      specifications,
      maintenanceSchedule,
    } = req.body;

    // Check if code already exists
    const existingEquipment = await Equipment.findOne({ where: { code } });
    if (existingEquipment) {
      return res.status(409).json(createError('Equipment code already exists', 409));
    }

    // Check if serial number already exists (if provided)
    if (serialNumber) {
      const existingSerial = await Equipment.findOne({ where: { serialNumber } });
      if (existingSerial) {
        return res.status(409).json(createError('Serial number already exists', 409));
      }
    }

    // Verify laboratory exists
    const laboratory = await Laboratory.findByPk(laboratoryId);
    if (!laboratory) {
      return res.status(404).json(createError('Laboratory not found', 404));
    }

    // Handle image uploads if provided
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'equipment');
        images.push({
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
        });
      }
    }

    // Create equipment
    const equipment = await Equipment.create({
      name,
      code,
      description,
      category,
      brand,
      model,
      serialNumber,
      purchaseDate,
      purchasePrice,
      warrantyExpiry,
      laboratoryId,
      status,
      condition,
      location,
      specifications: specifications || {},
      maintenanceSchedule: maintenanceSchedule || {
        frequency: 'monthly',
        lastMaintenance: null,
        nextMaintenance: null,
      },
      images,
      createdBy: req.user.id,
    });

    // Load equipment with associations
    const equipmentWithDetails = await Equipment.findByPk(equipment.id, {
      include: [
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code', 'location'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    res.status(201).json(createResponse({
      message: 'Equipment created successfully',
      equipment: equipmentWithDetails,
    }, 201));

  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json(createError('Failed to create equipment', 500));
  }
};

// Update equipment
export const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check permissions
    if (!['technical_officer', 'lecture_in_charge'].includes(req.user.role)) {
      return res.status(403).json(createError('Access denied', 403));
    }

    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json(createError('Equipment not found', 404));
    }

    // Validate input
    const { error } = validateEquipment(req.body);
    if (error) {
      return res.status(400).json(createError(error.details[0].message, 400));
    }

    const updates = { ...req.body };

    // Check if code is being changed and if it already exists
    if (updates.code && updates.code !== equipment.code) {
      const existingEquipment = await Equipment.findOne({ 
        where: { 
          code: updates.code,
          id: { [Op.ne]: id },
        },
      });
      if (existingEquipment) {
        return res.status(409).json(createError('Equipment code already exists', 409));
      }
    }

    // Check if serial number is being changed and if it already exists
    if (updates.serialNumber && updates.serialNumber !== equipment.serialNumber) {
      const existingSerial = await Equipment.findOne({ 
        where: { 
          serialNumber: updates.serialNumber,
          id: { [Op.ne]: id },
        },
      });
      if (existingSerial) {
        return res.status(409).json(createError('Serial number already exists', 409));
      }
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'equipment');
        newImages.push({
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
        });
      }
      
      // Merge with existing images or replace
      if (updates.replaceImages === 'true') {
        // Delete old images from Cloudinary
        if (equipment.images && equipment.images.length > 0) {
          for (const image of equipment.images) {
            if (image.publicId) {
              await deleteFromCloudinary(image.publicId);
            }
          }
        }
        updates.images = newImages;
      } else {
        updates.images = [...(equipment.images || []), ...newImages];
      }
    }

    updates.updatedBy = req.user.id;

    // Update equipment
    await equipment.update(updates);

    // Load updated equipment with associations
    const updatedEquipment = await Equipment.findByPk(id, {
      include: [
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code', 'location'],
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
      message: 'Equipment updated successfully',
      equipment: updatedEquipment,
    }));

  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json(createError('Failed to update equipment', 500));
  }
};

// Delete equipment
export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check permissions
    if (!['technical_officer', 'lecture_in_charge'].includes(req.user.role)) {
      return res.status(403).json(createError('Access denied', 403));
    }

    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json(createError('Equipment not found', 404));
    }

    // Delete images from Cloudinary
    if (equipment.images && equipment.images.length > 0) {
      for (const image of equipment.images) {
        if (image.publicId) {
          await deleteFromCloudinary(image.publicId);
        }
      }
    }

    // Soft delete by setting isActive to false
    await equipment.update({ 
      isActive: false,
      updatedBy: req.user.id,
    });

    res.json(createResponse({
      message: 'Equipment deleted successfully',
    }));

  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json(createError('Failed to delete equipment', 500));
  }
};

// Update equipment status
export const updateEquipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, condition, notes } = req.body;

    // Check permissions
    if (!['technical_officer', 'lecture_in_charge'].includes(req.user.role)) {
      return res.status(403).json(createError('Access denied', 403));
    }

    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json(createError('Equipment not found', 404));
    }

    const validStatuses = ['working', 'not_working', 'under_repair', 'maintenance', 'retired'];
    const validConditions = ['excellent', 'good', 'fair', 'poor'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json(createError('Invalid status', 400));
    }

    if (condition && !validConditions.includes(condition)) {
      return res.status(400).json(createError('Invalid condition', 400));
    }

    const updates = { updatedBy: req.user.id };
    if (status) updates.status = status;
    if (condition) updates.condition = condition;

    await equipment.update(updates);

    // Log the status change (you can implement a maintenance log system)
    // await createMaintenanceLog(equipment.id, req.user.id, { status, condition, notes });

    res.json(createResponse({
      message: 'Equipment status updated successfully',
      equipment,
    }));

  } catch (error) {
    console.error('Update equipment status error:', error);
    res.status(500).json(createError('Failed to update equipment status', 500));
  }
};

// Get equipment by laboratory
export const getEquipmentByLaboratory = async (req, res) => {
  try {
    const { laboratoryId } = req.params;
    const { status, category } = req.query;

    const whereClause = { laboratoryId };

    if (status) {
      whereClause.status = status;
    }

    if (category) {
      whereClause.category = category;
    }

    // For students and instructors, only show active working equipment
    if (['student', 'instructor'].includes(req.user.role)) {
      whereClause.isActive = true;
      whereClause.status = 'working';
    }

    const equipment = await Equipment.findAll({
      where: whereClause,
      include: [
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code'],
        },
      ],
      order: [['name', 'ASC']],
    });

    res.json(createResponse({ equipment }));

  } catch (error) {
    console.error('Get equipment by laboratory error:', error);
    res.status(500).json(createError('Failed to get equipment', 500));
  }
};

// Get equipment statistics
export const getEquipmentStats = async (req, res) => {
  try {
    // Check permissions
    if (!['technical_officer', 'lecture_in_charge'].includes(req.user.role)) {
      return res.status(403).json(createError('Access denied', 403));
    }

    const { laboratoryId } = req.query;
    const whereClause = { isActive: true };

    if (laboratoryId) {
      whereClause.laboratoryId = laboratoryId;
    }

    // Get total counts by status
    const statusCounts = await Equipment.findAll({
      where: whereClause,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    // Get total counts by category
    const categoryCounts = await Equipment.findAll({
      where: whereClause,
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['category'],
      raw: true,
    });

    // Get equipment needing maintenance
    const needingMaintenance = await Equipment.findAll({
      where: {
        ...whereClause,
        [Op.or]: [
          { status: 'maintenance' },
          { status: 'under_repair' },
          // Add logic for overdue maintenance based on maintenanceSchedule
        ],
      },
      attributes: ['id', 'name', 'code', 'status', 'maintenanceSchedule'],
      include: [
        {
          model: Laboratory,
          as: 'laboratory',
          attributes: ['id', 'name', 'code'],
        },
      ],
    });

    const stats = {
      total: statusCounts.reduce((sum, item) => sum + parseInt(item.count), 0),
      byStatus: statusCounts.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      byCategory: categoryCounts.reduce((acc, item) => {
        acc[item.category] = parseInt(item.count);
        return acc;
      }, {}),
      needingMaintenance: needingMaintenance.length,
      maintenanceItems: needingMaintenance,
    };

    res.json(createResponse({ stats }));

  } catch (error) {
    console.error('Get equipment stats error:', error);
    res.status(500).json(createError('Failed to get equipment statistics', 500));
  }
};
