import request from 'supertest';
import express from 'express';
import channelsRoutes from '../../routes/channels.routes';
import { ChannelController } from '../../controllers/channel.controller.mongodb';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
    createTestUser,
    createTestGroup,
    createTestChannel,
    createAuthenticatedRequest,
    expectSuccessResponse,
    expectUnauthorizedError,
    expectNotFoundError,
    generateTestChannels
} from '../utils/test-helpers';

// Mock the controllers and middleware
jest.mock('../../controllers/channel.controller.mongodb');
jest.mock('../../middleware/auth.middleware');

const MockedChannelController = ChannelController as jest.Mocked<typeof ChannelController>;
const mockAuthMiddleware = authMiddleware as jest.MockedFunction<typeof authMiddleware>;

describe('Channels Routes', () => {
    let app: express.Application;
    let testUser: any;
    let testGroup: any;
    let testChannel: any;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/channels', channelsRoutes);

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

    describe('GET /channels', () => {
        it('should return all channels', async () => {
            const mockChannels = generateTestChannels(5, testGroup._id, testUser._id);
            const mockResponse = {
                channels: mockChannels,
                total: 5,
                page: 1,
                limit: 10
            };

            MockedChannelController.getAllChannels.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockResponse });
            });

            const response = await request(app)
                .get('/channels')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.channels).toBeDefined();
            expect(response.body.data.channels.length).toBe(5);
            expect(response.body.data.total).toBe(5);
            expect(MockedChannelController.getAllChannels).toHaveBeenCalled();
        });

        it('should handle pagination parameters', async () => {
            MockedChannelController.getAllChannels.mockImplementation(async (req, res) => {
                const { page = 1, limit = 10 } = req.query;
                res.status(200).json({
                    success: true,
                    data: {
                        channels: [],
                        total: 0,
                        page: parseInt(page as string),
                        limit: parseInt(limit as string)
                    }
                });
            });

            const response = await request(app)
                .get('/channels?page=2&limit=5')
                .expect(200);

            expect(response.body.data.page).toBe(2);
            expect(response.body.data.limit).toBe(5);
        });

        it('should handle errors', async () => {
            MockedChannelController.getAllChannels.mockImplementation(async (req, res) => {
                res.status(500).json({ success: false, message: 'Internal server error' });
            });

            const response = await request(app)
                .get('/channels')
                .expect(500);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /channels/group/:groupId', () => {
        it('should return channels for a specific group', async () => {
            const groupId = testGroup._id.toString();
            const mockChannels = generateTestChannels(3, testGroup._id, testUser._id);

            MockedChannelController.getChannelsByGroup.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockChannels });
            });

            const response = await request(app)
                .get(`/channels/group/${groupId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.length).toBe(3);
            expect(MockedChannelController.getChannelsByGroup).toHaveBeenCalled();
        });

        it('should handle invalid group ID', async () => {
            MockedChannelController.getChannelsByGroup.mockImplementation(async (req, res) => {
                res.status(400).json({ success: false, message: 'Invalid group ID' });
            });

            const response = await request(app)
                .get('/channels/group/invalid-id')
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should handle group not found', async () => {
            MockedChannelController.getChannelsByGroup.mockImplementation(async (req, res) => {
                res.status(404).json({ success: false, message: 'Group not found' });
            });

            const response = await request(app)
                .get('/channels/group/507f1f77bcf86cd799439011')
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /channels/:id', () => {
        it('should return a specific channel', async () => {
            const channelId = testChannel._id.toString();

            MockedChannelController.getChannelById.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: testChannel });
            });

            const response = await request(app)
                .get(`/channels/${channelId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data._id).toBeDefined();
            expect(response.body.data.name).toBe(testChannel.name);
            expect(MockedChannelController.getChannelById).toHaveBeenCalled();
        });

        it('should handle channel not found', async () => {
            MockedChannelController.getChannelById.mockImplementation(async (req, res) => {
                res.status(404).json({ success: false, message: 'Channel not found' });
            });

            const response = await request(app)
                .get('/channels/507f1f77bcf86cd799439011')
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /channels', () => {
        it('should create a new channel', async () => {
            const channelData = {
                name: 'new-channel',
                description: 'A new channel',
                groupId: testGroup._id.toString(),
                type: 'text',
                isPrivate: false
            };

            const createdChannel = createTestChannel({
                name: channelData.name,
                description: channelData.description,
                groupId: testGroup._id,
                createdBy: testUser._id
            });

            MockedChannelController.createChannel.mockImplementation(async (req, res) => {
                res.status(201).json({ success: true, data: createdChannel });
            });

            const response = await request(app)
                .post('/channels')
                .send(channelData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data._id).toBeDefined();
            expect(response.body.data.name).toBe(createdChannel.name);
            expect(MockedChannelController.createChannel).toHaveBeenCalled();
        });

        it('should validate required fields', async () => {
            const invalidChannelData = {
                name: 'test-channel'
                // Missing required fields
            };

            MockedChannelController.createChannel.mockImplementation(async (req, res) => {
                res.status(400).json({
                    success: false,
                    message: 'Name, groupId, and type are required'
                });
            });

            const response = await request(app)
                .post('/channels')
                .send(invalidChannelData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should handle duplicate channel names', async () => {
            const channelData = {
                name: 'existing-channel',
                description: 'A channel',
                groupId: testGroup._id.toString(),
                type: 'text'
            };

            MockedChannelController.createChannel.mockImplementation(async (req, res) => {
                res.status(409).json({
                    success: false,
                    message: 'Channel name already exists in this group'
                });
            });

            const response = await request(app)
                .post('/channels')
                .send(channelData)
                .expect(409);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /channels/:id', () => {
        it('should update a channel', async () => {
            const channelId = testChannel._id.toString();
            const updateData = {
                name: 'updated-channel',
                description: 'Updated description'
            };

            const updatedChannel = { ...testChannel, ...updateData };

            MockedChannelController.updateChannel.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: updatedChannel });
            });

            const response = await request(app)
                .put(`/channels/${channelId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data._id).toBeDefined();
            expect(response.body.data.name).toBe(updatedChannel.name);
            expect(MockedChannelController.updateChannel).toHaveBeenCalled();
        });

        it('should handle channel not found', async () => {
            MockedChannelController.updateChannel.mockImplementation(async (req, res) => {
                res.status(404).json({ success: false, message: 'Channel not found' });
            });

            const response = await request(app)
                .put('/channels/507f1f77bcf86cd799439011')
                .send({ name: 'updated' })
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should validate update data', async () => {
            MockedChannelController.updateChannel.mockImplementation(async (req, res) => {
                res.status(400).json({
                    success: false,
                    message: 'Invalid update data'
                });
            });

            const response = await request(app)
                .put('/channels/507f1f77bcf86cd799439011')
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /channels/:id', () => {
        it('should delete a channel', async () => {
            const channelId = testChannel._id.toString();

            MockedChannelController.deleteChannel.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, message: 'Channel deleted successfully' });
            });

            const response = await request(app)
                .delete(`/channels/${channelId}`)
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: 'Channel deleted successfully'
            });
            expect(MockedChannelController.deleteChannel).toHaveBeenCalled();
        });

        it('should handle channel not found', async () => {
            MockedChannelController.deleteChannel.mockImplementation(async (req, res) => {
                res.status(404).json({ success: false, message: 'Channel not found' });
            });

            const response = await request(app)
                .delete('/channels/507f1f77bcf86cd799439011')
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /channels/:id/members', () => {
        it('should add a member to channel', async () => {
            const channelId = testChannel._id.toString();
            const memberData = {
                userId: '507f1f77bcf86cd799439011'
            };

            MockedChannelController.addMember.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, message: 'Member added successfully' });
            });

            const response = await request(app)
                .post(`/channels/${channelId}/members`)
                .send(memberData)
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: 'Member added successfully'
            });
            expect(MockedChannelController.addMember).toHaveBeenCalled();
        });

        it('should validate member data', async () => {
            MockedChannelController.addMember.mockImplementation(async (req, res) => {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            });

            const response = await request(app)
                .post('/channels/507f1f77bcf86cd799439011/members')
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should handle channel not found', async () => {
            MockedChannelController.addMember.mockImplementation(async (req, res) => {
                res.status(404).json({ success: false, message: 'Channel not found' });
            });

            const response = await request(app)
                .post('/channels/507f1f77bcf86cd799439011/members')
                .send({ userId: '507f1f77bcf86cd799439012' })
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /channels/:id/members/:userId', () => {
        it('should remove a member from channel', async () => {
            const channelId = testChannel._id.toString();
            const userId = '507f1f77bcf86cd799439011';

            MockedChannelController.removeMember.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, message: 'Member removed successfully' });
            });

            const response = await request(app)
                .delete(`/channels/${channelId}/members/${userId}`)
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: 'Member removed successfully'
            });
            expect(MockedChannelController.removeMember).toHaveBeenCalled();
        });

        it('should handle member not found', async () => {
            MockedChannelController.removeMember.mockImplementation(async (req, res) => {
                res.status(404).json({ success: false, message: 'Member not found in channel' });
            });

            const response = await request(app)
                .delete('/channels/507f1f77bcf86cd799439011/members/507f1f77bcf86cd799439012')
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should handle channel not found', async () => {
            MockedChannelController.removeMember.mockImplementation(async (req, res) => {
                res.status(404).json({ success: false, message: 'Channel not found' });
            });

            const response = await request(app)
                .delete('/channels/507f1f77bcf86cd799439011/members/507f1f77bcf86cd799439012')
                .expect(404);

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
                { method: 'get', path: '/channels' },
                { method: 'get', path: '/channels/group/507f1f77bcf86cd799439011' },
                { method: 'get', path: '/channels/507f1f77bcf86cd799439011' },
                { method: 'post', path: '/channels' },
                { method: 'put', path: '/channels/507f1f77bcf86cd799439011' },
                { method: 'delete', path: '/channels/507f1f77bcf86cd799439011' },
                { method: 'post', path: '/channels/507f1f77bcf86cd799439011/members' },
                { method: 'delete', path: '/channels/507f1f77bcf86cd799439011/members/507f1f77bcf86cd799439012' }
            ];

            for (const route of routes) {
                const response = await request(app)[route.method as 'get' | 'post' | 'put' | 'delete'](route.path).expect(401);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toBe('Unauthorized');
            }
        });
    });

    describe('Error Handling', () => {
        it('should handle controller errors gracefully', async () => {
            MockedChannelController.getAllChannels.mockImplementation(async (req, res) => {
                res.status(500).json({
                    success: false,
                    message: 'Database connection failed'
                });
            });

            const response = await request(app)
                .get('/channels')
                .expect(500);

            expect(response.body.success).toBe(false);
        });

        it('should handle invalid ObjectId format', async () => {
            MockedChannelController.getChannelById.mockImplementation(async (req, res) => {
                res.status(400).json({ success: false, message: 'Invalid channel ID format' });
            });

            const response = await request(app)
                .get('/channels/invalid-id')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });
});
