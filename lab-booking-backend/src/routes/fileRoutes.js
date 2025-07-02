import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  upload,
  documentUpload,
  audioUpload,
  videoUpload,
} from '../config/multer.js';
import {
  uploadFile,
  getFile,
  deleteFile,
  listFiles,
} from '../controllers/fileController.js';

const router = express.Router();

// Upload a general file (any type)
router.post('/upload', authenticate, upload.single('file'), uploadFile);

// Upload a document
router.post('/upload/document', authenticate, documentUpload.single('document'), uploadFile);

// Upload audio
router.post('/upload/audio', authenticate, audioUpload.single('audio'), uploadFile);

// Upload video
router.post('/upload/video', authenticate, videoUpload.single('video'), uploadFile);

// Get a file by ID or filename
router.get('/:id', authenticate, getFile);

// List all files for the user (or admin can list all)
router.get('/', authenticate, listFiles);

// Delete a file
router.delete('/:id', authenticate, deleteFile);

export default router;
