import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username: string;
                email: string;
                roles: string[];
            };
        }
    }
}

export interface JWTPayload {
    userId: string;
    username: string;
    email: string;
    roles: string[];
    iat: number;
    exp: number;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') ||
            req.cookies?.accessToken;

        if (!token) {
            res.status(401).json({
                status: 'error',
                message: 'Access token required'
            });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;

        req.user = {
            id: decoded.userId,
            username: decoded.username,
            email: decoded.email,
            roles: decoded.roles
        };

        next();
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Invalid or expired token'
        });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
            return;
        }

        const hasRequiredRole = req.user.roles.some(role => roles.includes(role));

        if (!hasRequiredRole) {
            res.status(403).json({
                status: 'error',
                message: 'Insufficient permissions'
            });
            return;
        }

        next();
    };
};

export const requireSuperAdmin = requireRole(['super_admin']);
export const requireGroupAdmin = requireRole(['super_admin', 'group_admin']);
export const requireUser = requireRole(['super_admin', 'group_admin', 'user']);
