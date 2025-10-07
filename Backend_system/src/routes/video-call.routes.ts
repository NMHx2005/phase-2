import { Router } from 'express';
import { videoCallController } from '../controllers/video-call.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminAuthMiddleware } from '../middleware/admin.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/video-calls/history
 * @desc Get call history for authenticated user
 * @access Private
 */
router.get('/history', videoCallController.getCallHistory.bind(videoCallController));

/**
 * @route GET /api/video-calls/active
 * @desc Get active calls for authenticated user
 * @access Private
 */
router.get('/active', videoCallController.getActiveCalls.bind(videoCallController));

/**
 * @route GET /api/video-calls/stats
 * @desc Get call statistics for authenticated user
 * @access Private
 */
router.get('/stats', videoCallController.getCallStats.bind(videoCallController));

/**
 * @route POST /api/video-calls/cleanup
 * @desc Clean up expired calls
 * @access Admin only
 */
router.post('/cleanup', adminAuthMiddleware, videoCallController.cleanupExpiredCalls.bind(videoCallController));

export default router;
