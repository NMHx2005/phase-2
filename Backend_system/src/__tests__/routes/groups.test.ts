import request from 'supertest';
import express from 'express';
import groupsRoutes from '../../routes/groups.routes';
import { GroupController } from '../../controllers/group.controller.mongodb';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
    createTestUser,
    createAuthenticatedRequest,
    expectSuccessResponse,
    expectUnauthorizedError,
    expectValidationError,
    generateTestToken
} from '../utils/test-helpers';

// Mock the controllers and middleware
jest.mock('../../controllers/group.controller.mongodb');
jest.mock('../../middleware/auth.middleware');

const MockedGroupController = GroupController as jest.Mocked<typeof GroupController>;
const mockAuthMiddleware = authMiddleware as jest.MockedFunction<typeof authMiddleware>;

describe('Groups Routes', () => {
    let app: express.Application;
    let testUser: any;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/groups', groupsRoutes);

        // Reset mocks
        jest.clearAllMocks();

        // Create test user
        testUser = createTestUser();

        // Mock auth middleware to allow all requests
        mockAuthMiddleware.mockImplementation((req, res, next) => {
            req.user = testUser;
            next();
        });
    });

    describe('GET /api/groups', () => {
        it('should get all groups', async () => {
            const mockGroups = [
                { _id: '1', name: 'Group 1', description: 'Description 1' },
                { _id: '2', name: 'Group 2', description: 'Description 2' }
            ];

            MockedGroupController.getAllGroups.mockImplementation(async (req, res) => {
                res.status(200).json({
                    success: true,
                    data: mockGroups
                });
            });

            const response = await request(app)
                .get('/api/groups')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(2);
            expect(MockedGroupController.getAllGroups).toHaveBeenCalled();
        });

        it('should require authentication', async () => {
            // Mock auth middleware to reject request
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            });

            const response = await request(app)
                .get('/api/groups')
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/groups', () => {
        it('should create a new group', async () => {
            const groupData = {
                name: 'Test Group',
                description: 'A test group',
                isPrivate: false
            };

            const createdGroup = {
                _id: '507f1f77bcf86cd799439011',
                ...groupData,
                createdBy: testUser._id,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            MockedGroupController.createGroup.mockImplementation(async (req, res) => {
                res.status(201).json({
                    success: true,
                    data: createdGroup
                });
            });

            const response = await request(app)
                .post('/api/groups')
                .send(groupData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(groupData.name);
            expect(response.body.data.description).toBe(groupData.description);
            expect(MockedGroupController.createGroup).toHaveBeenCalled();
        });

        it('should validate required fields', async () => {
            MockedGroupController.createGroup.mockImplementation(async (req, res) => {
                res.status(400).json({
                    success: false,
                    message: 'Name is required'
                });
            });

            const response = await request(app)
                .post('/api/groups')
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/groups/:id', () => {
        it('should get group by ID', async () => {
            const groupId = '507f1f77bcf86cd799439011';
            const mockGroup = {
                _id: groupId,
                name: 'Test Group',
                description: 'A test group',
                isPrivate: false,
                createdBy: testUser._id,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            MockedGroupController.getGroupById.mockImplementation(async (req, res) => {
                res.status(200).json({
                    success: true,
                    data: mockGroup
                });
            });

            const response = await request(app)
                .get(`/api/groups/${groupId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(groupId);
            expect(MockedGroupController.getGroupById).toHaveBeenCalled();
        });

        it('should return 404 for non-existent group', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            MockedGroupController.getGroupById.mockImplementation(async (req, res) => {
                res.status(404).json({
                    success: false,
                    message: 'Group not found'
                });
            });

            const response = await request(app)
                .get(`/api/groups/${fakeId}`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });
});
