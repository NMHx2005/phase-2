import express from 'express';
import { MessageReplyController } from '../controllers/message-reply.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const messageReplyController = new MessageReplyController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route POST /api/messages/:messageId/replies
 * @desc Create a reply to a message
 * @access Private
 */
router.post('/:messageId/replies', messageReplyController.createReply);

/**
 * @route GET /api/messages/:messageId/replies
 * @desc Get all replies for a message
 * @access Private
 */
router.get('/:messageId/replies', messageReplyController.getMessageReplies);

/**
 * @route GET /api/messages/:messageId/replies/count
 * @desc Get reply count for a message
 * @access Private
 */
router.get('/:messageId/replies/count', messageReplyController.getReplyCount);

/**
 * @route POST /api/messages/replies/batch
 * @desc Get replies for multiple messages
 * @access Private
 */
router.post('/replies/batch', messageReplyController.getMultipleMessageReplies);

/**
 * @route DELETE /api/messages/replies/:replyId
 * @desc Delete a reply
 * @access Private
 */
router.delete('/replies/:replyId', messageReplyController.deleteReply);

export default router;
