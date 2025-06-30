import express from 'express';
import { 
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  updateEquipmentStatus,
  getEquipmentByLaboratory,
  getEquipmentStats
} from '../controllers/equipmentController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadEquipmentImages } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Equipment routes
router.get('/', authenticate, getAllEquipment);
router.get('/stats', authenticate, getEquipmentStats);
router.get('/:id', authenticate, getEquipmentById);
router.post('/', authenticate, uploadEquipmentImages, createEquipment);
router.put('/:id', authenticate, uploadEquipmentImages, updateEquipment);
router.delete('/:id', authenticate, deleteEquipment);
router.patch('/:id/status', authenticate, updateEquipmentStatus);

// Equipment by laboratory - Fix the parameter name
router.get('/laboratory/:laboratoryId', authenticate, getEquipmentByLaboratory);

export default router;
