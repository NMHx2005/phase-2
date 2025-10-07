import { Request, Response } from 'express';
import { groupService } from '../services/group.service';
import { requireSuperAdmin } from '../middleware/auth.middleware';

export class GroupController {
    /**
     * Get all groups
     */
    static async getAllGroups(req: Request, res: Response): Promise<void> {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                status,
                category,
                isPrivate,
                sortBy,
                sortOrder
            } = req.query;

            const result = await groupService.getAllGroups({
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                search: search as string,
                status: status as string,
                category: category as string,
                isPrivate: isPrivate ? isPrivate === 'true' : undefined,
                sortBy: sortBy as string,
                sortOrder: sortOrder as string
            });

            res.json({
                success: true,
                data: result
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
     * Get group by ID
     */
    static async getGroupById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Group ID is required'
                });
                return;
            }

            const group = await groupService.getGroupById(id);

            if (!group) {
                res.status(404).json({
                    success: false,
                    message: 'Group not found'
                });
                return;
            }

            res.json({
                success: true,
                data: group
            });
        } catch (error) {
            console.error('Error getting group by ID:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Create group
     */
    static async createGroup(req: Request, res: Response): Promise<void> {
        try {
            const groupData = {
                ...req.body,
                createdBy: req.user?.id
            };

            const group = await groupService.createGroup(groupData);

            res.status(201).json({
                success: true,
                data: group
            });
        } catch (error: any) {
            console.error('Error creating group:', error);
            if (error.message.includes('duplicate')) {
                res.status(409).json({
                    success: false,
                    message: 'Group already exists'
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
     * Update group
     */
    static async updateGroup(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Group ID is required'
                });
                return;
            }
            const updateData = req.body;

            const group = await groupService.updateGroup(id, updateData);

            if (!group) {
                res.status(404).json({
                    success: false,
                    message: 'Group not found'
                });
                return;
            }

            res.json({
                success: true,
                data: group
            });
        } catch (error) {
            console.error('Error updating group:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Delete group
     */
    static async deleteGroup(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Group ID is required'
                });
                return;
            }

            const deleted = await groupService.deleteGroup(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Group not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Group deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting group:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Add member to group
     */
    static async addMember(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { userId, username } = req.body;

            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Group ID is required'
                });
                return;
            }

            if (!userId || !username) {
                res.status(400).json({
                    success: false,
                    message: 'User ID and username are required'
                });
                return;
            }

            const group = await groupService.addMember(id, userId, username);

            if (!group) {
                res.status(404).json({
                    success: false,
                    message: 'Group not found'
                });
                return;
            }

            res.json({
                success: true,
                data: group
            });
        } catch (error: any) {
            console.error('Error adding member:', error);
            if (error.message.includes('already')) {
                res.status(409).json({
                    success: false,
                    message: 'User is already a member'
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
     * Remove member from group
     */
    static async removeMember(req: Request, res: Response): Promise<void> {
        try {
            const { id, userId } = req.params;

            // Enhanced validation
            if (!id || !userId || userId === 'undefined' || userId.trim() === '') {
                res.status(400).json({
                    success: false,
                    message: 'Group ID and User ID are required and must be valid'
                });
                return;
            }

            // Validate ObjectId format
            if (!/^[0-9a-fA-F]{24}$/.test(id) || !/^[0-9a-fA-F]{24}$/.test(userId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid ID format. IDs must be 24-character hex strings'
                });
                return;
            }

            const group = await groupService.removeMember(id, userId);

            if (!group) {
                res.status(404).json({
                    success: false,
                    message: 'Group not found or member not found in group'
                });
                return;
            }

            res.json({
                success: true,
                data: group,
                message: 'Member removed successfully'
            });
        } catch (error) {
            console.error('Error removing member:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Add admin to group (Super Admin only)
     */
    static async addAdmin(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Group ID is required'
                });
                return;
            }
            const { userId } = req.body;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }

            const group = await groupService.addAdmin(id, userId);

            if (!group) {
                res.status(404).json({
                    success: false,
                    message: 'Group not found'
                });
                return;
            }

            res.json({
                success: true,
                data: group
            });
        } catch (error: any) {
            console.error('Error adding admin:', error);
            if (error.message.includes('already')) {
                res.status(409).json({
                    success: false,
                    message: 'User is already an admin'
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
     * Remove admin from group (Super Admin only)
     */
    static async removeAdmin(req: Request, res: Response): Promise<void> {
        try {
            const { id, userId } = req.params;
            if (!id || !userId) {
                res.status(400).json({
                    success: false,
                    message: 'Group ID and User ID are required'
                });
                return;
            }

            const group = await groupService.removeAdmin(id, userId);

            if (!group) {
                res.status(404).json({
                    success: false,
                    message: 'Group not found'
                });
                return;
            }

            res.json({
                success: true,
                data: group
            });
        } catch (error) {
            console.error('Error removing admin:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
