import request from 'supertest';
import express from 'express';
import uploadRoutes from '../../routes/upload.routes';
import { authMiddleware } from '../../middleware/auth.middleware';
import { uploadAvatar, uploadImage, upload, processAvatar, getFileUrl, handleUploadError } from '../../middleware/upload.middleware';
import {
    createTestUser,
    createAuthenticatedRequest,
    expectSuccessResponse,
    expectUnauthorizedError,
    expectNotFoundError
} from '../utils/test-helpers';
import path from 'path';
import fs from 'fs';

// Mock the middleware
jest.mock('../../middleware/auth.middleware');
jest.mock('../../middleware/upload.middleware', () => {
    const mockMiddleware = (req: any, res: any, next: any) => {
        // Default behavior - no file
        req.file = null;
        req.files = [];
        next();
    };

    return {
        uploadAvatar: {
            single: jest.fn(() => mockMiddleware)
        },
        uploadImage: {
            single: jest.fn(() => mockMiddleware)
        },
        upload: {
            single: jest.fn(() => mockMiddleware),
            array: jest.fn(() => mockMiddleware)
        },
        processAvatar: jest.fn(),
        getFileUrl: jest.fn(),
        handleUploadError: jest.fn()
    };
});

const mockAuthMiddleware = authMiddleware as jest.MockedFunction<typeof authMiddleware>;
const mockUploadAvatar = uploadAvatar as any;
const mockUploadImage = uploadImage as any;
const mockUpload = upload as any;
const mockProcessAvatar = processAvatar as jest.MockedFunction<typeof processAvatar>;
const mockGetFileUrl = getFileUrl as jest.MockedFunction<typeof getFileUrl>;
const mockHandleUploadError = handleUploadError as jest.MockedFunction<typeof handleUploadError>;

