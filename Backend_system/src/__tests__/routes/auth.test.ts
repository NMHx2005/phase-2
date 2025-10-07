import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth.routes';
import { AuthController } from '../../controllers/auth.controller.mongodb';
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
jest.mock('../../controllers/auth.controller.mongodb');
jest.mock('../../middleware/auth.middleware');

const MockedAuthController = AuthController as jest.Mocked<typeof AuthController>;
const mockAuthMiddleware = authMiddleware as jest.MockedFunction<typeof authMiddleware>;

describe('Auth Routes', () => {
    let app: express.Application;
    let testUser: any;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/auth', authRoutes);

        // Reset mocks
        jest.clearAllMocks();

        // Create test user
        testUser = createTestUser();

        // Setup default mocks for all controller methods
        MockedAuthController.register.mockImplementation(async (req, res) => {
            res.status(201).json({
                success: true,
                data: testUser
            });
        });

        MockedAuthController.login.mockImplementation(async (req, res) => {
            res.status(200).json({
                success: true,
                data: {
                    user: testUser,
                    accessToken: 'mock-token',
                    refreshToken: 'mock-refresh-token'
                }
            });
        });

        MockedAuthController.refresh.mockImplementation(async (req, res) => {
            res.status(200).json({
                success: true,
                data: {
                    token: 'new-mock-token',
                    user: testUser
                }
            });
        });

        MockedAuthController.logout.mockImplementation(async (req, res) => {
            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        });
    });

    describe('POST /auth/register', () => {
        it('should register a new user', async () => {
            const userData = {
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'password123'
            };

            const createdUser = createTestUser(userData);
            const token = generateTestToken(createdUser);

            MockedAuthController.register.mockImplementation(async (req, res) => {
                res.status(201).json({
                    success: true,
                    data: {
                        token,
                        user: createdUser
                    }
                });
            });

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.username).toBe('newuser');
            expect(response.body.data.user.email).toBe('newuser@example.com');
            expect(MockedAuthController.register).toHaveBeenCalled();
        });

        it('should validate required fields', async () => {
            const invalidUserData = {
                username: 'testuser'
                // Missing email and password
            };

            MockedAuthController.register.mockImplementation(async (req, res) => {
                res.status(400).json({
                    success: false,
                    message: 'Username, email, and password are required'
                });
            });

            const response = await request(app)
                .post('/auth/register')
                .send(invalidUserData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('required');
        });

        it('should handle duplicate email', async () => {
            const userData = {
                username: 'testuser2',
                email: 'existing@example.com',
                password: 'password123'
            };

            MockedAuthController.register.mockImplementation(async (req, res) => {
                res.status(409).json({
                    success: false,
                    message: 'Email already exists'
                });
            });

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(409);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already exists');
        });

        it('should validate email format', async () => {
            const userData = {
                username: 'testuser',
                email: 'invalid-email',
                password: 'password123'
            };

            MockedAuthController.register.mockImplementation(async (req, res) => {
                res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            });

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should validate password strength', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: '123' // Too weak
            };

            MockedAuthController.register.mockImplementation(async (req, res) => {
                res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long'
                });
            });

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /auth/login', () => {
        it('should login with valid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'password123'
            };

            const token = generateTestToken(testUser);

            MockedAuthController.login.mockImplementation(async (req, res) => {
                res.status(200).json({
                    success: true,
                    data: {
                        token,
                        user: testUser
                    }
                });
            });

            const response = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.username).toBe('testuser');
            expect(response.body.data.user.email).toBe('test@example.com');
            expect(MockedAuthController.login).toHaveBeenCalled();
        });

        it('should not login with invalid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            MockedAuthController.login.mockImplementation(async (req, res) => {
                res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            });

            const response = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid');
        });

        it('should validate required fields', async () => {
            MockedAuthController.login.mockImplementation(async (req, res) => {
                res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            });

            const response = await request(app)
                .post('/auth/login')
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should handle inactive user', async () => {
            const loginData = {
                email: 'inactive@example.com',
                password: 'password123'
            };

            MockedAuthController.login.mockImplementation(async (req, res) => {
                res.status(403).json({
                    success: false,
                    message: 'Account is inactive'
                });
            });

            const response = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(403);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /auth/logout', () => {
        it('should logout successfully', async () => {
            MockedAuthController.logout.mockImplementation(async (req, res) => {
                res.status(200).json({
                    success: true,
                    message: 'Logged out successfully'
                });
            });

            const response = await request(app)
                .post('/auth/logout')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: 'Logged out successfully'
            });
            expect(MockedAuthController.logout).toHaveBeenCalled();
        });
    });

    describe('POST /auth/refresh', () => {
        it('should refresh token successfully', async () => {
            const response = await request(app)
                .post('/auth/refresh')
                .send({ refreshToken: 'valid-refresh-token' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user).toBeDefined();
            expect(MockedAuthController.refresh).toHaveBeenCalled();
        });

        it('should handle invalid refresh token', async () => {
            // Override the default mock for this specific test
            MockedAuthController.refresh.mockImplementationOnce(async (req: any, res: any) => {
                res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token'
                });
            });

            const response = await request(app)
                .post('/auth/refresh')
                .send({ refreshToken: 'invalid-token' })
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid refresh token');
            expect(MockedAuthController.refresh).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle controller errors gracefully', async () => {
            MockedAuthController.register.mockImplementation(async (req, res) => {
                res.status(500).json({
                    success: false,
                    message: 'Database connection failed'
                });
            });

            const response = await request(app)
                .post('/auth/register')
                .send({
                    username: 'test',
                    email: 'test@test.com',
                    password: 'password'
                })
                .expect(500);

            expect(response.body.success).toBe(false);
        });

        it('should handle malformed JSON', async () => {
            const response = await request(app)
                .post('/auth/register')
                .set('Content-Type', 'application/json')
                .send('invalid json')
                .expect(400);

            // Express returns different structure for malformed JSON
            expect(response.body).toBeDefined();
        });
    });

    describe('Rate Limiting', () => {
        it('should handle too many login attempts', async () => {
            MockedAuthController.login.mockImplementation(async (req, res) => {
                res.status(429).json({
                    success: false,
                    message: 'Too many login attempts. Please try again later.'
                });
            });

            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                })
                .expect(429);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Too many');
        });
    });
});
