import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getMessagesByChatRoom,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  getMessageById,
} from '../controllers/messageController.js';
import { chatAttachmentsUpload } from '../config/multer.js';

const router = express.Router();

// Get all messages in a chat room
router.get('/room/:chatRoomId', authenticate, getMessagesByChatRoom);

// Get a single message by ID
router.get('/:id', authenticate, getMessageById);

// Send a message (with optional attachments)
router.post(
  '/room/:chatRoomId',
  authenticate,
  chatAttachmentsUpload.array('attachments', 5),
  sendMessage
);

// Edit a message
router.put('/:id', authenticate, editMessage);

// Delete a message
router.delete('/:id', authenticate, deleteMessage);

// Add a reaction to a message
router.post('/:id/reactions', authenticate, addReaction);

export default router;
