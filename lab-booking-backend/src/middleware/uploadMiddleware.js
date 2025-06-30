import multer from 'multer';
import { createError } from '../utils/responseUtils.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    video: ['video/mp4', 'video/webm', 'video/ogg'],
  };

  const allAllowedTypes = [
    ...allowedTypes.images,
    ...allowedTypes.documents,
    ...allowedTypes.audio,
    ...allowedTypes.video,
  ];

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10, // Maximum 10 files
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json(createError('File too large', 400));
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json(createError('Unexpected field', 400));
          }
        }
        return res.status(400).json(createError(err.message, 400));
      }
      next();
    });
  };
};

// Middleware for multiple file upload
export const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json(createError('File too large', 400));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json(createError(`Too many files. Maximum ${maxCount} allowed`, 400));
          }
        }
        return res.status(400).json(createError(err.message, 400));
      }
      next();
    });
  };
};

// Middleware for profile image upload
export const uploadProfileImage = uploadSingle('profileImage');

// Middleware for laboratory images
export const uploadLabImages = uploadMultiple('images', 5);

// Middleware for equipment images
export const uploadEquipmentImages = uploadMultiple('images', 3);

// Middleware for chat attachments
export const uploadChatAttachments = uploadMultiple('attachments', 5);
