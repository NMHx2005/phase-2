import request from 'supertest';
import express from 'express';
import messagesRoutes from '../../routes/messages.routes';
import { MessageController } from '../../controllers/message.controller.mongodb';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
    createTestUser,
    createTestGroup,
    createTestChannel,
    createAuthenticatedRequest,
    expectSuccessResponse,
    expectUnauthorizedError,
    expectNotFoundError,
    generateTestMessages
} from '../utils/test-helpers';

// Mock the controllers and middleware
jest.mock('../../controllers/message.controller.mongodb');
jest.mock('../../middleware/auth.middleware');

const MockedMessageController = MessageController as jest.Mocked<typeof MessageController>;
const mockAuthMiddleware = authMiddleware as jest.MockedFunction<typeof authMiddleware>;

describe('Messages Routes', () => {
    let app: express.Application;
    let testUser: any;
    let testGroup: any;
    let testChannel: any;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/messages', messagesRoutes);

        // Reset mocks
        jest.clearAllMocks();

        // Create test data
        testUser = createTestUser();
        testGroup = createTestGroup({ createdBy: testUser._id });
        testChannel = createTestChannel({
            groupId: testGroup._id,
            createdBy: testUser._id
        });

        // Mock middleware to pass authentication
        mockAuthMiddleware.mockImplementation((req, res, next) => {
            req.user = { id: testUser._id.toString(), username: testUser.username, email: testUser.email, roles: testUser.roles };
            next();
        });
    });

    describe('POST /api/messages', () => {
        it('should create a new message', async () => {
            const messageData = {
                channelId: testChannel._id,
                text: 'Hello, this is a test message!',
                type: 'text'
            };

            MockedMessageController.createMessage.mockImplementation(async (req: any, res: any) => {
                res.status(201).json({
                    success: true,
                    data: {
                        _id: '507f1f77bcf86cd799439011',
                        ...messageData,
                        userId: testUser._id,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
            });

            const response = await request(app)
                .post('/api/messages')
                .send(messageData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.text).toBe(messageData.text);
            expect(response.body.data.channelId).toBe(testChannel._id.toString());
            expect(response.body.data.userId).toBe(testUser._id.toString());
        });

        it('should validate required fields', async () => {
            MockedMessageController.createMessage.mockImplementation(async (req: any, res: any) => {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            });

            const response = await request(app)
                .post('/api/messages')
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/messages/channel/:channelId', () => {
        it('should get messages by channel', async () => {
            const mockMessages = generateTestMessages(5, testChannel._id, testUser._id);

            MockedMessageController.getMessagesByChannel.mockImplementation(async (req: any, res: any) => {
                res.status(200).json({
                    success: true,
                    data: mockMessages
                });
            });

            const response = await request(app)
                .get(`/api/messages/channel/${testChannel._id}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.length).toBe(5);
        });

        it('should support pagination', async () => {
            const mockMessages = generateTestMessages(3, testChannel._id, testUser._id);

            MockedMessageController.getMessagesByChannel.mockImplementation(async (req: any, res: any) => {
                res.status(200).json({
                    success: true,
                    data: mockMessages
                });
            });

            const response = await request(app)
                .get(`/api/messages/channel/${testChannel._id}?limit=10&offset=0`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.length).toBe(3);
        });
    });

    describe('GET /api/messages/search', () => {
        it('should search messages', async () => {
            const mockMessages = generateTestMessages(3, testChannel._id, testUser._id);

            MockedMessageController.searchMessages.mockImplementation(async (req: any, res: any) => {
                res.status(200).json({
                    success: true,
                    data: mockMessages
                });
            });

            const response = await request(app)
                .get('/api/messages/search?q=test')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.length).toBe(3);
        });
    });

    describe('GET /api/messages/user/:userId', () => {
        it('should get messages by user', async () => {
            const mockMessages = generateTestMessages(3, testChannel._id, testUser._id);

            MockedMessageController.getMessagesByUser.mockImplementation(async (req: any, res: any) => {
                res.status(200).json({
                    success: true,
                    data: mockMessages
                });
            });

            const response = await request(app)
                .get(`/api/messages/user/${testUser._id}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.length).toBe(3);
        });

        it('should support pagination for user messages', async () => {
            const mockMessages = generateTestMessages(2, testChannel._id, testUser._id);

            MockedMessageController.getMessagesByUser.mockImplementation(async (req: any, res: any) => {
                res.status(200).json({
                    success: true,
                    data: mockMessages
                });
            });

            const response = await request(app)
                .get(`/api/messages/user/${testUser._id}?limit=10&offset=0`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.length).toBe(2);
        });
    });

    describe('GET /api/messages/:id', () => {
        it('should get message by ID', async () => {
            const mockMessages = generateTestMessages(1, testChannel._id, testUser._id);
            const mockMessage = mockMessages[0];

            MockedMessageController.getMessageById.mockImplementation(async (req: any, res: any) => {
                res.status(200).json({
                    success: true,
                    data: mockMessage
                });
            });

            const response = await request(app)
                .get(`/api/messages/${mockMessage!._id}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data._id).toBe(mockMessage!._id.toString());
        });

        it('should return 404 for non-existent message', async () => {
            MockedMessageController.getMessageById.mockImplementation(async (req: any, res: any) => {
                res.status(404).json({
                    success: false,
                    message: 'Message not found'
                });
            });

            const response = await request(app)
                .get('/api/messages/507f1f77bcf86cd799439011')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Message not found');
        });
    });

    describe('PUT /api/messages/:id', () => {
        it('should update message', async () => {
            const mockMessages = generateTestMessages(1, testChannel._id, testUser._id);
            const mockMessage = mockMessages[0];
            const updateData = { text: 'Updated message text' };

            MockedMessageController.updateMessage.mockImplementation(async (req: any, res: any) => {
                res.status(200).json({
                    success: true,
                    data: { ...mockMessage, ...updateData }
                });
            });

            const response = await request(app)
                .put(`/api/messages/${mockMessage!._id}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.text).toBe(updateData.text);
        });

        it('should return 403 when trying to update another user message', async () => {
            MockedMessageController.updateMessage.mockImplementation(async (req: any, res: any) => {
                res.status(403).json({
                    success: false,
                    message: 'You can only update your own messages'
                });
            });

            const response = await request(app)
                .put('/api/messages/507f1f77bcf86cd799439011')
                .send({ text: 'Updated message' })
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('You can only update your own messages');
        });
    });

    describe('DELETE /api/messages/:id', () => {
        it('should delete message', async () => {
            const mockMessages = generateTestMessages(1, testChannel._id, testUser._id);
            const mockMessage = mockMessages[0];

            MockedMessageController.deleteMessage.mockImplementation(async (req: any, res: any) => {
                res.status(200).json({
                    success: true,
                    message: 'Message deleted successfully'
                });
            });

            const response = await request(app)
                .delete(`/api/messages/${mockMessage!._id}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Message deleted successfully');
        });

        it('should return 403 when trying to delete another user message', async () => {
            MockedMessageController.deleteMessage.mockImplementation(async (req: any, res: any) => {
                res.status(403).json({
                    success: false,
                    message: 'You can only delete your own messages'
                });
            });

            const response = await request(app)
                .delete('/api/messages/507f1f77bcf86cd799439011')
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('You can only delete your own messages');
        });
    });

    describe('Authentication', () => {
        it('should require authentication for all routes', async () => {
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            });

            const response = await request(app)
                .post('/api/messages')
                .send({
                    channelId: testChannel._id,
                    text: 'Test message',
                    type: 'text'
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Error Handling', () => {
        it('should handle controller errors gracefully', async () => {
            MockedMessageController.createMessage.mockImplementation(async (req: any, res: any) => {
                res.status(500).json({
                    success: false,
                    message: 'Database connection failed'
                });
            });

            const response = await request(app)
                .post('/api/messages')
                .send({
                    channelId: testChannel._id,
                    text: 'Test message',
                    type: 'text'
                })
                .expect(500);

            expect(response.body.success).toBe(false);
        });
    });
});