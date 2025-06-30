import express from 'express';
import { 
  getAllLaboratories,
  getLaboratoryById,
  createLaboratory,
  updateLaboratory,
  deleteLaboratory,
  toggleMaintenanceMode,
  getLaboratoryStats
} from '../controllers/labController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadLabImages } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes (for viewing labs)
router.get('/', authenticate, getAllLaboratories);
router.get('/:id', authenticate, getLaboratoryById);
router.get('/:id/stats', authenticate, getLaboratoryStats);

// Protected routes
router.post('/', authenticate, uploadLabImages, createLaboratory);
router.put('/:id', authenticate, uploadLabImages, updateLaboratory);
router.delete('/:id', authenticate, deleteLaboratory);
router.patch('/:id/maintenance', authenticate, toggleMaintenanceMode);

export default router;