// Mock fs
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe.skip('Upload Routes', () => {
    let app: express.Application;
    let testUser: any;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/upload', uploadRoutes);

        // Reset mocks
        jest.clearAllMocks();

        // Create test user
        testUser = createTestUser();

        // Mock middleware to pass authentication
        mockAuthMiddleware.mockImplementation((req: any, res, next) => {
            req.user = {
                id: testUser._id.toString(),
                userId: testUser._id.toString(),
                username: testUser.username,
                email: testUser.email,
                roles: testUser.roles
            };
            next();
        });

        // Mock file processing
        mockProcessAvatar.mockResolvedValue(true);
        mockGetFileUrl.mockReturnValue('http://localhost:3000/uploads/test-file.jpg');

        // Setup multer mocks to return middleware functions
        const mockMiddleware = (req: any, res: any, next: any) => {
            // Default behavior - no file
            req.file = null;
            req.files = [];
            next();
        };

        mockUploadAvatar.single.mockReturnValue(mockMiddleware);
        mockUploadImage.single.mockReturnValue(mockMiddleware);
        mockUpload.single.mockReturnValue(mockMiddleware);
        mockUpload.array.mockReturnValue(mockMiddleware);
    });

    describe('POST /upload/avatar', () => {
        it('should upload avatar successfully', async () => {
            const mockFile = {
                fieldname: 'avatar',
                originalname: 'avatar.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                size: 1024,
                filename: 'avatar-123.jpg',
                path: '/uploads/avatar-123.jpg'
            };

            // Override the default mock for this test
            mockUploadAvatar.single.mockReturnValueOnce((req: any, res: any, next: any) => {
                req.file = mockFile;
                next();
            });

            // Mock file operations
            mockFs.unlinkSync = jest.fn();
            mockFs.existsSync = jest.fn().mockReturnValue(true);

            const response = await request(app)
                .post('/upload/avatar')
                .attach('avatar', Buffer.from('fake image data'), 'avatar.jpg')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: 'Avatar uploaded successfully',
                data: {
                    avatarUrl: 'http://localhost:3000/uploads/test-file.jpg',
                    filename: expect.any(String)
                }
            });

            expect(mockProcessAvatar).toHaveBeenCalled();
            expect(mockFs.unlinkSync).toHaveBeenCalled();
        });

        it('should handle no file provided', async () => {
            mockUploadAvatar.single = jest.fn().mockImplementation((fieldName) => {
                return (req: any, res: any, next: any) => {
                    req.file = null;
                    next();
                };
            });

            const response = await request(app)
                .post('/upload/avatar')
                .expect(400);

            expect(response.body).toEqual({
                success: false,
                message: 'No avatar file provided'
            });
        });

        it('should handle avatar processing failure', async () => {
            const mockFile = {
                fieldname: 'avatar',
                originalname: 'avatar.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                size: 1024,
                filename: 'avatar-123.jpg',
                path: '/uploads/avatar-123.jpg'
            };

            mockUploadAvatar.single = jest.fn().mockImplementation((fieldName) => {
                return (req: any, res: any, next: any) => {
                    req.file = mockFile;
                    next();
                };
            });

            mockProcessAvatar.mockResolvedValue(false);
            mockFs.unlinkSync = jest.fn();

            const response = await request(app)
                .post('/upload/avatar')
                .attach('avatar', Buffer.from('fake image data'), 'avatar.jpg')
                .expect(500);

            expect(response.body).toEqual({
                success: false,
                message: 'Failed to process avatar image'
            });

            expect(mockFs.unlinkSync).toHaveBeenCalled();
        });

        it('should handle upload errors', async () => {
            mockUploadAvatar.single = jest.fn().mockImplementation((fieldName) => {
                return (req: any, res: any, next: any) => {
                    next(new Error('Upload failed'));
                };
            });

            const response = await request(app)
                .post('/upload/avatar')
                .attach('avatar', Buffer.from('fake image data'), 'avatar.jpg')
                .expect(500);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /upload/image', () => {
        it('should upload image successfully', async () => {
            const mockFile = {
                fieldname: 'image',
                originalname: 'image.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                size: 2048,
                filename: 'image-123.jpg',
                path: '/uploads/image-123.jpg'
            };

            mockUploadImage.single = jest.fn().mockImplementation((fieldName) => {
                return (req: any, res: any, next: any) => {
                    req.file = mockFile;
                    next();
                };
            });

            const response = await request(app)
                .post('/upload/image')
                .attach('image', Buffer.from('fake image data'), 'image.jpg')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: 'Image uploaded successfully',
                data: {
                    imageUrl: 'http://localhost:3000/uploads/test-file.jpg',
                    filename: mockFile.filename,
                    originalName: mockFile.originalname,
                    size: mockFile.size,
                    mimeType: mockFile.mimetype
                }
            });
        });

        it('should handle no image file provided', async () => {
            mockUploadImage.single = jest.fn().mockImplementation((fieldName) => {
                return (req: any, res: any, next: any) => {
                    req.file = null;
                    next();
                };
            });

            const response = await request(app)
                .post('/upload/image')
                .expect(400);

            expect(response.body).toEqual({
                success: false,
                message: 'No image file provided'
            });
        });
    });

    describe('POST /upload/file', () => {
        it('should upload file successfully', async () => {
            const mockFile = {
                fieldname: 'file',
                originalname: 'document.pdf',
                encoding: '7bit',
                mimetype: 'application/pdf',
                size: 5120,
                filename: 'file-123.pdf',
                path: '/uploads/file-123.pdf'
            };

            mockUpload.single = jest.fn().mockImplementation((fieldName) => {
                return (req: any, res: any, next: any) => {
                    req.file = mockFile;
                    next();
                };
            });

            const response = await request(app)
                .post('/upload/file')
                .attach('file', Buffer.from('fake file data'), 'document.pdf')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: 'File uploaded successfully',
                data: {
                    fileUrl: 'http://localhost:3000/uploads/test-file.jpg',
                    filename: mockFile.filename,
                    originalName: mockFile.originalname,
                    size: mockFile.size,
                    mimeType: mockFile.mimetype
                }
            });
        });

        it('should handle no file provided', async () => {
            mockUpload.single = jest.fn().mockImplementation((fieldName) => {
                return (req: any, res: any, next: any) => {
                    req.file = null;
                    next();
                };
            });

            const response = await request(app)
                .post('/upload/file')
                .expect(400);

            expect(response.body).toEqual({
                success: false,
                message: 'No file provided'
            });
        });
    });

    describe('POST /upload/multiple', () => {
        it('should upload multiple files successfully', async () => {
            const mockFiles = [
                {
                    fieldname: 'files',
                    originalname: 'file1.jpg',
                    encoding: '7bit',
                    mimetype: 'image/jpeg',
                    size: 1024,
                    filename: 'file1-123.jpg',
                    path: '/uploads/file1-123.jpg'
                },
                {
                    fieldname: 'files',
                    originalname: 'file2.pdf',
                    encoding: '7bit',
                    mimetype: 'application/pdf',
                    size: 2048,
                    filename: 'file2-123.pdf',
                    path: '/uploads/file2-123.pdf'
                }
            ];

            mockUpload.array = jest.fn().mockImplementation((fieldName, maxCount) => {
                return (req: any, res: any, next: any) => {
                    req.files = mockFiles;
                    next();
                };
            });

            const response = await request(app)
                .post('/upload/multiple')
                .attach('files', Buffer.from('fake file 1'), 'file1.jpg')
                .attach('files', Buffer.from('fake file 2'), 'file2.pdf')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: 'Files uploaded successfully',
                data: {
                    files: [
                        {
                            fileUrl: 'http://localhost:3000/uploads/test-file.jpg',
                            filename: mockFiles[0]?.filename,
                            originalName: mockFiles[0]?.originalname,
                            size: mockFiles[0]?.size,
                            mimeType: mockFiles[0]?.mimetype
                        },
                        {
                            fileUrl: 'http://localhost:3000/uploads/test-file.jpg',
                            filename: mockFiles[1]?.filename,
                            originalName: mockFiles[1]?.originalname,
                            size: mockFiles[1]?.size,
                            mimeType: mockFiles[1]?.mimetype
                        }
                    ],
                    count: 2
                }
            });
        });

        it('should handle no files provided', async () => {
            mockUpload.array = jest.fn().mockImplementation((fieldName, maxCount) => {
                return (req: any, res: any, next: any) => {
                    req.files = [];
                    next();
                };
            });

            const response = await request(app)
                .post('/upload/multiple')
                .expect(400);

            expect(response.body).toEqual({
                success: false,
                message: 'No files provided'
            });
        });

        it('should handle single file in multiple upload', async () => {
            const mockFile = {
                fieldname: 'files',
                originalname: 'single-file.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                size: 1024,
                filename: 'single-file-123.jpg',
                path: '/uploads/single-file-123.jpg'
            };

            mockUpload.array = jest.fn().mockImplementation((fieldName, maxCount) => {
                return (req: any, res: any, next: any) => {
                    req.files = mockFile; // Single file, not array
                    next();
                };
            });

            const response = await request(app)
                .post('/upload/multiple')
                .attach('files', Buffer.from('fake file'), 'single-file.jpg')
                .expect(200);

            expect(response.body.data.count).toBe(1);
        });
    });

    describe('GET /upload/info/:filename', () => {
        it('should return file info', async () => {
            const filename = 'test-file.jpg';
            const mockStats = {
                size: 1024,
                birthtime: new Date('2023-01-01'),
                mtime: new Date('2023-01-02')
            };

            mockFs.existsSync.mockReturnValue(true);
            mockFs.statSync.mockReturnValue(mockStats as any);

            const response = await request(app)
                .get(`/upload/info/${filename}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.filename).toBe(filename);
            expect(response.body.data.fileUrl).toBe('http://localhost:3000/uploads/test-file.jpg');
            expect(response.body.data.size).toBe(mockStats.size);
        });

        it('should handle file not found', async () => {
            const filename = 'nonexistent-file.jpg';

            mockFs.existsSync.mockReturnValue(false);

            const response = await request(app)
                .get(`/upload/info/${filename}`)
                .expect(404);

            expect(response.body).toEqual({
                success: false,
                message: 'File not found'
            });
        });
    });

    describe('DELETE /upload/:filename', () => {
        it('should delete file successfully', async () => {
            const filename = 'test-file.jpg';

            mockFs.existsSync.mockReturnValue(true);
            mockFs.unlinkSync = jest.fn();

            const response = await request(app)
                .delete(`/upload/${filename}`)
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: 'File deleted successfully'
            });

            expect(mockFs.unlinkSync).toHaveBeenCalled();
        });

        it('should handle file not found for deletion', async () => {
            const filename = 'nonexistent-file.jpg';

            mockFs.existsSync.mockReturnValue(false);

            const response = await request(app)
                .delete(`/upload/${filename}`)
                .expect(404);

            expect(response.body).toEqual({
                success: false,
                message: 'File not found'
            });
        });
    });

    describe('Authentication', () => {
        it('should require authentication for all routes', async () => {
            // Mock middleware to simulate no authentication
            mockAuthMiddleware.mockImplementation((req, res, next) => {
                res.status(401).json({ success: false, message: 'Unauthorized' });
            });

            const routes = [
                { method: 'post', path: '/upload/avatar' },
                { method: 'post', path: '/upload/image' },
                { method: 'post', path: '/upload/file' },
                { method: 'post', path: '/upload/multiple' },
                { method: 'get', path: '/upload/info/test-file.jpg' },
                { method: 'delete', path: '/upload/test-file.jpg' }
            ];

            for (const route of routes) {
                const response = await (request(app) as any)[route.method](route.path).expect(401);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toBe('Unauthorized');
            }
        });
    });

    describe('Error Handling', () => {
        it('should handle file system errors', async () => {
            mockFs.existsSync.mockImplementation(() => {
                throw new Error('File system error');
            });

            const response = await request(app)
                .get('/upload/info/test-file.jpg')
                .expect(500);

            expect(response.body.success).toBe(false);
        });

        it('should handle multer errors', async () => {
            mockUploadAvatar.single = jest.fn().mockImplementation((fieldName) => {
                return (req: any, res: any, next: any) => {
                    const error = new Error('File too large');
                    (error as any).code = 'LIMIT_FILE_SIZE';
                    next(error);
                };
            });

            const response = await request(app)
                .post('/upload/avatar')
                .attach('avatar', Buffer.from('fake image data'), 'avatar.jpg')
                .expect(500);

            expect(response.body.success).toBe(false);
        });
    });

    describe('File Size and Type Validation', () => {
        it('should handle oversized files', async () => {
            mockUploadAvatar.single = jest.fn().mockImplementation((fieldName) => {
                return (req: any, res: any, next: any) => {
                    const error = new Error('File too large');
                    (error as any).code = 'LIMIT_FILE_SIZE';
                    next(error);
                };
            });

            const response = await request(app)
                .post('/upload/avatar')
                .attach('avatar', Buffer.from('fake large image data'), 'large-avatar.jpg')
                .expect(500);

            expect(response.body.success).toBe(false);
        });

        it('should handle unsupported file types', async () => {
            mockUploadAvatar.single = jest.fn().mockImplementation((fieldName) => {
                return (req: any, res: any, next: any) => {
                    const error = new Error('Unsupported file type');
                    (error as any).code = 'LIMIT_UNEXPECTED_FILE';
                    next(error);
                };
            });

            const response = await request(app)
                .post('/upload/avatar')
                .attach('avatar', Buffer.from('fake file data'), 'document.exe')
                .expect(500);

            expect(response.body.success).toBe(false);
        });
    });
});
