import { Request, Response } from 'express';
import { MessageReplyService } from '../services/message-reply.service';

export class MessageReplyController {
    private messageReplyService: MessageReplyService;

    constructor() {
        this.messageReplyService = new MessageReplyService();
    }

    /**
     * Create a reply to a message
     * POST /api/messages/:messageId/replies
     */
    createReply = async (req: Request, res: Response): Promise<void> => {
        try {
            const { messageId } = req.params;
            const { text, type, imageUrl, fileUrl, fileName, fileSize } = req.body;
            const userId = (req as any).user?.id;
            const username = (req as any).user?.username;
            const channelId = req.body.channelId;

            if (!messageId) {
                res.status(400).json({
                    success: false,
                    message: 'Message ID is required',
                    statusCode: 400
                });
                return;
            }

            if (!userId || !username) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                    statusCode: 401
                });
                return;
            }

            if (!text || !channelId) {
                res.status(400).json({
                    success: false,
                    message: 'Text and channelId are required',
                    statusCode: 400
                });
                return;
            }

            const result = await this.messageReplyService.createReply(
                messageId,
                channelId,
                userId,
                username,
                text,
                type || 'text',
                imageUrl,
                fileUrl,
                fileName,
                fileSize
            );

            res.status(result.statusCode).json(result);
        } catch (error) {
            console.error('Error in createReply controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                statusCode: 500
            });
        }
    };

    /**
     * Get all replies for a message
     * GET /api/messages/:messageId/replies
     */
    getMessageReplies = async (req: Request, res: Response): Promise<void> => {
        try {
            const { messageId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            if (!messageId) {
                res.status(400).json({
                    success: false,
                    message: 'Message ID is required',
                    statusCode: 400
                });
                return;
            }

            const result = await this.messageReplyService.getMessageReplies(messageId, page, limit);
            res.status(result.statusCode).json(result);
        } catch (error) {
            console.error('Error in getMessageReplies controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                statusCode: 500
            });
        }
    };

    /**
     * Get reply count for a message
     * GET /api/messages/:messageId/replies/count
     */
    getReplyCount = async (req: Request, res: Response): Promise<void> => {
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

            const result = await this.messageReplyService.getReplyCount(messageId);
            res.status(result.statusCode).json(result);
        } catch (error) {
            console.error('Error in getReplyCount controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                statusCode: 500
            });
        }
    };

    /**
     * Get replies for multiple messages
     * POST /api/messages/replies/batch
     */
    getMultipleMessageReplies = async (req: Request, res: Response): Promise<void> => {
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

            const result = await this.messageReplyService.getMultipleMessageReplies(messageIds);
            res.status(result.statusCode).json(result);
        } catch (error) {
            console.error('Error in getMultipleMessageReplies controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                statusCode: 500
            });
        }
    };

    /**
     * Delete a reply
     * DELETE /api/messages/replies/:replyId
     */
    deleteReply = async (req: Request, res: Response): Promise<void> => {
        try {
            const { replyId } = req.params;
            const userId = (req as any).user?.id;

            if (!replyId) {
                res.status(400).json({
                    success: false,
                    message: 'Reply ID is required',
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

            const result = await this.messageReplyService.deleteReply(replyId, userId);
            res.status(result.statusCode).json(result);
        } catch (error) {
            console.error('Error in deleteReply controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                statusCode: 500
            });
        }
    };
}
