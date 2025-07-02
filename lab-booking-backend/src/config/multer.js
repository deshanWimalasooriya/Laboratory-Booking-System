import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// File type validation
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    documents: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
  };

  const allAllowedTypes = [
    ...allowedTypes.images,
    ...allowedTypes.documents,
    ...allowedTypes.audio,
    ...allowedTypes.video,
  ];

  // Check file type
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allAllowedTypes.join(', ')}`), false);
  }
};

// Storage configuration for local storage (fallback)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Determine upload path based on file type
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype.startsWith('audio/')) {
      uploadPath += 'audio/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath += 'video/';
    } else {
      uploadPath += 'documents/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Memory storage for cloud uploads (recommended)
const memoryStorage = multer.memoryStorage();

// File size limits
const fileLimits = {
  fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  files: 10, // Maximum number of files
  fields: 20, // Maximum number of fields
};

// Base multer configuration
const baseConfig = {
  storage: process.env.NODE_ENV === 'production' ? memoryStorage : localStorage,
  fileFilter,
  limits: fileLimits,
};

// Create multer instances for different use cases
export const upload = multer(baseConfig);

// Profile image upload (single file, images only)
export const profileImageUpload = multer({
  ...baseConfig,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile pictures'), false);
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB for profile images
    files: 1,
  },
});

// Laboratory images upload (multiple files, images only)
export const labImagesUpload = multer({
  ...baseConfig,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for laboratory images'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 5, // Maximum 5 images
  },
});

// Equipment images upload (multiple files, images only)
export const equipmentImagesUpload = multer({
  ...baseConfig,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for equipment images'), false);
    }
  },
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB per image
    files: 3, // Maximum 3 images
  },
});

// Chat attachments upload (multiple files, various types)
export const chatAttachmentsUpload = multer({
  ...baseConfig,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for chat attachments
    files: 5, // Maximum 5 files
  },
});

// Document upload (single file, documents only)
export const documentUpload = multer({
  ...baseConfig,
  fileFilter: (req, file, cb) => {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    if (documentTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only document files are allowed'), false);
    }
  },
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB for documents
    files: 1,
  },
});

// Audio upload for voice messages
export const audioUpload = multer({
  ...baseConfig,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for audio
    files: 1,
  },
});

// Video upload
export const videoUpload = multer({
  ...baseConfig,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for videos
    files: 1,
  },
});

// Utility functions
export const multerUtils = {
  // Get file extension
  getFileExtension: (filename) => {
    return path.extname(filename).toLowerCase();
  },

  // Check if file is image
  isImage: (mimetype) => {
    return mimetype.startsWith('image/');
  },

  // Check if file is document
  isDocument: (mimetype) => {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    return documentTypes.includes(mimetype);
  },

  // Check if file is audio
  isAudio: (mimetype) => {
    return mimetype.startsWith('audio/');
  },

  // Check if file is video
  isVideo: (mimetype) => {
    return mimetype.startsWith('video/');
  },

  // Generate unique filename
  generateUniqueFilename: (originalname) => {
    const ext = path.extname(originalname);
    return `${uuidv4()}-${Date.now()}${ext}`;
  },

  // Validate file size
  validateFileSize: (size, maxSize) => {
    return size <= maxSize;
  },

  // Get human readable file size
  getHumanReadableSize: (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },
};

// Error handling middleware for multer
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'File too large',
          details: `Maximum file size is ${multerUtils.getHumanReadableSize(fileLimits.fileSize)}`,
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Too many files',
          details: `Maximum ${fileLimits.files} files allowed`,
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Unexpected file field',
          details: 'File field name does not match expected field',
        });
      default:
        return res.status(400).json({
          success: false,
          error: 'File upload error',
          details: error.message,
        });
    }
  } else if (error) {
    return res.status(400).json({
      success: false,
      error: 'File validation error',
      details: error.message,
    });
  }
  next();
};

