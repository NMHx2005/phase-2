import express from 'express';
import { upload, uploadAvatar, uploadImage, processAvatar, getFileUrl, handleUploadError } from '../middleware/upload.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { User } from '../models/user.model';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Apply authentication middleware to all upload routes
router.use(authMiddleware);

// Upload avatar
router.post('/avatar', uploadAvatar.single('avatar'), async (req: any, res: any) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No avatar file provided'
            });
        }

        const userId = req.user.userId;
        const originalPath = req.file.path;
        const processedPath = originalPath.replace(/\.[^/.]+$/, '_processed.jpg');

        // Process avatar (resize to 200x200)
        const processed = await processAvatar(originalPath, processedPath);

        if (!processed) {
            // Clean up original file if processing failed
            fs.unlinkSync(originalPath);
            return res.status(500).json({
                success: false,
                message: 'Failed to process avatar image'
            });
        }

        // Delete original file, keep processed one
        fs.unlinkSync(originalPath);

        // Get file URL
        const fileUrl = getFileUrl(req, processedPath);

        // Update user avatar in database
        // Update user avatar - handled by user service
        // await userService.updateAvatar(userId, fileUrl);

        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: {
                avatarUrl: fileUrl,
                filename: path.basename(processedPath)
            }
        });

    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload avatar'
        });
    }
}, handleUploadError);

// Upload image (for chat messages)
router.post('/image', uploadImage.single('image'), async (req: any, res: any) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const fileUrl = getFileUrl(req, req.file.path);

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                imageUrl: fileUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimeType: req.file.mimetype
            }
        });

    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image'
        });
    }
}, handleUploadError);

// Upload file (for chat messages)
router.post('/file', upload.single('file'), async (req: any, res: any) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file provided'
            });
        }

        const fileUrl = getFileUrl(req, req.file.path);

        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                fileUrl: fileUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimeType: req.file.mimetype
            }
        });

    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload file'
        });
    }
}, handleUploadError);

// Upload multiple files
router.post('/multiple', upload.array('files', 5), async (req: any, res: any) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files provided'
            });
        }

        const files = Array.isArray(req.files) ? req.files : [req.files];
        const uploadedFiles = files.map((file: any) => ({
            fileUrl: getFileUrl(req, file.path),
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype
        }));

        res.json({
            success: true,
            message: 'Files uploaded successfully',
            data: {
                files: uploadedFiles,
                count: uploadedFiles.length
            }
        });

    } catch (error) {
        console.error('Multiple files upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload files'
        });
    }
}, handleUploadError);

// Get file info
router.get('/info/:filename', async (req: any, res: any) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../../uploads', filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        const stats = fs.statSync(filePath);
        const fileUrl = getFileUrl(req, filePath);

        res.json({
            success: true,
            data: {
                filename: filename,
                fileUrl: fileUrl,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            }
        });

    } catch (error) {
        console.error('Get file info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get file info'
        });
    }
});

// Delete file
router.delete('/:filename', async (req: any, res: any) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../../uploads', filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        fs.unlinkSync(filePath);

        res.json({
            success: true,
            message: 'File deleted successfully'
        });

    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete file'
        });
    }
});

// Serve static files
router.use('/static', express.static(path.join(__dirname, '../../uploads')));

export default router;
