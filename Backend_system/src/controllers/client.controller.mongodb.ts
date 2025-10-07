import { Request, Response } from 'express';
import { clientService } from '../services/client.service';

export class ClientController {
    /**
     * Get client profile
     */
    static async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const profile = await clientService.getProfile(userId);

            res.json({
                success: true,
                data: profile
            });
        } catch (error) {
            console.error('Error getting profile:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Update client profile
     */
    static async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const updateData = req.body;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const profile = await clientService.updateProfile(userId, updateData);

            res.json({
                success: true,
                data: profile
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get client groups
     */
    static async getGroups(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const groups = await clientService.getGroups(userId);

            res.json({
                success: true,
                data: groups
            });
        } catch (error) {
            console.error('Error getting groups:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get client channels
     */
    static async getChannels(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { groupId } = req.query;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const channels = await clientService.getChannels(userId, groupId as string);

            res.json({
                success: true,
                data: channels
            });
        } catch (error) {
            console.error('Error getting channels:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get client messages
     */
    static async getMessages(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { channelId, limit = 50, offset = 0 } = req.query;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            if (!channelId) {
                res.status(400).json({
                    success: false,
                    message: 'Channel ID is required'
                });
                return;
            }

            const messages = await clientService.getMessages(
                userId,
                channelId as string,
                parseInt(limit as string),
                parseInt(offset as string)
            );

            res.json({
                success: true,
                data: messages
            });
        } catch (error) {
            console.error('Error getting messages:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get client notifications
     */
    static async getNotifications(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { limit = 20, offset = 0 } = req.query;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const notifications = await clientService.getNotifications(
                userId,
                parseInt(limit as string),
                parseInt(offset as string)
            );

            res.json({
                success: true,
                data: notifications
            });
        } catch (error) {
            console.error('Error getting notifications:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Mark notification as read
     */
    static async markNotificationRead(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { notificationId } = req.params;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            if (!notificationId) {
                res.status(400).json({
                    success: false,
                    message: 'Notification ID is required'
                });
                return;
            }

            const notification = await clientService.markNotificationRead(userId, notificationId);

            if (!notification) {
                res.status(404).json({
                    success: false,
                    message: 'Notification not found'
                });
                return;
            }

            res.json({
                success: true,
                data: notification
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get client settings
     */
    static async getSettings(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const settings = await clientService.getSettings(userId);

            res.json({
                success: true,
                data: settings
            });
        } catch (error) {
            console.error('Error getting settings:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Update client settings
     */
    static async updateSettings(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const settingsData = req.body;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const settings = await clientService.updateSettings(userId, settingsData);

            res.json({
                success: true,
                data: settings
            });
        } catch (error) {
            console.error('Error updating settings:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
