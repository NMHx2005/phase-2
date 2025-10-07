import { Request, Response } from 'express';
import { MessageReactionService } from '../services/message-reaction.service';

export class MessageReactionController {
    private messageReactionService: MessageReactionService;

    constructor() {
        this.messageReactionService = new MessageReactionService();
    }

    /**
     * Add or update a reaction to a message
     * POST /api/messages/:messageId/reactions
     */
    addReaction = async (req: Request, res: Response): Promise<void> => {
        try {
            const { messageId } = req.params;
            const { reaction } = req.body;
            const userId = (req as any).user?.id;

            if (!messageId) {
                res.status(400).json({
                    success: false,
                    message: 'Message ID is required',
                    statusCode: 400
                });
                return;
            }

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                    statusCode: 401
                });
                return;
            }

            if (!reaction) {
                res.status(400).json({
                    success: false,
                    message: 'Reaction is required',
                    statusCode: 400
                });
                return;
            }

            const result = await this.messageReactionService.addReaction(messageId, userId, reaction);
            res.status(result.statusCode).json(result);
        } catch (error) {
            console.error('Error in addReaction controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                statusCode: 500
            });
        }
    };

    /**
     * Remove a reaction from a message
     * DELETE /api/messages/:messageId/reactions
     */
    removeReaction = async (req: Request, res: Response): Promise<void> => {
        try {
            const { messageId } = req.params;
            const userId = (req as any).user?.id;

            if (!messageId) {
                res.status(400).json({
                    success: false,
                    message: 'Message ID is required',
                    statusCode: 400
                });
                return;
            }

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                    statusCode: 401
                });
                return;
            }

            const result = await this.messageReactionService.removeReaction(messageId, userId);
            res.status(result.statusCode).json(result);
        } catch (error) {
            console.error('Error in removeReaction controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                statusCode: 500
            });
        }
    };

    /**
     * Get all reactions for a message
     * GET /api/messages/:messageId/reactions
     */
    getMessageReactions = async (req: Request, res: Response): Promise<void> => {
        try {
            const { messageId } = req.params;

            if (!messageId) {
                res.status(400).json({
                    success: false,
                    message: 'Message ID is required',
                    statusCode: 400
                });
                return;
            }

            const result = await this.messageReactionService.getMessageReactions(messageId);
            res.status(result.statusCode).json(result);
        } catch (error) {
            console.error('Error in getMessageReactions controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                statusCode: 500
            });
        }
    };

    /**
     * Get reactions for multiple messages
     * POST /api/messages/reactions/batch
     */
    getMultipleMessageReactions = async (req: Request, res: Response): Promise<void> => {
        try {
            const { messageIds } = req.body;

            if (!messageIds || !Array.isArray(messageIds)) {
                res.status(400).json({
                    success: false,
                    message: 'messageIds array is required',
                    statusCode: 400
                });
                return;
            }

            const result = await this.messageReactionService.getMultipleMessageReactions(messageIds);
            res.status(result.statusCode).json(result);
        } catch (error) {
            console.error('Error in getMultipleMessageReactions controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                statusCode: 500
            });
        }
    };

    /**
     * Check if user has reacted to a message
     * GET /api/messages/:messageId/reactions/check
     */
    checkUserReaction = async (req: Request, res: Response): Promise<void> => {
        try {
            const { messageId } = req.params;
            const userId = (req as any).user?.id;

            if (!messageId) {
                res.status(400).json({
                    success: false,
                    message: 'Message ID is required',
                    statusCode: 400
                });
                return;
            }

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                    statusCode: 401
                });
                return;
            }

            const result = await this.messageReactionService.hasUserReacted(messageId, userId);
            res.status(result.statusCode).json(result);
        } catch (error) {
            console.error('Error in checkUserReaction controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                statusCode: 500
            });
        }
    };
}
