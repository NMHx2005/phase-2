import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { MessageController } from '../controllers/message.controller.mongodb';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get messages by channel
router.get('/channel/:channelId', MessageController.getMessagesByChannel);

// Get messages by user
router.get('/user/:userId', MessageController.getMessagesByUser);

// Search messages
router.get('/search', MessageController.searchMessages);

// Get message by ID
router.get('/:id', MessageController.getMessageById);

// Create new message
router.post('/', MessageController.createMessage);

// Update message
router.put('/:id', MessageController.updateMessage);

// Delete message
router.delete('/:id', MessageController.deleteMessage);

export default router;