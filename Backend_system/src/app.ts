import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import apiRoutes from './routes';
import uploadRoutes from './routes/upload.routes';
import videoCallRoutes from './routes/video-call.routes';

export function createApp(): express.Application {
    const app = express();

    // Security middlewares
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // CORS configuration
    app.use(cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
    }));

    // Logging
    app.use(morgan('combined'));

    // Body parsing middlewares
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.use(cookieParser());

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).json({
            status: 'OK',
            message: 'Chat System Backend is running',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    });

    // API routes
    app.use('/api', apiRoutes);

    // Upload routes
    app.use('/api/upload', uploadRoutes);

    // Video call routes
    app.use('/api/video-calls', videoCallRoutes);

    // Serve static files from uploads directory
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // API info endpoint
    app.get('/api', (req: Request, res: Response) => {
        res.status(200).json({
            message: 'Chat System API',
            version: '1.0.0',
            endpoints: {
                health: '/health',
                auth: '/api/auth',
                users: '/api/users',
                groups: '/api/groups',
                groupRequests: '/api/group-requests',
                channels: '/api/channels',
                messages: '/api/messages',
                upload: '/api/upload',
                videoCalls: '/api/video-calls',
                static: '/uploads'
            }
        });
    });

    // 404 handler - catch all unmatched routes
    app.use((req: Request, res: Response) => {
        res.status(404).json({
            status: 'error',
            message: `Route ${req.originalUrl} not found on this server!`
        });
    });

    // Global error handler
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error('❌ Error:', err);

        res.status(500).json({
            status: 'error',
            message: process.env.NODE_ENV === 'production'
                ? 'Something went wrong!'
                : err.message,
            ...(process.env.NODE_ENV === 'development' && {
                stack: err.stack
            })
        });
    });

    return app;
}

// Export app instance for testing
export const app = createApp();