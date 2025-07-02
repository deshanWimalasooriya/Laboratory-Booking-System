import path from 'path';

// Get file extension
export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

// Check if file is image
export const isImage = (mimetype) => {
  return mimetype.startsWith('image/');
};

// Check if file is document
export const isDocument = (mimetype) => {
  const docs = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];
  return docs.includes(mimetype);
};

// Generate unique filename
export const generateUniqueFilename = (originalname) => {
  const ext = getFileExtension(originalname);
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
};
