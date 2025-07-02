import { createResponse, createError } from '../utils/responseUtils.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/fileService.js';
import { multerUtils } from '../config/multer.js';

// Upload a single file
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(createError('No file uploaded', 400));
    }

    const { folder = 'uploads' } = req.body;
    const result = await uploadToCloudinary(req.file.buffer, folder);

    res.status(201).json(createResponse({
      message: 'File uploaded successfully',
      file: {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        folder,
      },
    }, 201));
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json(createError('Failed to upload file', 500));
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(createError('No files uploaded', 400));
    }

    const { folder = 'uploads' } = req.body;
    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadToCloudinary(file.buffer, folder);
      return {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        folder,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.status(201).json(createResponse({
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles,
    }, 201));
  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json(createError('Failed to upload files', 500));
  }
};

// Delete a file
export const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json(createError('File public ID is required', 400));
    }

    await deleteFromCloudinary(publicId);

    res.json(createResponse({
      message: 'File deleted successfully',
      publicId,
    }));
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json(createError('Failed to delete file', 500));
  }
};

// Get file information
export const getFileInfo = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json(createError('File public ID is required', 400));
    }

    // This would typically fetch file info from Cloudinary
    // For now, return basic info
    res.json(createResponse({
      publicId,
      message: 'File information retrieved',
    }));
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json(createError('Failed to get file information', 500));
  }
};

// Validate file before upload
export const validateFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(createError('No file provided for validation', 400));
    }

    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      fileInfo: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        extension: multerUtils.getFileExtension(req.file.originalname),
        humanReadableSize: multerUtils.getHumanReadableSize(req.file.size),
      },
    };

    // Check file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (!multerUtils.validateFileSize(req.file.size, maxSize)) {
      validation.isValid = false;
      validation.errors.push(`File size exceeds maximum allowed size of ${multerUtils.getHumanReadableSize(maxSize)}`);
    }

    // Check file type
    if (!multerUtils.isImage(req.file.mimetype) && 
        !multerUtils.isDocument(req.file.mimetype) && 
        !multerUtils.isAudio(req.file.mimetype) && 
        !multerUtils.isVideo(req.file.mimetype)) {
      validation.isValid = false;
      validation.errors.push('File type not supported');
    }

    // Add warnings for large files
    if (req.file.size > 5 * 1024 * 1024) { // 5MB
      validation.warnings.push('Large file size may affect upload performance');
    }

    res.json(createResponse({
      validation,
    }));
  } catch (error) {
    console.error('File validation error:', error);
    res.status(500).json(createError('Failed to validate file', 500));
  }
};

// Get upload progress (placeholder for future implementation)
export const getUploadProgress = async (req, res) => {
  try {
    const { uploadId } = req.params;

    // This would typically track upload progress
    // For now, return a placeholder response
    res.json(createResponse({
      uploadId,
      progress: 100,
      status: 'completed',
      message: 'Upload progress retrieved',
    }));
  } catch (error) {
    console.error('Get upload progress error:', error);
    res.status(500).json(createError('Failed to get upload progress', 500));
  }
};
