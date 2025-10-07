import { Router } from 'express';
import { authMiddleware, requireSuperAdmin } from '../middleware/auth.middleware';
import { ChannelController } from '../controllers/channel.controller.mongodb';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all channels
router.get('/', ChannelController.getAllChannels);

// Get channels with pagination
router.get('/paginated', ChannelController.getChannelsPaginated);

// Get channels by group
router.get('/group/:groupId', ChannelController.getChannelsByGroup);

// Get channel by ID
router.get('/:id', ChannelController.getChannelById);

// Create channel
router.post('/', ChannelController.createChannel);

// Update channel
router.put('/:id', ChannelController.updateChannel);

// Delete channel
router.delete('/:id', ChannelController.deleteChannel);

// Add member to channel
router.post('/:id/members', ChannelController.addMember);

// Remove member from channel
router.delete('/:id/members/:userId', ChannelController.removeMember);

export default router;
