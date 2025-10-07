import request from 'supertest';
import express from 'express';
import clientRoutes from '../../routes/client.routes';
import { ClientController } from '../../controllers/client.controller.mongodb';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
    createTestUser,
    createTestGroup,
    createTestChannel,
    createTestMessage,
    createAuthenticatedRequest,
    expectSuccessResponse,
    expectUnauthorizedError,
    expectNotFoundError,
    generateTestUsers,
    generateTestGroups,
    generateTestChannels,
    generateTestMessages
} from '../utils/test-helpers';

// Mock the controllers and middleware
jest.mock('../../controllers/client.controller.mongodb');
jest.mock('../../middleware/auth.middleware');

const MockedClientController = ClientController as jest.Mocked<typeof ClientController>;
const mockAuthMiddleware = authMiddleware as jest.MockedFunction<typeof authMiddleware>;

describe('Client Routes', () => {
    let app: express.Application;
    let testUser: any;
    let testGroup: any;
    let testChannel: any;
    let testMessage: any;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/client', clientRoutes);

        // Reset mocks
        jest.clearAllMocks();

        // Create test data
        testUser = createTestUser();
        testGroup = createTestGroup({
            createdBy: testUser._id,
            members: [testUser._id]
        });
        testChannel = createTestChannel({
            groupId: testGroup._id,
            createdBy: testUser._id,
            members: [testUser._id]
        });
        testMessage = createTestMessage({
            channelId: testChannel._id,
            userId: testUser._id
        });

        // Mock middleware to pass authentication
        mockAuthMiddleware.mockImplementation((req, res, next) => {
            req.user = { id: testUser._id.toString(), username: testUser.username, email: testUser.email, roles: testUser.roles };
            next();
        });
    });

    describe('GET /client/profile', () => {
        it('should return client profile', async () => {
            const mockProfile = {
                _id: testUser._id.toString(),
                username: testUser.username,
                email: testUser.email,
                avatar: null,
                roles: testUser.roles,
                isActive: testUser.isActive,
                createdAt: testUser.createdAt,
                updatedAt: testUser.updatedAt,
                preferences: {
                    theme: 'light',
                    notifications: true,
                    language: 'en'
                }
            };

            MockedClientController.getProfile.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockProfile });
            });

            const response = await request(app)
                .get('/client/profile')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data._id).toBeDefined();
            expect(response.body.data.username).toBe('testuser');
            expect(response.body.data.email).toBe('test@example.com');
            expect(MockedClientController.getProfile).toHaveBeenCalled();
        });

        it('should handle profile not found', async () => {
            MockedClientController.getProfile.mockImplementation(async (req, res) => {
                res.status(404).json({ success: false, message: 'Profile not found' });
            });

            const response = await request(app)
                .get('/client/profile')
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /client/profile', () => {
        it('should update client profile', async () => {
            const updateData = {
                username: 'updated-username',
                email: 'updated@example.com',
                avatar: 'avatar-url'
            };

            const updatedProfile = { ...testUser, ...updateData };

            MockedClientController.updateProfile.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: updatedProfile });
            });

            const response = await request(app)
                .put('/client/profile')
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data._id).toBeDefined();
            expect(response.body.data.username).toBe('updated-username');
            expect(response.body.data.email).toBe('updated@example.com');
            expect(MockedClientController.updateProfile).toHaveBeenCalled();
        });

        it('should validate update data', async () => {
            const invalidData = {
                email: 'invalid-email'
            };

            MockedClientController.updateProfile.mockImplementation(async (req, res) => {
                res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            });

            const response = await request(app)
                .put('/client/profile')
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should handle duplicate username', async () => {
            const updateData = {
                username: 'existing-username'
            };

            MockedClientController.updateProfile.mockImplementation(async (req, res) => {
                res.status(409).json({
                    success: false,
                    message: 'Username already exists'
                });
            });

            const response = await request(app)
                .put('/client/profile')
                .send(updateData)
                .expect(409);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /client/groups', () => {
        it('should return client groups', async () => {
            const mockGroups = generateTestGroups(3, testUser._id);
            const mockResponse = {
                groups: mockGroups,
                total: 3,
                page: 1,
                limit: 10
            };

            MockedClientController.getGroups.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockResponse });
            });

            const response = await request(app)
                .get('/client/groups')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.groups).toBeDefined();
            expect(response.body.data.groups.length).toBe(3);
            expect(response.body.data.total).toBe(3);
            expect(MockedClientController.getGroups).toHaveBeenCalled();
        });

        it('should handle pagination', async () => {
            MockedClientController.getGroups.mockImplementation(async (req, res) => {
                const { page = 1, limit = 10 } = req.query;
                res.status(200).json({
                    success: true,
                    data: {
                        groups: [],
                        total: 0,
                        page: parseInt(page as string),
                        limit: parseInt(limit as string)
                    }
                });
            });

            const response = await request(app)
                .get('/client/groups?page=2&limit=5')
                .expect(200);

            expect(response.body.data.page).toBe(2);
            expect(response.body.data.limit).toBe(5);
        });
    });

    describe('GET /client/channels', () => {
        it('should return client channels', async () => {
            const mockChannels = generateTestChannels(5, testGroup._id, testUser._id);
            const mockResponse = {
                channels: mockChannels,
                total: 5,
                page: 1,
                limit: 10
            };

            MockedClientController.getChannels.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockResponse });
            });

            const response = await request(app)
                .get('/client/channels')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.channels).toBeDefined();
            expect(response.body.data.channels.length).toBe(5);
            expect(response.body.data.total).toBe(5);
            expect(MockedClientController.getChannels).toHaveBeenCalled();
        });

        it('should filter channels by group', async () => {
            MockedClientController.getChannels.mockImplementation(async (req, res) => {
                const { groupId } = req.query;
                res.status(200).json({
                    success: true,
                    data: {
                        channels: [],
                        total: 0,
                        page: 1,
                        limit: 10,
                        groupId
                    }
                });
            });

            const response = await request(app)
                .get('/client/channels?groupId=507f1f77bcf86cd799439011')
                .expect(200);

            expect(response.body.data.groupId).toBe('507f1f77bcf86cd799439011');
        });
    });

    describe('GET /client/messages', () => {
        it('should return client messages', async () => {
            const mockMessages = generateTestMessages(10, testChannel._id, testUser._id);
            const mockResponse = {
                messages: mockMessages,
                total: 10,
                page: 1,
                limit: 10
            };

            MockedClientController.getMessages.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockResponse });
            });

            const response = await request(app)
                .get('/client/messages')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.messages).toBeDefined();
            expect(response.body.data.messages.length).toBe(10);
            expect(response.body.data.total).toBe(10);
            expect(MockedClientController.getMessages).toHaveBeenCalled();
        });

        it('should filter messages by channel', async () => {
            MockedClientController.getMessages.mockImplementation(async (req, res) => {
                const { channelId } = req.query;
                res.status(200).json({
                    success: true,
                    data: {
                        messages: [],
                        total: 0,
                        page: 1,
                        limit: 10,
                        channelId
                    }
                });
            });

            const response = await request(app)
                .get('/client/messages?channelId=507f1f77bcf86cd799439011')
                .expect(200);

            expect(response.body.data.channelId).toBe('507f1f77bcf86cd799439011');
        });

        it('should search messages', async () => {
            MockedClientController.getMessages.mockImplementation(async (req, res) => {
                const { search } = req.query;
                res.status(200).json({
                    success: true,
                    data: {
                        messages: [],
                        total: 0,
                        page: 1,
                        limit: 10,
                        search
                    }
                });
            });

            const response = await request(app)
                .get('/client/messages?search=test')
                .expect(200);

            expect(response.body.data.search).toBe('test');
        });
    });

    describe('GET /client/notifications', () => {
        it('should return client notifications', async () => {
            const mockNotifications = [
                {
                    _id: '507f1f77bcf86cd799439011',
                    type: 'message',
                    title: 'New message',
                    message: 'You have a new message',
                    isRead: false,
                    createdAt: new Date()
                },
                {
                    _id: '507f1f77bcf86cd799439012',
                    type: 'group_invite',
                    title: 'Group invitation',
                    message: 'You have been invited to a group',
                    isRead: true,
                    createdAt: new Date()
                }
            ];

            MockedClientController.getNotifications.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockNotifications });
            });

            const response = await request(app)
                .get('/client/notifications')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.length).toBe(2);
            expect(MockedClientController.getNotifications).toHaveBeenCalled();
        });

        it('should filter unread notifications', async () => {
            MockedClientController.getNotifications.mockImplementation(async (req, res) => {
                const { unread } = req.query;
                res.status(200).json({
                    success: true,
                    data: [],
                    unread: unread === 'true'
                });
            });

            const response = await request(app)
                .get('/client/notifications?unread=true')
                .expect(200);

            expect(response.body.data.length).toBe(0);
        });
    });

    describe('PUT /client/notifications/:notificationId/read', () => {
        it('should mark notification as read', async () => {
            const notificationId = '507f1f77bcf86cd799439011';

            MockedClientController.markNotificationRead.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, message: 'Notification marked as read' });
            });

            const response = await request(app)
                .put(`/client/notifications/${notificationId}/read`)
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: 'Notification marked as read'
            });
            expect(MockedClientController.markNotificationRead).toHaveBeenCalled();
        });

        it('should handle notification not found', async () => {
            MockedClientController.markNotificationRead.mockImplementation(async (req, res) => {
                res.status(404).json({ success: false, message: 'Notification not found' });
            });

            const response = await request(app)
                .put('/client/notifications/507f1f77bcf86cd799439011/read')
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should validate notification ID', async () => {
            MockedClientController.markNotificationRead.mockImplementation(async (req, res) => {
                res.status(400).json({
                    success: false,
                    message: 'Notification ID is required'
                });
            });

            const response = await request(app)
                .put('/client/notifications/invalid-id/read')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /client/settings', () => {
        it('should return client settings', async () => {
            const mockSettings = {
                theme: 'light',
                notifications: {
                    email: true,
                    push: false,
                    desktop: true
                },
                privacy: {
                    showOnlineStatus: true,
                    allowDirectMessages: true
                },
                language: 'en',
                timezone: 'UTC'
            };

            MockedClientController.getSettings.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockSettings });
            });

            const response = await request(app)
                .get('/client/settings')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                data: mockSettings
            });
            expect(MockedClientController.getSettings).toHaveBeenCalled();
        });
    });

    describe('PUT /client/settings', () => {
        it('should update client settings', async () => {
            const updateData = {
                theme: 'dark',
                notifications: {
                    email: false,
                    push: true,
                    desktop: false
                }
            };

            const updatedSettings = {
                theme: 'dark',
                notifications: {
                    email: false,
                    push: true,
                    desktop: false
                },
                privacy: {
                    showOnlineStatus: true,
                    allowDirectMessages: true
                },
                language: 'en',
                timezone: 'UTC'
            };

            MockedClientController.updateSettings.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: updatedSettings });
            });

            const response = await request(app)
                .put('/client/settings')
                .send(updateData)
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                data: updatedSettings
            });
            expect(MockedClientController.updateSettings).toHaveBeenCalled();
        });

        it('should validate settings data', async () => {
            const invalidData = {
                theme: 'invalid-theme'
            };

            MockedClientController.updateSettings.mockImplementation(async (req, res) => {
                res.status(400).json({
                    success: false,
                    message: 'Invalid theme value'
                });
            });

            const response = await request(app)
                .put('/client/settings')
                .send(invalidData)
                .expect(400);

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
                { method: 'get', path: '/client/profile' },
                { method: 'put', path: '/client/profile' },
                { method: 'get', path: '/client/groups' },
                { method: 'get', path: '/client/channels' },
                { method: 'get', path: '/client/messages' },
                { method: 'get', path: '/client/notifications' },
                { method: 'put', path: '/client/notifications/507f1f77bcf86cd799439011/read' },
                { method: 'get', path: '/client/settings' },
                { method: 'put', path: '/client/settings' }
            ];

            for (const route of routes) {
                const response = await (request(app) as any)[route.method](route.path).expect(401);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toBe('Unauthorized');
            }
        });
    });

    describe('Error Handling', () => {
        it('should handle controller errors gracefully', async () => {
            MockedClientController.getProfile.mockImplementation(async (req, res) => {
                res.status(500).json({
                    success: false,
                    message: 'Database connection failed'
                });
            });

            const response = await request(app)
                .get('/client/profile')
                .expect(500);

            expect(response.body.success).toBe(false);
        });

        it('should handle invalid ObjectId format', async () => {
            MockedClientController.markNotificationRead.mockImplementation(async (req, res) => {
                res.status(400).json({ success: false, message: 'Invalid notification ID format' });
            });

            const response = await request(app)
                .put('/client/notifications/invalid-id/read')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });
});
