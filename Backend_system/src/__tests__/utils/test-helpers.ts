import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

export interface TestUser {
    _id: ObjectId;
    username: string;
    email: string;
    password: string;
    roles: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface TestGroup {
    _id: ObjectId;
    name: string;
    description: string;
    createdBy: ObjectId;
    members: ObjectId[];
    admins: ObjectId[];
    isPrivate: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface TestChannel {
    _id: ObjectId;
    name: string;
    description: string;
    groupId: ObjectId;
    createdBy: ObjectId;
    members: ObjectId[];
    admins: ObjectId[];
    isPrivate: boolean;
    type: 'text' | 'image' | 'file';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface TestMessage {
    _id: ObjectId;
    channelId: ObjectId;
    userId: ObjectId;
    username: string;
    text: string;
    type: 'text' | 'image' | 'file';
    imageUrl?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface TestVideoCall {
    _id: ObjectId;
    callerId: ObjectId;
    callerName: string;
    receiverId: ObjectId;
    receiverName: string;
    channelId: ObjectId;
    status: 'initiated' | 'answered' | 'rejected' | 'ended' | 'failed';
    startTime: Date;
    endTime?: Date;
    duration?: number;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Create a mock request object
 */
export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: undefined,
    ...overrides
});

/**
 * Create a mock response object
 */
export const createMockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
};

/**
 * Create a test user
 */
export const createTestUser = (overrides: Partial<TestUser> = {}): TestUser => ({
    _id: new ObjectId(),
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    roles: ['user'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
});

/**
 * Create a super admin test user
 */
export const createSuperAdminUser = (overrides: Partial<TestUser> = {}): TestUser => ({
    _id: new ObjectId(),
    username: 'superadmin',
    email: 'admin@example.com',
    password: 'hashedpassword',
    roles: ['super_admin'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
});

/**
 * Create a test group
 */
export const createTestGroup = (overrides: Partial<TestGroup> = {}): TestGroup => ({
    _id: new ObjectId(),
    name: 'Test Group',
    description: 'A test group',
    createdBy: new ObjectId(),
    members: [new ObjectId()],
    admins: [new ObjectId()],
    isPrivate: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
});

/**
 * Create a test channel
 */
export const createTestChannel = (overrides: Partial<TestChannel> = {}): TestChannel => ({
    _id: new ObjectId(),
    name: 'general',
    description: 'General channel',
    groupId: new ObjectId(),
    createdBy: new ObjectId(),
    members: [new ObjectId()],
    admins: [new ObjectId()],
    isPrivate: false,
    type: 'text',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
});

/**
 * Create a test message
 */
export const createTestMessage = (overrides: Partial<TestMessage> = {}): TestMessage => ({
    _id: new ObjectId(),
    channelId: new ObjectId(),
    userId: new ObjectId(),
    username: 'testuser',
    text: 'Test message',
    type: 'text',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
});

/**
 * Create a test video call
 */
export const createTestVideoCall = (overrides: Partial<TestVideoCall> = {}): TestVideoCall => ({
    _id: new ObjectId(),
    callerId: new ObjectId(),
    callerName: 'caller',
    receiverId: new ObjectId(),
    receiverName: 'receiver',
    channelId: new ObjectId(),
    status: 'initiated',
    startTime: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
});

/**
 * Generate a JWT token for testing
 */
export const generateTestToken = (user: TestUser): string => {
    return jwt.sign(
        {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            roles: user.roles
        },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
    );
};

/**
 * Create authenticated request with token
 */
export const createAuthenticatedRequest = (user: TestUser, overrides: Partial<Request> = {}): Partial<Request> => {
    const token = generateTestToken(user);
    return createMockRequest({
        ...overrides,
        headers: {
            authorization: `Bearer ${token}`,
            ...overrides.headers
        },
        user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            roles: user.roles
        }
    });
};

/**
 * Create super admin authenticated request
 */
export const createSuperAdminRequest = (overrides: Partial<Request> = {}): Partial<Request> => {
    const superAdmin = createSuperAdminUser();
    return createAuthenticatedRequest(superAdmin, overrides);
};

/**
 * Mock service methods
 */
export const mockService = {
    success: (data: any = {}) => Promise.resolve({ success: true, data }),
    error: (message: string = 'Test error') => Promise.resolve({ success: false, message }),
    notFound: () => Promise.resolve({ success: false, message: 'Not found' }),
    unauthorized: () => Promise.resolve({ success: false, message: 'Unauthorized' }),
    forbidden: () => Promise.resolve({ success: false, message: 'Forbidden' })
};

/**
 * Assert response structure
 */
export const expectSuccessResponse = (res: any, expectedData?: any) => {
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expectedData || expect.any(Object)
    });
};

export const expectErrorResponse = (res: any, statusCode: number, message?: string) => {
    expect(res.status).toHaveBeenCalledWith(statusCode);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: message || expect.any(String)
    });
};

export const expectValidationError = (res: any, message?: string) => {
    expectErrorResponse(res, 400, message);
};

export const expectUnauthorizedError = (res: any) => {
    expectErrorResponse(res, 401, 'Unauthorized');
};

export const expectForbiddenError = (res: any) => {
    expectErrorResponse(res, 403, 'Forbidden');
};

export const expectNotFoundError = (res: any) => {
    expectErrorResponse(res, 404, 'Not found');
};

/**
 * Test data generators
 */
export const generateTestUsers = (count: number): TestUser[] => {
    return Array.from({ length: count }, (_, index) =>
        createTestUser({
            username: `user${index + 1}`,
            email: `user${index + 1}@example.com`
        })
    );
};

export const generateTestGroups = (count: number, createdBy: ObjectId): TestGroup[] => {
    return Array.from({ length: count }, (_, index) =>
        createTestGroup({
            name: `Group ${index + 1}`,
            description: `Description for group ${index + 1}`,
            createdBy
        })
    );
};

export const generateTestChannels = (count: number, groupId: ObjectId, createdBy: ObjectId): TestChannel[] => {
    return Array.from({ length: count }, (_, index) =>
        createTestChannel({
            name: `channel${index + 1}`,
            description: `Description for channel ${index + 1}`,
            groupId,
            createdBy
        })
    );
};

export const generateTestMessages = (count: number, channelId: ObjectId, userId: ObjectId): TestMessage[] => {
    return Array.from({ length: count }, (_, index) =>
        createTestMessage({
            text: `Test message ${index + 1}`,
            channelId,
            userId
        })
    );
};

/**
 * Database cleanup helpers
 */
export const cleanupTestData = async (collections: any[]) => {
    for (const collection of collections) {
        await collection.deleteMany({});
    }
};

/**
 * Wait for async operations
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
