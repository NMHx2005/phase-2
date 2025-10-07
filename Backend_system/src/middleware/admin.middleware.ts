import { Request, Response, NextFunction } from 'express';

// Admin middleware - ensures user has admin privileges
export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
            return;
        }

        // Check if user has admin roles
        const hasAdminRole = req.user.roles.some(role => ['super_admin', 'group_admin'].includes(role));
        
        if (!hasAdminRole) {
            res.status(403).json({
                status: 'error',
                message: 'Admin privileges required'
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

// Super Admin middleware - ensures user is super admin
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({
            status: 'error',
            message: 'Authentication required'
        });
        return;
    }

    if (!req.user.roles.includes('super_admin')) {
        res.status(403).json({
            status: 'error',
            message: 'Super admin privileges required'
        });
        return;
    }

    next();
};

// Group Admin middleware - ensures user is group admin or super admin
export const requireGroupAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({
            status: 'error',
            message: 'Authentication required'
        });
        return;
    }

    const hasAdminRole = req.user.roles.some(role => ['super_admin', 'group_admin'].includes(role));
    
    if (!hasAdminRole) {
        res.status(403).json({
            status: 'error',
            message: 'Group admin privileges required'
        });
        return;
    }

    next();
};

// Ensure user is admin of specific group
export const requireGroupOwnership = (req: Request, res: Response, next: NextFunction): void => {
    const { groupId } = req.params;
    
    if (!req.user) {
        res.status(401).json({
            status: 'error',
            message: 'Authentication required'
        });
        return;
    }

    // Super admin can access any group
    if (req.user.roles.includes('super_admin')) {
        next();
        return;
    }

    // This would need to be implemented with actual group ownership check
    // For now, we'll allow access and let the controller handle the logic
    next();
};
