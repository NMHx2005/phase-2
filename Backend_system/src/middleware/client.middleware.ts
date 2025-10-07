import { Request, Response, NextFunction } from 'express';

// Client middleware - ensures user can only access their own data
export const clientAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // This middleware runs after authMiddleware, so req.user should exist
        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
            return;
        }

        // For client routes, ensure user is accessing their own data
        const userId = req.params.userId || req.params.id;
        if (userId && userId !== req.user.id) {
            res.status(403).json({
                status: 'error',
                message: 'You can only access your own data'
            });
            return;
        }

        next();
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Authentication failed'
        });
    }
};

// Ensure user is a regular user (not admin)
export const requireRegularUser = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({
            status: 'error',
            message: 'Authentication required'
        });
        return;
    }

    // Check if user has admin roles
    const hasAdminRole = req.user.roles.some(role => ['super_admin', 'group_admin'].includes(role));

    if (hasAdminRole) {
        res.status(403).json({
            status: 'error',
            message: 'This endpoint is for regular users only'
        });
        return;
    }

    next();
};

// Ensure user is a member of the group they're trying to access
export const requireGroupMembership = (req: Request, res: Response, next: NextFunction): void => {
    const { groupId } = req.params;

    if (!req.user) {
        res.status(401).json({
            status: 'error',
            message: 'Authentication required'
        });
        return;
    }

    // This would need to be implemented with actual group membership check
    // For now, we'll allow access and let the controller handle the logic
    next();
};
