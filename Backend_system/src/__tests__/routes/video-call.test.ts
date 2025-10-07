import request from 'supertest';
import express from 'express';
import videoCallRoutes from '../../routes/video-call.routes';
import { videoCallController } from '../../controllers/video-call.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { adminAuthMiddleware } from '../../middleware/admin.middleware';
import {
    createTestUser,
    createSuperAdminUser,
    createTestVideoCall,
    createAuthenticatedRequest,
    createSuperAdminRequest,
    expectSuccessResponse,
    expectUnauthorizedError,
    expectForbiddenError,
    expectNotFoundError,
    generateTestUsers
} from '../utils/test-helpers';

// Mock the controllers and middleware
jest.mock('../../controllers/video-call.controller');
jest.mock('../../middleware/auth.middleware');
jest.mock('../../middleware/admin.middleware');

const MockedVideoCallController = videoCallController as jest.Mocked<typeof videoCallController>;
const mockAuthMiddleware = authMiddleware as jest.MockedFunction<typeof authMiddleware>;
const mockAdminAuthMiddleware = adminAuthMiddleware as jest.MockedFunction<typeof adminAuthMiddleware>;

describe('Video Call Routes', () => {
    let app: express.Application;
    let testUser: any;
    let superAdminUser: any;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/video-calls', videoCallRoutes);

        // Reset mocks
        jest.clearAllMocks();

        // Create test users
        testUser = createTestUser();
        superAdminUser = createSuperAdminUser();

        // Mock middleware to pass authentication
        mockAuthMiddleware.mockImplementation((req, res, next) => {
            req.user = { id: testUser._id.toString(), username: testUser.username, email: testUser.email, roles: testUser.roles };
            next();
        });

        mockAdminAuthMiddleware.mockImplementation((req, res, next) => {
            if (req.user?.roles?.includes('super_admin')) {
                next();
            } else {
                res.status(403).json({ success: false, message: 'Admin access required' });
            }
        });
    });

    describe('GET /video-calls/history', () => {
        it('should return call history for authenticated user', async () => {
            const mockCallHistory = [
                createTestVideoCall({
                    callerId: testUser._id,
                    callerName: testUser.username,
                    status: 'ended',
                    duration: 300
                }),
                createTestVideoCall({
                    receiverId: testUser._id,
                    receiverName: testUser.username,
                    status: 'ended',
                    duration: 180
                })
            ];

            const mockResponse = {
                calls: mockCallHistory,
                total: 2,
                page: 1,
                limit: 10
            };

            MockedVideoCallController.getCallHistory.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockResponse });
            });

            const response = await request(app)
                .get('/video-calls/history')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.calls).toBeDefined();
            expect(response.body.data.calls.length).toBe(2);
            expect(response.body.data.total).toBe(2);
            expect(MockedVideoCallController.getCallHistory).toHaveBeenCalled();
        });

        it('should handle pagination parameters', async () => {
            MockedVideoCallController.getCallHistory.mockImplementation(async (req, res) => {
                const { page = 1, limit = 10 } = req.query;
                res.status(200).json({
                    success: true,
                    data: {
                        calls: [],
                        total: 0,
                        page: parseInt(page as string),
                        limit: parseInt(limit as string)
                    }
                });
            });

            const response = await request(app)
                .get('/video-calls/history?page=2&limit=5')
                .expect(200);

            expect(response.body.data.page).toBe(2);
            expect(response.body.data.limit).toBe(5);
        });

        it('should filter by date range', async () => {
            MockedVideoCallController.getCallHistory.mockImplementation(async (req, res) => {
                const { startDate, endDate } = req.query;
                res.status(200).json({
                    success: true,
                    data: {
                        calls: [],
                        total: 0,
                        page: 1,
                        limit: 10,
                        startDate,
                        endDate
                    }
                });
            });

            const response = await request(app)
                .get('/video-calls/history?startDate=2023-01-01&endDate=2023-12-31')
                .expect(200);

            expect(response.body.data.startDate).toBe('2023-01-01');
            expect(response.body.data.endDate).toBe('2023-12-31');
        });

        it('should handle empty call history', async () => {
            MockedVideoCallController.getCallHistory.mockImplementation(async (req, res) => {
                res.status(200).json({
                    success: true,
                    data: {
                        calls: [],
                        total: 0,
                        page: 1,
                        limit: 10
                    }
                });
            });

            const response = await request(app)
                .get('/video-calls/history')
                .expect(200);

            expect(response.body.data.calls).toEqual([]);
            expect(response.body.data.total).toBe(0);
        });
    });

    describe('GET /video-calls/active', () => {
        it('should return active calls for authenticated user', async () => {
            const mockActiveCalls = [
                createTestVideoCall({
                    callerId: testUser._id,
                    callerName: testUser.username,
                    status: 'initiated'
                }),
                createTestVideoCall({
                    receiverId: testUser._id,
                    receiverName: testUser.username,
                    status: 'answered'
                })
            ];

            MockedVideoCallController.getActiveCalls.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockActiveCalls });
            });

            const response = await request(app)
                .get('/video-calls/active')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.length).toBe(2);
            expect(MockedVideoCallController.getActiveCalls).toHaveBeenCalled();
        });

        it('should handle no active calls', async () => {
            MockedVideoCallController.getActiveCalls.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: [] });
            });

            const response = await request(app)
                .get('/video-calls/active')
                .expect(200);

            expect(response.body.data).toEqual([]);
        });
    });

    describe('GET /video-calls/stats', () => {
        it('should return call statistics for authenticated user', async () => {
            const mockStats = {
                totalCalls: 25,
                totalDuration: 7200, // 2 hours in seconds
                averageDuration: 288, // 4.8 minutes
                callsThisMonth: 8,
                callsThisWeek: 3,
                callsToday: 1,
                mostFrequentContact: 'john_doe',
                longestCall: 1800, // 30 minutes
                shortestCall: 30 // 30 seconds
            };

            MockedVideoCallController.getCallStats.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockStats });
            });

            const response = await request(app)
                .get('/video-calls/stats')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                data: mockStats
            });
            expect(MockedVideoCallController.getCallStats).toHaveBeenCalled();
        });

        it('should filter stats by date range', async () => {
            MockedVideoCallController.getCallStats.mockImplementation(async (req, res) => {
                const { period } = req.query;
                res.status(200).json({
                    success: true,
                    data: {
                        totalCalls: 0,
                        period
                    }
                });
            });

            const response = await request(app)
                .get('/video-calls/stats?period=month')
                .expect(200);

            expect(response.body.data.period).toBe('month');
        });
    });

    describe('POST /video-calls/cleanup', () => {
        it('should cleanup expired calls for admin', async () => {
            const cleanupResult = {
                expiredCallsRemoved: 15,
                totalCallsCleaned: 15,
                cleanupTime: new Date()
            };

            // Mock super admin authentication
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: superAdminUser._id.toString(), username: superAdminUser.username, email: superAdminUser.email, roles: superAdminUser.roles };
                next();
            });

            MockedVideoCallController.cleanupExpiredCalls.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: cleanupResult });
            });

            const response = await request(app)
                .post('/video-calls/cleanup')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.expiredCallsRemoved).toBe(15);
            expect(response.body.data.totalCallsCleaned).toBe(15);
            expect(MockedVideoCallController.cleanupExpiredCalls).toHaveBeenCalled();
        });

        it('should require admin access', async () => {
            const response = await request(app)
                .post('/video-calls/cleanup')
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Admin access required');
        });

        it('should handle cleanup errors', async () => {
            // Mock super admin authentication
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: superAdminUser._id.toString(), username: superAdminUser.username, email: superAdminUser.email, roles: superAdminUser.roles };
                next();
            });

            MockedVideoCallController.cleanupExpiredCalls.mockImplementation(async (req, res) => {
                res.status(500).json({
                    success: false,
                    message: 'Failed to cleanup expired calls'
                });
            });

            const response = await request(app)
                .post('/video-calls/cleanup')
                .expect(500);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Authentication', () => {
        it('should require authentication for all routes', async () => {
            // Mock middleware to simulate no authentication
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                res.status(401).json({ success: false, message: 'Unauthorized' });
            });

            const routes = [
                { method: 'get', path: '/video-calls/history' },
                { method: 'get', path: '/video-calls/active' },
                { method: 'get', path: '/video-calls/stats' },
                { method: 'post', path: '/video-calls/cleanup' }
            ];

            for (const route of routes) {
                const response = await (request(app) as any)[route.method](route.path).expect(401);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toBe('Unauthorized');
            }
        });
    });

    describe('Authorization', () => {
        it('should require admin access for cleanup route', async () => {
            const response = await request(app)
                .post('/video-calls/cleanup')
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Admin access required');
        });
    });

    describe('Error Handling', () => {
        it('should handle controller errors gracefully', async () => {
            MockedVideoCallController.getCallHistory.mockImplementation(async (req, res) => {
                res.status(500).json({
                    success: false,
                    message: 'Database connection failed'
                });
            });

            const response = await request(app)
                .get('/video-calls/history')
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBeDefined();
        });

        it('should handle invalid query parameters', async () => {
            MockedVideoCallController.getCallHistory.mockImplementation(async (req, res) => {
                res.status(400).json({
                    success: false,
                    message: 'Invalid date format'
                });
            });

            const response = await request(app)
                .get('/video-calls/history?startDate=invalid-date')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Data Validation', () => {
        it('should validate pagination parameters', async () => {
            MockedVideoCallController.getCallHistory.mockImplementation(async (req, res) => {
                const { page, limit } = req.query;

                if (page && (isNaN(parseInt(page as string)) || parseInt(page as string) < 1)) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid page number'
                    });
                } else if (limit && (isNaN(parseInt(limit as string)) || parseInt(limit as string) < 1 || parseInt(limit as string) > 100)) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid limit (must be between 1 and 100)'
                    });
                } else {
                    res.status(200).json({
                        success: true,
                        data: { calls: [], total: 0, page: 1, limit: 10 }
                    });
                }
            });

            const response = await request(app)
                .get('/video-calls/history?page=0')
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should validate date range parameters', async () => {
            MockedVideoCallController.getCallHistory.mockImplementation(async (req, res) => {
                const { startDate, endDate } = req.query;

                if (startDate && endDate && new Date(startDate as string) > new Date(endDate as string)) {
                    res.status(400).json({
                        success: false,
                        message: 'Start date cannot be after end date'
                    });
                } else {
                    res.status(200).json({
                        success: true,
                        data: { calls: [], total: 0, page: 1, limit: 10 }
                    });
                }
            });

            const response = await request(app)
                .get('/video-calls/history?startDate=2023-12-31&endDate=2023-01-01')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Performance', () => {
        it('should handle large call history efficiently', async () => {
            const largeCallHistory = Array.from({ length: 1000 }, (_, index) =>
                createTestVideoCall({
                    _id: new (require('mongodb').ObjectId)(),
                    callerId: testUser._id,
                    status: 'ended',
                    duration: Math.floor(Math.random() * 3600)
                })
            );

            MockedVideoCallController.getCallHistory.mockImplementation(async (req, res) => {
                res.status(200).json({
                    success: true,
                    data: {
                        calls: largeCallHistory.slice(0, 10), // Return only first 10
                        total: largeCallHistory.length,
                        page: 1,
                        limit: 10
                    }
                });
            });

            const response = await request(app)
                .get('/video-calls/history?limit=10')
                .expect(200);

            expect(response.body.data.calls.length).toBe(10);
            expect(response.body.data.total).toBe(1000);
        });
    });
});
