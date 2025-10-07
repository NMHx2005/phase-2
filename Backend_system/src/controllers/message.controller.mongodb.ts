import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { messageService } from '../services/message.service';
import SocketServer from '../sockets/socket.server';

export class MessageController {
    /**
     * Get messages by channel
     */
    static async getMessagesByChannel(req: Request, res: Response): Promise<void> {
        try {
            const { channelId } = req.params;
            if (!channelId) {
                res.status(400).json({
                    success: false,
                    message: 'Channel ID is required'
                });
                return;
            }
            const { limit = 50, offset = 0 } = req.query;

            console.log('🔍 MessageController.getMessagesByChannel - Channel ID:', channelId);
            console.log('🔍 MessageController.getMessagesByChannel - Limit:', limit, 'Offset:', offset);

            const messages = await messageService.getMessagesByChannel(
                channelId,
                parseInt(limit as string),
                parseInt(offset as string)
            );

            console.log('🔍 MessageController.getMessagesByChannel - Found messages:', messages.length);

            res.json({
                success: true,
                data: messages
            });
        } catch (error) {
            console.error('Error getting messages by channel:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get messages by user
     */
    static async getMessagesByUser(req: Request, res: Response): Promise<void> {
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

            const messages = await messageService.getMessagesByUser(
                userId,
                parseInt(limit as string),
                parseInt(offset as string)
            );

            res.json({
                success: true,
                data: messages
            });
        } catch (error) {
            console.error('Error getting messages by user:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Search messages
     */
    static async searchMessages(req: Request, res: Response): Promise<void> {
        try {
            const { q, channelId, userId, limit = 50, offset = 0 } = req.query;

            if (!q) {
                res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
                return;
            }

            const messages = await messageService.searchMessages({
                query: q as string,
                channelId: channelId as string,
                userId: userId as string,
                limit: parseInt(limit as string),
                offset: parseInt(offset as string)
            });

            res.json({
                success: true,
                data: messages
            });
        } catch (error) {
            console.error('Error searching messages:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get message by ID
     */
    static async getMessageById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Message ID is required'
                });
                return;
            }
            const message = await messageService.getMessageById(id);

            if (!message) {
                res.status(404).json({
                    success: false,
                    message: 'Message not found'
                });
                return;
            }

            res.json({
                success: true,
                data: message
            });
        } catch (error) {
            console.error('Error getting message by ID:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Create message
     */
    static async createMessage(req: Request, res: Response): Promise<void> {
        try {
            const messageData = {
                ...req.body,
                channelId: new ObjectId(req.body.channelId),
                userId: new ObjectId(req.user?.id),
                username: req.user?.username
            };

            console.log('🔍 MessageController.createMessage - Message data:', messageData);

            const message = await messageService.createMessage(messageData);

            // Broadcast message to all connected users via Socket.IO
            const socketServer = SocketServer.getInstance();
            if (socketServer) {
                socketServer.broadcastMessage(req.body.channelId, message);
            }

            res.status(201).json({
                success: true,
                data: message
            });
        } catch (error: any) {
            console.error('Error creating message:', error);
            if (error.message.includes('validation')) {
                res.status(400).json({
                    success: false,
                    message: error.message
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
     * Update message
     */
    static async updateMessage(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Message ID is required'
                });
                return;
            }
            const updateData = req.body;

            // Check if user can update this message
            const existingMessage = await messageService.getMessageById(id);
            if (!existingMessage) {
                res.status(404).json({
                    success: false,
                    message: 'Message not found'
                });
                return;
            }

            if (existingMessage.userId !== req.user?.id) {
                res.status(403).json({
                    success: false,
                    message: 'You can only update your own messages'
                });
                return;
            }

            const message = await messageService.updateMessage(id, updateData);

            res.json({
                success: true,
                data: message
            });
        } catch (error) {
            console.error('Error updating message:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Delete message
     */
    static async deleteMessage(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Message ID is required'
                });
                return;
            }

            // Check if user can delete this message
            const existingMessage = await messageService.getMessageById(id);
            if (!existingMessage) {
                res.status(404).json({
                    success: false,
                    message: 'Message not found'
                });
                return;
            }

            if (existingMessage.userId !== req.user?.id) {
                res.status(403).json({
                    success: false,
                    message: 'You can only delete your own messages'
                });
                return;
            }

            const deleted = await messageService.deleteMessage(id);

            res.json({
                success: true,
                message: 'Message deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting message:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
