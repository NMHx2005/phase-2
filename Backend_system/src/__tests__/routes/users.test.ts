import request from 'supertest';
import express from 'express';
import usersRoutes from '../../routes/users.routes';
import { UserController } from '../../controllers/user.controller.mongodb';
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
    generateTestGroups
} from '../utils/test-helpers';

// Mock the controllers and middleware
jest.mock('../../controllers/user.controller.mongodb');
jest.mock('../../middleware/auth.middleware');

const MockedUserController = UserController as jest.Mocked<typeof UserController>;
const mockAuthMiddleware = authMiddleware as jest.MockedFunction<typeof authMiddleware>;
const mockRequireSuperAdmin = requireSuperAdmin as jest.MockedFunction<typeof requireSuperAdmin>;

describe('Users Routes', () => {
    let app: express.Application;
    let testUser: any;
    let superAdminUser: any;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/users', usersRoutes);

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

        mockRequireSuperAdmin.mockImplementation((req, res, next) => {
            if (req.user?.roles?.includes('super_admin')) {
                next();
            } else {
                res.status(403).json({ success: false, message: 'Forbidden' });
            }
        });
    });

    describe('GET /users', () => {
        it('should return all users for super admin', async () => {
            const mockUsers = generateTestUsers(5);
            const mockResponse = {
                users: mockUsers,
                total: 5,
                page: 1,
                limit: 10
            };

            // Mock super admin authentication
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: superAdminUser._id.toString(), username: superAdminUser.username, email: superAdminUser.email, roles: superAdminUser.roles };
                next();
            });

            MockedUserController.getAllUsers.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockResponse });
            });

            const response = await request(app)
                .get('/users')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.users).toBeDefined();
            expect(response.body.data.users.length).toBe(5);
            expect(response.body.data.total).toBe(5);
            expect(MockedUserController.getAllUsers).toHaveBeenCalled();
        });

        it('should require super admin access', async () => {
            const response = await request(app)
                .get('/users')
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Forbidden');
        });

        it('should handle pagination parameters', async () => {
            // Mock super admin authentication
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: superAdminUser._id.toString(), username: superAdminUser.username, email: superAdminUser.email, roles: superAdminUser.roles };
                next();
            });

            MockedUserController.getAllUsers.mockImplementation(async (req, res) => {
                const { page = 1, limit = 10 } = req.query;
                res.status(200).json({
                    success: true,
                    data: {
                        users: [],
                        total: 0,
                        page: parseInt(page as string),
                        limit: parseInt(limit as string)
                    }
                });
            });

            const response = await request(app)
                .get('/users?page=2&limit=5')
                .expect(200);

            expect(response.body.data.page).toBe(2);
            expect(response.body.data.limit).toBe(5);
        });
    });

    describe('GET /users/:id', () => {
        it('should return user by ID', async () => {
            const userId = testUser._id.toString();

            MockedUserController.getUserById.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: testUser });
            });

            const response = await request(app)
                .get(`/users/${userId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data._id).toBeDefined();
            expect(response.body.data.username).toBe('testuser');
            expect(response.body.data.email).toBe('test@example.com');
            expect(MockedUserController.getUserById).toHaveBeenCalled();
        });

        it('should handle user not found', async () => {
            MockedUserController.getUserById.mockImplementation(async (req, res) => {
                res.status(404).json({ success: false, message: 'User not found' });
            });

            const response = await request(app)
                .get('/users/507f1f77bcf86cd799439011')
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should validate user ID format', async () => {
            MockedUserController.getUserById.mockImplementation(async (req, res) => {
                res.status(400).json({ success: false, message: 'Invalid user ID format' });
            });

            const response = await request(app)
                .get('/users/invalid-id')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /users', () => {
        it('should create a new user for super admin', async () => {
            const newUserData = {
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'password123',
                roles: ['user']
            };

            const createdUser = createTestUser(newUserData);

            // Mock super admin authentication
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: superAdminUser._id.toString(), username: superAdminUser.username, email: superAdminUser.email, roles: superAdminUser.roles };
                next();
            });

            MockedUserController.createUser.mockImplementation(async (req, res) => {
                res.status(201).json({ success: true, data: createdUser });
            });

            const response = await request(app)
                .post('/users')
                .send(newUserData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data._id).toBeDefined();
            expect(response.body.data.username).toBe('newuser');
            expect(response.body.data.email).toBe('newuser@example.com');
            expect(MockedUserController.createUser).toHaveBeenCalled();
        });

        it('should validate required fields', async () => {
            // Mock super admin authentication
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: superAdminUser._id.toString(), username: superAdminUser.username, email: superAdminUser.email, roles: superAdminUser.roles };
                next();
            });

            const invalidUserData = {
                username: 'testuser'
                // Missing email and password
            };

            MockedUserController.createUser.mockImplementation(async (req, res) => {
                res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            });

            const response = await request(app)
                .post('/users')
                .send(invalidUserData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should handle duplicate email', async () => {
            // Mock super admin authentication
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: superAdminUser._id.toString(), username: superAdminUser.username, email: superAdminUser.email, roles: superAdminUser.roles };
                next();
            });

            const duplicateUserData = {
                username: 'newuser',
                email: 'existing@example.com',
                password: 'password123'
            };

            MockedUserController.createUser.mockImplementation(async (req, res) => {
                res.status(409).json({
                    success: false,
                    message: 'Email already exists'
                });
            });

            const response = await request(app)
                .post('/users')
                .send(duplicateUserData)
                .expect(409);

            expect(response.body.success).toBe(false);
        });

        it('should require super admin access', async () => {
            const response = await request(app)
                .post('/users')
                .send({ username: 'test', email: 'test@test.com', password: 'pass' })
                .expect(403);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /users/:id', () => {
        it('should update user', async () => {
            const userId = testUser._id.toString();
            const updateData = {
                username: 'updated-username',
                email: 'updated@example.com'
            };

            const updatedUser = { ...testUser, ...updateData };

            MockedUserController.updateUser.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: updatedUser });
            });

            const response = await request(app)
                .put(`/users/${userId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data._id).toBeDefined();
            expect(response.body.data.username).toBe('updated-username');
            expect(response.body.data.email).toBe('updated@example.com');
            expect(MockedUserController.updateUser).toHaveBeenCalled();
        });

        it('should handle user not found', async () => {
            MockedUserController.updateUser.mockImplementation(async (req, res) => {
                res.status(404).json({ success: false, message: 'User not found' });
            });

            const response = await request(app)
                .put('/users/507f1f77bcf86cd799439011')
                .send({ username: 'updated' })
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should validate update data', async () => {
            MockedUserController.updateUser.mockImplementation(async (req, res) => {
                res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            });

            const response = await request(app)
                .put('/users/507f1f77bcf86cd799439011')
                .send({ email: 'invalid-email' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should handle authorization - user can only update own profile', async () => {
            const otherUserId = '507f1f77bcf86cd799439011';

            MockedUserController.updateUser.mockImplementation(async (req, res) => {
                res.status(403).json({
                    success: false,
                    message: 'You can only update your own profile'
                });
            });

            const response = await request(app)
                .put(`/users/${otherUserId}`)
                .send({ username: 'updated' })
                .expect(403);

            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /users/:id', () => {
        it('should delete user for super admin', async () => {
            const userId = testUser._id.toString();

            // Mock super admin authentication
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: superAdminUser._id.toString(), username: superAdminUser.username, email: superAdminUser.email, roles: superAdminUser.roles };
                next();
            });

            MockedUserController.deleteUser.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, message: 'User deleted successfully' });
            });

            const response = await request(app)
                .delete(`/users/${userId}`)
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: 'User deleted successfully'
            });
            expect(MockedUserController.deleteUser).toHaveBeenCalled();
        });

        it('should handle user not found', async () => {
            // Mock super admin authentication
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                req.user = { id: superAdminUser._id.toString(), username: superAdminUser.username, email: superAdminUser.email, roles: superAdminUser.roles };
                next();
            });

            MockedUserController.deleteUser.mockImplementation(async (req, res) => {
                res.status(404).json({ success: false, message: 'User not found' });
            });

            const response = await request(app)
                .delete('/users/507f1f77bcf86cd799439011')
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should require super admin access', async () => {
            const response = await request(app)
                .delete('/users/507f1f77bcf86cd799439011')
                .expect(403);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /users/:id/groups', () => {
        it('should return user groups', async () => {
            const userId = testUser._id.toString();
            const mockGroups = generateTestGroups(3, testUser._id);
            const mockResponse = {
                groups: mockGroups,
                total: 3,
                page: 1,
                limit: 10
            };

            MockedUserController.getUserGroups.mockImplementation(async (req, res) => {
                res.status(200).json({ success: true, data: mockResponse });
            });

            const response = await request(app)
                .get(`/users/${userId}/groups`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.groups).toBeDefined();
            expect(response.body.data.groups.length).toBe(3);
            expect(response.body.data.total).toBe(3);
            expect(MockedUserController.getUserGroups).toHaveBeenCalled();
        });

        it('should handle user not found', async () => {
            MockedUserController.getUserGroups.mockImplementation(async (req, res) => {
                res.status(404).json({ success: false, message: 'User not found' });
            });

            const response = await request(app)
                .get('/users/507f1f77bcf86cd799439011/groups')
                .expect(404);

            expect(response.body.success).toBe(false);
        });

        it('should handle authorization - user can only view own groups', async () => {
            const otherUserId = '507f1f77bcf86cd799439011';

            MockedUserController.getUserGroups.mockImplementation(async (req, res) => {
                res.status(403).json({
                    success: false,
                    message: 'You can only view your own groups'
                });
            });

            const response = await request(app)
                .get(`/users/${otherUserId}/groups`)
                .expect(403);

            expect(response.body.success).toBe(false);
        });

        it('should handle pagination', async () => {
            const userId = testUser._id.toString();

            MockedUserController.getUserGroups.mockImplementation(async (req, res) => {
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
                .get(`/users/${userId}/groups?page=2&limit=5`)
                .expect(200);

            expect(response.body.data.page).toBe(2);
            expect(response.body.data.limit).toBe(5);
        });
    });

    describe('Authentication', () => {
        it('should require authentication for all routes', async () => {
            // Mock middleware to simulate no authentication
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                res.status(401).json({ success: false, message: 'Unauthorized' });
            });

            const routes = [
                { method: 'get', path: '/users' },
                { method: 'get', path: '/users/507f1f77bcf86cd799439011' },
                { method: 'post', path: '/users' },
                { method: 'put', path: '/users/507f1f77bcf86cd799439011' },
                { method: 'delete', path: '/users/507f1f77bcf86cd799439011' },
                { method: 'get', path: '/users/507f1f77bcf86cd799439011/groups' }
            ];

            for (const route of routes) {
                const response = await (request(app) as any)[route.method](route.path).expect(401);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toBe('Unauthorized');
            }
        });
    });

    describe('Authorization', () => {
        it('should require super admin for protected routes', async () => {
            const protectedRoutes = [
                { method: 'get', path: '/users' },
                { method: 'post', path: '/users' },
                { method: 'delete', path: '/users/507f1f77bcf86cd799439011' }
            ];

            for (const route of protectedRoutes) {
                const response = await (request(app) as any)[route.method](route.path).expect(403);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toBe('Forbidden');
            }
        });
    });

    describe('Error Handling', () => {
        it('should handle controller errors gracefully', async () => {
            MockedUserController.getUserById.mockImplementation(async (req, res) => {
                res.status(500).json({
                    success: false,
                    message: 'Database connection failed'
                });
            });

            const response = await request(app)
                .get('/users/507f1f77bcf86cd799439011')
                .expect(500);

            expect(response.body.success).toBe(false);
        });

        it('should handle invalid ObjectId format', async () => {
            MockedUserController.getUserById.mockImplementation(async (req, res) => {
                res.status(400).json({ success: false, message: 'Invalid user ID format' });
            });

            const response = await request(app)
                .get('/users/invalid-id')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });
});
