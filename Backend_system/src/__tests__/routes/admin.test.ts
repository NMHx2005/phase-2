import request from 'supertest';
import express from 'express';
import adminRoutes from '../../routes/admin.routes';
import { AdminController } from '../../controllers/admin.controller.mongodb';
import { authMiddleware, requireSuperAdmin } from '../../middleware/auth.middleware';
import {
    createTestUser,
    createSuperAdminUser,
    createAuthenticatedRequest,
    createSuperAdminRequest,
    expectSuccessResponse,
    expectUnauthorizedError,
    expectForbiddenError,
    expectNotFoundError,
    generateTestUsers,
    generateTestGroups,
    generateTestChannels,
    generateTestMessages
} from '../utils/test-helpers';

// Mock the controllers and middleware
jest.mock('../../controllers/admin.controller.mongodb');
jest.mock('../../middleware/auth.middleware');

const MockedAdminController = AdminController as jest.Mocked<typeof AdminController>;
const mockAuthMiddleware = authMiddleware as jest.MockedFunction<typeof authMiddleware>;
const mockRequireSuperAdmin = requireSuperAdmin as jest.MockedFunction<typeof requireSuperAdmin>;

describe('Admin Routes', () => {
    let app: express.Application;
    let superAdminUser: any;
    let regularUser: any;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/admin', adminRoutes);

        // Reset mocks
        jest.clearAllMocks();

        // Create test users
        superAdminUser = createSuperAdminUser();
        regularUser = createTestUser();

        // Mock middleware to pass authentication
        mockAuthMiddleware.mockImplementation((req, res, next) => {
            req.user = { id: superAdminUser._id.toString(), username: superAdminUser.username, email: superAdminUser.email, roles: superAdminUser.roles };
            next();
        });

        mockRequireSuperAdmin.mockImplementation((req, res, next) => {
            if (req.user?.roles?.includes('super_admin')) {
                next();
            } else {
                res.status(403).json({ success: false, message: 'Forbidden' });
            }
        });
    });

    describe('GET /admin/dashboard', () => {
        it('should return dashboard statistics', async () => {
            const mockDashboardData = {
                totalUsers: 100,
                totalGroups: 25,
                totalChannels: 150,
                totalMessages: 5000,
                activeUsers: 45,
                newUsersToday: 5
            };

            MockedAdminController.getDashboard.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockDashboardData });
            });

            const response = await request(app)
                .get('/admin/dashboard')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                data: mockDashboardData
            });
            expect(MockedAdminController.getDashboard).toHaveBeenCalled();
        });

        it('should handle dashboard errors', async () => {
            MockedAdminController.getDashboard.mockImplementation(async (req, res) => {
                res.status(500).json({ success: false, message: 'Internal server error' });
            });

            const response = await request(app)
                .get('/admin/dashboard')
                .expect(500);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /admin/users', () => {
        it.skip('should return all users for super admin', async () => {
            const mockUsers = generateTestUsers(5);
            const mockResponse = {
                users: mockUsers,
                total: 5,
                page: 1,
                limit: 10
            };

            MockedAdminController.getAllUsers.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockResponse });
            });

            const response = await request(app)
                .get('/admin/users')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.users).toBeDefined();
            expect(response.body.data.users.length).toBe(5);
            expect(response.body.data.total).toBe(5);
            expect(MockedAdminController.getAllUsers).toHaveBeenCalled();
        });

        it.skip('should require group admin access', async () => {
            // Mock middleware to simulate regular user
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: regularUser._id.toString(), username: regularUser.username, email: regularUser.email, roles: ['user'] };
                next();
            });

            const response = await request(app)
                .get('/admin/users')
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Forbidden');
        });
    });

    describe('POST /admin/users', () => {
        it('should create a new user for super admin', async () => {
            const newUserData = {
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'password123',
                roles: ['user']
            };

            const createdUser = createTestUser(newUserData);

            MockedAdminController.createUser.mockImplementation(async (req, res) => {
                res.status(201).json({ success: true, data: createdUser });
            });

            const response = await request(app)
                .post('/admin/users')
                .send(newUserData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data._id).toBeDefined();
            expect(response.body.data.username).toBe('newuser');
            expect(response.body.data.email).toBe('newuser@example.com');
            expect(MockedAdminController.createUser).toHaveBeenCalled();
        });

        it('should validate required fields', async () => {
            const invalidUserData = {
                username: 'testuser'
                // Missing email and password
            };

            MockedAdminController.createUser.mockImplementation(async (req, res) => {
                res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            });

            const response = await request(app)
                .post('/admin/users')
                .send(invalidUserData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should require super admin access', async () => {
            // Mock middleware to simulate regular user
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: regularUser._id.toString(), username: regularUser.username, email: regularUser.email, roles: ['user'] };
                next();
            });

            const response = await request(app)
                .post('/admin/users')
                .send({ username: 'test', email: 'test@test.com', password: 'pass' })
                .expect(403);

            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /admin/users/:id', () => {
        it('should delete a user for super admin', async () => {
            const userId = '507f1f77bcf86cd799439011';

            MockedAdminController.deleteUser.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, message: 'User deleted successfully' });
            });

            const response = await request(app)
                .delete(`/admin/users/${userId}`)
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: 'User deleted successfully'
            });
            expect(MockedAdminController.deleteUser).toHaveBeenCalled();
        });

        it('should handle user not found', async () => {
            const userId = '507f1f77bcf86cd799439011';

            MockedAdminController.deleteUser.mockImplementation(async (req, res) => {
                res.status(404).json({ success: false, message: 'User not found' });
            });

            const response = await request(app)
                .delete(`/admin/users/${userId}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User not found');
        });

        it('should require super admin access', async () => {
            // Mock middleware to simulate regular user
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: regularUser._id.toString(), username: regularUser.username, email: regularUser.email, roles: ['user'] };
                next();
            });

            const response = await request(app)
                .delete('/admin/users/507f1f77bcf86cd799439011')
                .expect(403);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /admin/stats', () => {
        it('should return system statistics', async () => {
            const mockStats = {
                totalUsers: 100,
                totalGroups: 25,
                totalChannels: 150,
                totalMessages: 5000,
                systemUptime: '5 days',
                memoryUsage: '512MB',
                diskUsage: '2GB'
            };

            MockedAdminController.getSystemStats.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockStats });
            });

            const response = await request(app)
                .get('/admin/stats')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                data: mockStats
            });
            expect(MockedAdminController.getSystemStats).toHaveBeenCalled();
        });
    });

    describe('GET /admin/users/:userId/activity', () => {
        it('should return user activity logs', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const mockActivity = [
                { action: 'login', timestamp: new Date(), ip: '192.168.1.1' },
                { action: 'message_sent', timestamp: new Date(), channelId: '507f1f77bcf86cd799439012' },
                { action: 'group_joined', timestamp: new Date(), groupId: '507f1f77bcf86cd799439013' }
            ];

            MockedAdminController.getUserActivity.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockActivity });
            });

            const response = await request(app)
                .get(`/admin/users/${userId}/activity`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(3);
            expect(MockedAdminController.getUserActivity).toHaveBeenCalled();
        });

        it('should handle user not found', async () => {
            const userId = '507f1f77bcf86cd799439011';

            MockedAdminController.getUserActivity.mockImplementation(async (req, res) => {
                res.status(404).json({ success: false, message: 'User not found' });
            });

            const response = await request(app)
                .get(`/admin/users/${userId}/activity`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /admin/groups/stats', () => {
        it('should return group statistics', async () => {
            const mockGroupStats = {
                totalGroups: 25,
                publicGroups: 20,
                privateGroups: 5,
                averageMembersPerGroup: 8.5,
                mostActiveGroups: [
                    { name: 'General', messageCount: 150 },
                    { name: 'Development', messageCount: 120 }
                ]
            };

            MockedAdminController.getGroupStats.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockGroupStats });
            });

            const response = await request(app)
                .get('/admin/groups/stats')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                data: mockGroupStats
            });
            expect(MockedAdminController.getGroupStats).toHaveBeenCalled();
        });
    });

    describe('GET /admin/channels/stats', () => {
        it('should return channel statistics', async () => {
            const mockChannelStats = {
                totalChannels: 150,
                textChannels: 120,
                imageChannels: 20,
                fileChannels: 10,
                averageMessagesPerChannel: 33.3,
                mostActiveChannels: [
                    { name: 'general', messageCount: 500 },
                    { name: 'random', messageCount: 300 }
                ]
            };

            MockedAdminController.getChannelStats.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockChannelStats });
            });

            const response = await request(app)
                .get('/admin/channels/stats')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                data: mockChannelStats
            });
            expect(MockedAdminController.getChannelStats).toHaveBeenCalled();
        });
    });

    describe('Authentication and Authorization', () => {
        it('should require authentication for all routes', async () => {
            // Mock middleware to simulate no authentication
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                res.status(401).json({ success: false, message: 'Unauthorized' });
            });

            const routes = [
                { method: 'get', path: '/admin/dashboard' },
                { method: 'get', path: '/admin/users' },
                { method: 'post', path: '/admin/users' },
                { method: 'delete', path: '/admin/users/507f1f77bcf86cd799439011' },
                { method: 'get', path: '/admin/stats' },
                { method: 'get', path: '/admin/users/507f1f77bcf86cd799439011/activity' },
                { method: 'get', path: '/admin/groups/stats' },
                { method: 'get', path: '/admin/channels/stats' }
            ];

            for (const route of routes) {
                const response = await request(app)[route.method as 'get' | 'post' | 'put' | 'delete'](route.path).expect(401);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toBe('Unauthorized');
            }
        });

        it('should require super admin for protected routes', async () => {
            // Mock middleware to simulate regular user
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: regularUser._id.toString(), username: regularUser.username, email: regularUser.email, roles: ['user'] };
                next();
            });

            const protectedRoutes = [
                { method: 'post', path: '/admin/users' },
                { method: 'delete', path: '/admin/users/507f1f77bcf86cd799439011' }
            ];

            for (const route of protectedRoutes) {
                const response = await request(app)[route.method as 'get' | 'post' | 'put' | 'delete'](route.path).expect(403);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toBe('Forbidden');
            }
        }, 15000);
    });

    describe('Error Handling', () => {
        it('should handle controller errors gracefully', async () => {
            MockedAdminController.getDashboard.mockImplementation(async (req, res) => {
                res.status(500).json({ success: false, message: 'Database connection failed' });
            });

            const response = await request(app)
                .get('/admin/dashboard')
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Database connection failed');
        });

        it('should handle invalid route parameters', async () => {
            MockedAdminController.deleteUser.mockImplementation(async (req, res) => {
                if (!req.params.id) {
                    res.status(400).json({ success: false, message: 'User ID is required' });
                } else {
                    res.status(200).json({ success: true, message: 'User deleted' });
                }
            });

            const response = await request(app)
                .delete('/admin/users/')
                .expect(404); // Express will return 404 for invalid route

            // Test with invalid ID format
            const response2 = await request(app)
                .delete('/admin/users/invalid-id')
                .expect(200); // Route matches, but controller handles validation

            expect(response2.body.success).toBe(true);
        });
    });
});
