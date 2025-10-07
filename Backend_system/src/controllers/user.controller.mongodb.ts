import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { requireSuperAdmin } from '../middleware/auth.middleware';

export class UserController {
    /**
     * Get all users (Super Admin only)
     */
    static async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const users = await userService.getAllUsers({
                page: parseInt(page as string),
                limit: parseInt(limit as string),
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
     * Get user by ID
     */
    static async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }

            const user = await userService.findById(id);

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Error getting user by ID:', error);
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
            const { username, email, password, roles } = req.body;

            if (!username || !email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Username, email, and password are required'
                });
                return;
            }

            const user = await userService.create({
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
     * Update user
     */
    static async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }

            const updateData = req.body;

            const user = await userService.update(id, updateData);

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Delete user (Super Admin only)
     */
    static async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }

            const deleted = await userService.delete(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
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
     * Get user groups
     */
    static async getUserGroups(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }

            const groups = await userService.getUserGroups(id);

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
     * Get user avatar (public endpoint - no auth required)
     */
    static async getUserAvatar(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }

            const user = await userService.findById(id);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
                data: {
                    avatar: user.avatar || null
                }
            });
        } catch (error) {
            console.error('Error getting user avatar:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
