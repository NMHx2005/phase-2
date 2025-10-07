import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { ClientController } from '../controllers/client.controller.mongodb';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get client profile
router.get('/profile', ClientController.getProfile);

// Update client profile
router.put('/profile', ClientController.updateProfile);

// Get client groups
router.get('/groups', ClientController.getGroups);

// Get client channels
router.get('/channels', ClientController.getChannels);

// Get client messages
router.get('/messages', ClientController.getMessages);

// Get client notifications
router.get('/notifications', ClientController.getNotifications);

// Mark notification as read
router.put('/notifications/:notificationId/read', ClientController.markNotificationRead);

// Get client settings
router.get('/settings', ClientController.getSettings);

// Update client settings
router.put('/settings', ClientController.updateSettings);

export default router;
