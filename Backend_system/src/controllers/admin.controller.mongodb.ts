import { Request, Response } from 'express';
import { requireSuperAdmin } from '../middleware/auth.middleware';
import { adminService } from '../services/admin.service';

export class AdminController {
    /**
     * Get dashboard statistics
     */
    static async getDashboard(req: Request, res: Response): Promise<void> {
        try {
            const stats = await adminService.getDashboardStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get all users (Group Admin and Super Admin can view)
     */
    static async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const { search } = req.query;

            // Get all users without pagination
            const users = await adminService.getAllUsers({
                page: 1,
                limit: 1000, // Set a high limit to get all users
                search: search as string
            });

            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('Error getting all users:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Create user (Super Admin only)
     */
    static async createUser(req: Request, res: Response): Promise<void> {
        try {
            // Double check: Only Super Admin can create users
            if (!req.user?.roles.includes('super_admin')) {
                res.status(403).json({
                    success: false,
                    message: 'Only Super Admin can create users'
                });
                return;
            }

            const { username, email, password, roles } = req.body;

            if (!username || !email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Username, email, and password are required'
                });
                return;
            }

            const user = await adminService.createUser({
                username,
                email,
                password,
                roles: roles || ['user']
            });

            res.status(201).json({
                success: true,
                data: user
            });
        } catch (error: any) {
            console.error('Error creating user:', error);
            if (error.message.includes('duplicate')) {
                res.status(409).json({
                    success: false,
                    message: 'User already exists'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        }
    }

    /**
     * Update user (Super Admin only)
     */
    static async updateUser(req: Request, res: Response): Promise<void> {
        try {
            // Double check: Only Super Admin can update users
            if (!req.user?.roles.includes('super_admin')) {
                res.status(403).json({
                    success: false,
                    message: 'Only Super Admin can update users'
                });
                return;
            }

            const { id } = req.params;
            const { username, email, roles, isActive } = req.body;

            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }

            const user = await adminService.updateUser(id, {
                username,
                email,
                roles,
                isActive
            });

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
                data: user,
                message: 'User updated successfully'
            });
        } catch (error: any) {
            console.error('Error updating user:', error);
            if (error.message.includes('duplicate')) {
                res.status(409).json({
                    success: false,
                    message: 'Username or email already exists'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        }
    }

    /**
     * Delete user (Super Admin only)
     */
    static async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            // Double check: Only Super Admin can delete users
            if (!req.user?.roles.includes('super_admin')) {
                res.status(403).json({
                    success: false,
                    message: 'Only Super Admin can delete users'
                });
                return;
            }

            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }

            const deleted = await adminService.deleteUser(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
                data: { deleted: true },
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Bulk delete users (Super Admin only)
     */
    static async bulkDeleteUsers(req: Request, res: Response): Promise<void> {
        try {
            // Double check: Only Super Admin can bulk delete users
            if (!req.user?.roles.includes('super_admin')) {
                res.status(403).json({
                    success: false,
                    message: 'Only Super Admin can bulk delete users'
                });
                return;
            }

            const { userIds } = req.body;

            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'User IDs array is required'
                });
                return;
            }

            const deletedCount = await adminService.bulkDeleteUsers(userIds);

            res.json({
                success: true,
                data: { deletedCount },
                message: `${deletedCount} users deleted successfully`
            });
        } catch (error) {
            console.error('Error bulk deleting users:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Bulk update users (Super Admin only)
     */
    static async bulkUpdateUsers(req: Request, res: Response): Promise<void> {
        try {
            // Double check: Only Super Admin can bulk update users
            if (!req.user?.roles.includes('super_admin')) {
                res.status(403).json({
                    success: false,
                    message: 'Only Super Admin can bulk update users'
                });
                return;
            }

            const { userIds, updates } = req.body;

            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'User IDs array is required'
                });
                return;
            }

            if (!updates || Object.keys(updates).length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Updates object is required'
                });
                return;
            }

            const updatedCount = await adminService.bulkUpdateUsers(userIds, updates);

            res.json({
                success: true,
                data: { updatedCount },
                message: `${updatedCount} users updated successfully`
            });
        } catch (error) {
            console.error('Error bulk updating users:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get system statistics
     */
    static async getSystemStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await adminService.getSystemStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error getting system stats:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get user activity logs
     */
    static async getUserActivity(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }
            const { limit = 50, offset = 0 } = req.query;

            const activities = await adminService.getUserActivity(
                userId,
                parseInt(limit as string),
                parseInt(offset as string)
            );

            res.json({
                success: true,
                data: activities
            });
        } catch (error) {
            console.error('Error getting user activity:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get group statistics
     */
    static async getGroupStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await adminService.getGroupStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error getting group stats:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get channel statistics
     */
    static async getChannelStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await adminService.getChannelStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error getting channel stats:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get all groups (Admin only)
     */
    static async getAllGroups(req: Request, res: Response): Promise<void> {
        try {
            const { page = 1, limit = 10, search, status, category } = req.query;

            const groups = await adminService.getAllGroups({
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                search: search as string,
                status: status as string,
                category: category as string
            });

            res.json({
                success: true,
                data: groups
            });
        } catch (error) {
            console.error('Error getting all groups:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get all channels (Admin only)
     */
    static async getAllChannels(req: Request, res: Response): Promise<void> {
        try {
            const channels = await adminService.getAllChannels();

            res.json({
                success: true,
                data: channels
            });
        } catch (error) {
            console.error('Error getting all channels:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get user groups (Admin only)
     */
    static async getUserGroups(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }

            const groups = await adminService.getUserGroups(userId);

            res.json({
                success: true,
                data: groups
            });
        } catch (error) {
            console.error('Error getting user groups:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get user statistics (Group Admin and Super Admin can view)
     */
    static async getUserStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await adminService.getUserStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error getting user stats:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
