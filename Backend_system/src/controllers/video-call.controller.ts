import { Request, Response } from 'express';
import { videoCallService } from '../services/video-call.service';
import { User } from '../models/user.model';

export class VideoCallController {
    /**
     * Get call history for a user
     */
    async getCallHistory(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const limit = parseInt(req.query.limit as string) || 50;

            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const callHistory = await videoCallService.getCallsByUser(userId);

            res.json({
                success: true,
                data: callHistory
            });
        } catch (error) {
            console.error('Error getting call history:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get call history'
            });
        }
    }

    /**
     * Get active calls for a user
     */
    async getActiveCalls(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const activeCalls = await videoCallService.getActiveCalls();

            res.json({
                success: true,
                data: activeCalls
            });
        } catch (error) {
            console.error('Error getting active calls:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get active calls'
            });
        }
    }

    /**
     * Get call statistics for a user
     */
    async getCallStats(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ success: false, message: 'User not authenticated' });
                return;
            }

            const stats = await videoCallService.getCallStats(userId);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error getting call stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get call statistics'
            });
        }
    }

    /**
     * Clean up expired calls (admin only)
     */
    async cleanupExpiredCalls(req: Request, res: Response): Promise<void> {
        try {
            const userRoles = (req as any).user?.roles || [];

            if (!userRoles.includes('admin')) {
                res.status(403).json({
                    success: false,
                    message: 'Admin access required'
                });
                return;
            }

            await videoCallService.cleanupExpiredCalls();

            res.json({
                success: true,
                message: 'Expired calls cleaned up successfully'
            });
        } catch (error) {
            console.error('Error cleaning up expired calls:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to clean up expired calls'
            });
        }
    }
}

export const videoCallController = new VideoCallController();
