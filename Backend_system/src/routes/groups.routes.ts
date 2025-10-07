import { Router } from 'express';
import { authMiddleware, requireSuperAdmin } from '../middleware/auth.middleware';
import { GroupController } from '../controllers/group.controller.mongodb';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all groups
router.get('/', GroupController.getAllGroups);

// Get group by ID
router.get('/:id', GroupController.getGroupById);

// Create new group
router.post('/', GroupController.createGroup);

// Update group
router.put('/:id', GroupController.updateGroup);

// Delete group
router.delete('/:id', GroupController.deleteGroup);

// Add member to group
router.post('/:id/members', GroupController.addMember);

// Remove member from group
router.delete('/:id/members/:userId', GroupController.removeMember);

// Add admin to group (super admin only)
router.post('/:id/admins', requireSuperAdmin, GroupController.addAdmin);

// Remove admin from group (super admin only)
router.delete('/:id/admins/:userId', requireSuperAdmin, GroupController.removeAdmin);

export default router;