import express from 'express';
import {
  createChat,
  getChats,
  getChatMessages,
  sendMessage,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createChat)
  .get(protect, getChats);

router.route('/:id/messages')
  .get(protect, getChatMessages)
  .post(protect, sendMessage);

export default router;
