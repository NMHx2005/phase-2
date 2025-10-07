import express from 'express';
import { MessageReactionController } from '../controllers/message-reaction.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const messageReactionController = new MessageReactionController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route POST /api/messages/:messageId/reactions
 * @desc Add or update a reaction to a message
 * @access Private
 */
router.post('/:messageId/reactions', messageReactionController.addReaction);

/**
 * @route DELETE /api/messages/:messageId/reactions
 * @desc Remove a reaction from a message
 * @access Private
 */
router.delete('/:messageId/reactions', messageReactionController.removeReaction);

/**
 * @route GET /api/messages/:messageId/reactions
 * @desc Get all reactions for a message
 * @access Private
 */
router.get('/:messageId/reactions', messageReactionController.getMessageReactions);

/**
 * @route GET /api/messages/:messageId/reactions/check
 * @desc Check if user has reacted to a message
 * @access Private
 */
router.get('/:messageId/reactions/check', messageReactionController.checkUserReaction);

/**
 * @route POST /api/messages/reactions/batch
 * @desc Get reactions for multiple messages
 * @access Private
 */
router.post('/reactions/batch', messageReactionController.getMultipleMessageReactions);

export default router;
