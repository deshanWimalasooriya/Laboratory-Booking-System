import express from 'express';
import { 
  getUserChatRooms,
  createChatRoom,
  getChatRoomMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  searchMessages
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadChatAttachments } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Chat room routes
router.get('/rooms', authenticate, getUserChatRooms);
router.post('/rooms', authenticate, createChatRoom);

// Message routes - Fix parameter names
router.get('/rooms/:chatRoomId/messages', authenticate, getChatRoomMessages);
router.post('/rooms/:chatRoomId/messages', authenticate, uploadChatAttachments, sendMessage);
router.put('/messages/:messageId', authenticate, editMessage);
router.delete('/messages/:messageId', authenticate, deleteMessage);
router.post('/messages/:messageId/reactions', authenticate, addReaction);
router.get('/rooms/:chatRoomId/search', authenticate, searchMessages);

export default router;
