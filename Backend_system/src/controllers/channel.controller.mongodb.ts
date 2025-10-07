import { Request, Response } from 'express';
import { channelService } from '../services/channel.service';

export class ChannelController {
    /**
     * Get all channels
     */
    static async getAllChannels(req: Request, res: Response): Promise<void> {
        try {
            const channels = await channelService.getAllChannels();
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
     * Get channels with pagination
     */
    static async getChannelsPaginated(req: Request, res: Response): Promise<void> {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                groupId,
                channelType,
                isActive,
                sortBy,
                sortOrder
            } = req.query;

            const result = await channelService.getChannelsPaginated({
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                search: search as string,
                groupId: groupId as string,
                channelType: channelType as string,
                isActive: isActive ? isActive === 'true' : undefined,
                sortBy: sortBy as string,
                sortOrder: sortOrder as 'asc' | 'desc'
            });

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error getting channels with pagination:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get channels by group ID
     */
    static async getChannelsByGroup(req: Request, res: Response): Promise<void> {
        try {
            const { groupId } = req.params;
            if (!groupId) {
                res.status(400).json({
                    success: false,
                    message: 'Group ID is required'
                });
                return;
            }
            const channels = await channelService.getChannelsByGroup(groupId);

            res.json({
                success: true,
                data: channels
            });
        } catch (error) {
            console.error('Error getting channels by group:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get channel by ID
     */
    static async getChannelById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Channel ID is required'
                });
                return;
            }
            const channel = await channelService.getChannelById(id);

            if (!channel) {
                res.status(404).json({
                    success: false,
                    message: 'Channel not found'
                });
                return;
            }

            res.json({
                success: true,
                data: channel
            });
        } catch (error) {
            console.error('Error getting channel by ID:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Create channel
     */
    static async createChannel(req: Request, res: Response): Promise<void> {
        try {
            const channelData = {
                ...req.body,
                createdBy: req.user?.id
            };

            const channel = await channelService.createChannel(channelData);

            res.status(201).json({
                success: true,
                data: channel
            });
        } catch (error: any) {
            console.error('Error creating channel:', error);
            if (error.message.includes('duplicate')) {
                res.status(409).json({
                    success: false,
                    message: 'Channel already exists'
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
     * Update channel
     */
    static async updateChannel(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Channel ID is required'
                });
                return;
            }
            const updateData = req.body;

            const channel = await channelService.updateChannel(id, updateData);

            if (!channel) {
                res.status(404).json({
                    success: false,
                    message: 'Channel not found'
                });
                return;
            }

            res.json({
                success: true,
                data: channel
            });
        } catch (error) {
            console.error('Error updating channel:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Delete channel
     */
    static async deleteChannel(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Channel ID is required'
                });
                return;
            }

            const deleted = await channelService.deleteChannel(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Channel not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Channel deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting channel:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Add member to channel
     */
    static async addMember(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Channel ID is required'
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

            const channel = await channelService.addMember(id, userId);

            if (!channel) {
                res.status(404).json({
                    success: false,
                    message: 'Channel not found'
                });
                return;
            }

            res.json({
                success: true,
                data: channel
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
     * Remove member from channel
     */
    static async removeMember(req: Request, res: Response): Promise<void> {
        try {
            const { id, userId } = req.params;
            if (!id || !userId) {
                res.status(400).json({
                    success: false,
                    message: 'Channel ID and User ID are required'
                });
                return;
            }

            const channel = await channelService.removeMember(id, userId);

            if (!channel) {
                res.status(404).json({
                    success: false,
                    message: 'Channel not found'
                });
                return;
            }

            res.json({
                success: true,
                data: channel
            });
        } catch (error) {
            console.error('Error removing member:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
