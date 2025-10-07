import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-system-test';

// Mock console methods in tests to reduce noise
global.console = {
    ...console,
    // Uncomment to ignore specific console methods
    // log: jest.fn(),
    // debug: jest.fn(),
    // info: jest.fn(),
    // warn: jest.fn(),
    // error: jest.fn(),
};

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
    jest.clearAllMocks();
});