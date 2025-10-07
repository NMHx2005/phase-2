import { Router } from 'express';
import { authMiddleware, requireSuperAdmin } from '../middleware/auth.middleware';
import { UserController } from '../controllers/user.controller.mongodb';

const router = Router();

// Public routes (no auth required)
router.get('/:id/avatar', UserController.getUserAvatar);

// Apply authentication middleware to all other routes
router.use(authMiddleware);

// Get all users (Super Admin only)
router.get('/', requireSuperAdmin, UserController.getAllUsers);

// Get user by ID
router.get('/:id', UserController.getUserById);

// Create user (Super Admin only)
router.post('/', requireSuperAdmin, UserController.createUser);

// Update user
router.put('/:id', UserController.updateUser);

// Delete user (Super Admin only)
router.delete('/:id', requireSuperAdmin, UserController.deleteUser);

// Get user groups
router.get('/:id/groups', UserController.getUserGroups);

export default router;
