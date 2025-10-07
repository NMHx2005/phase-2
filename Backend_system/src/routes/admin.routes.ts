import { Router } from 'express';
import { authMiddleware, requireSuperAdmin, requireGroupAdmin } from '../middleware/auth.middleware';
import { AdminController } from '../controllers/admin.controller.mongodb';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get dashboard statistics
router.get('/dashboard', AdminController.getDashboard);

// Get all users (Admin and Super Admin can view)
router.get('/users', requireGroupAdmin, AdminController.getAllUsers);

// Create user (Super Admin only)
router.post('/users', requireSuperAdmin, AdminController.createUser);

// Update user (Super Admin only)
router.put('/users/:id', requireSuperAdmin, AdminController.updateUser);

// Delete user (Super Admin only)
router.delete('/users/:id', requireSuperAdmin, AdminController.deleteUser);

// Bulk delete users (Super Admin only)
router.post('/users/bulk-delete', requireSuperAdmin, AdminController.bulkDeleteUsers);

// Bulk update users (Super Admin only)
router.post('/users/bulk-update', requireSuperAdmin, AdminController.bulkUpdateUsers);

// Get system statistics
router.get('/stats', AdminController.getSystemStats);

// Get user activity logs
router.get('/users/:userId/activity', AdminController.getUserActivity);

// Get group statistics
router.get('/groups/stats', AdminController.getGroupStats);

// Get channel statistics
router.get('/channels/stats', AdminController.getChannelStats);

// Get all groups (Admin only)
router.get('/groups', AdminController.getAllGroups);

// Get all channels (Admin only)
router.get('/channels', AdminController.getAllChannels);

// Get user groups (Admin only)
router.get('/users/:userId/groups', AdminController.getUserGroups);

// Get user statistics (Admin and Super Admin can view)
router.get('/users/stats', requireGroupAdmin, AdminController.getUserStats);

export default router;
